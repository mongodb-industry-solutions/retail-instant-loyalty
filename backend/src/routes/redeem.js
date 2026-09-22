import { createOrderEngine, sendError } from "../lib/orderEngine.js";
import { createLoyaltyEngine } from "../lib/loyaltyEngine.js";

const MAX_REDEEM_CASH_GAP = 25; // BUSINESS RULE

export default function redeemRoutes(app) {
  const {
    getNextSequence,
    computeOrderMath,
    scheduleOrderProgression,
    processPayment,
  } = createOrderEngine(app);
  const { buildLoyaltyHistoryEntries, buildCustomerLoyaltyDetailsUpdate } = createLoyaltyEngine(app);

  // GET /redeem/candidates — up to `limit` redeem-eligible products this
  // customer can fully or near-fully cover with coins
  app.post("/redeem/candidates", async (request, reply) => {
    const sessionId = request.headers["x-session-id"];
    const { excludeProducts = [], limit = 4, explain } = request.body || {};

    if (!sessionId)
      return sendError(
        reply,
        400,
        "SESSION_REQUIRED",
        "x-session-id header is required",
      );

    const db = app.mongo.db;

    try {
      const customer = await db.collection("customers").findOne({ sessionId });
      if (!customer)
        return sendError(
          reply,
          404,
          "CUSTOMER_NOT_FOUND",
          "No customer found for this session",
        );

      const loyaltyConfig = await db
        .collection("loyaltyConfiguration")
        .findOne({ sessionId });
      if (!loyaltyConfig)
        return sendError(
          reply,
          404,
          "LOYALTY_CONFIG_NOT_FOUND",
          "No loyalty configuration for this session",
        );

      const tierEntry = loyaltyConfig.rewardDetails.find(
        (t) => t.tierName === customer.loyaltyDetails.activeTier,
      );
      if (!tierEntry)
        return sendError(
          reply,
          409,
          "TIER_NOT_FOUND",
          "Customer's active tier not found in loyalty config",
        );

      const rate = tierEntry.currencyValueForDollar; // coins per dollar at this customer's tier
      const coinBalance = customer.loyaltyDetails.coinBalance;

      const pipeline = [
        {
          $match: {
            isRedeemElegible: true,
            productId: { $nin: excludeProducts },
          },
        },
        { $addFields: { priceDouble: { $toDouble: "$price" } } }, // handles Decimal128-stored prices
        {
          $addFields: {
            coinsToFullyCover: { $multiply: ["$priceDouble", rate] },
          },
        },
        {
          $addFields: {
            coinsApplied: { $min: ["$coinsToFullyCover", coinBalance] },
          },
        },
        {
          $addFields: {
            cash: {
              $max: [
                0,
                {
                  $subtract: [
                    "$priceDouble",
                    { $divide: ["$coinsApplied", rate] },
                  ],
                },
              ],
            },
          },
        },
        { $match: { cash: { $lte: MAX_REDEEM_CASH_GAP } } },
        { $sort: { cash: 1 } }, // closest to fully coin-covered first
        { $limit: Number(limit) },
        {
          $project: {
            _id: 0,
            productId: 1,
            name: 1,
            category: 1,
            imageURL: 1,
            price: "$priceDouble",
            coins: { $round: ["$coinsApplied", 0] },
            cash: { $round: ["$cash", 2] },
          },
        },
      ];

      const products = await db
        .collection("products")
        .aggregate(pipeline)
        .toArray();

      const response = {
        data: { products, maxAmountOfCash: MAX_REDEEM_CASH_GAP },
      };

      if (explain === true) {
        response.meta = {
          explain: await db
            .collection("products")
            .aggregate(pipeline)
            .explain("executionStats"),
        };
      }

      return reply.send(response);
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "REDEEM_CANDIDATES_FAILED", err.message);
    }
  });

  // POST /redeem — same shape as POST /orders, with redeem-eligibility
  // enforced and coinsToApply required
  app.post("/redeem", async (request, reply) => {
    const sessionId = request.headers["x-session-id"];
    const {
      items,
      coinsToApply,
      validCard = true,
      explain,
    } = request.body || {};

    if (!sessionId)
      return sendError(
        reply,
        400,
        "SESSION_REQUIRED",
        "x-session-id header is required",
      );
    if (!coinsToApply || coinsToApply <= 0)
      return sendError(
        reply,
        400,
        "COINS_REQUIRED",
        "coinsToApply is required and must be greater than 0",
      );

    const db = app.mongo.db;

    try {
      // 1. Pure validation + pricing - no writes yet.
      const math = await computeOrderMath(db, {
        sessionId,
        items,
        coinsToApply,
        requireRedeemEligible: true,
      });
      const customerId = math.customer.customerId;

      // 2. Create the order eagerly, before we know the payment outcome
      // (or before we know there's no payment step needed at all).
      const orderSeq = await getNextSequence(db, "orderId");
      const orderId = `MS-${100000 + orderSeq}`;
      const now = new Date();

      const isFullyCoinCovered = math.amountSummary.total === 0;

      const orderDoc = {
        orderId,
        sessionId,
        customerId,
        storeId: null,
        orderType: "ONLINE",
        purchaseType: "redeem",
        items: math.resolvedItems,
        amountSummary: math.amountSummary,
        coinsApplied: math.coinsApplied,
        coinsToDollarsApplied: math.coinsToDollarsApplied,
        coinsEarned: math.coinsEarned,
        currentStatus: isFullyCoinCovered ? "placed" : "authorizing",
        statusHistory: [
          {
            Status: isFullyCoinCovered ? "placed" : "authorizing",
            lastUpdated: now,
          },
        ],
        createdAt: now,
      };

      await db.collection("orders").insertOne(orderDoc);

      // 3. Only call the payment step if there's actually a cash portion to
      // charge. A $0 charge has nothing to decline - skip straight to success.
      const outcome = isFullyCoinCovered
        ? "approved"
        : await processPayment(validCard);

      const txnSeq = await getNextSequence(db, "transactionId");
      const transactionId = `TXN-${90000 + txnSeq}`;
      const settledAt = new Date();

      const tenders = [
        ...(math.coinsApplied > 0
          ? [
              {
                method: "coins",
                rewardsApplied: math.coinsApplied,
                rewardsInCurrency: math.coinsToDollarsApplied,
              },
            ]
          : []),
        ...(math.amountSummary.total > 0
          ? [
              {
                method: "card",
                amount: math.amountSummary.total,
                paymentDetails: math.customer.paymentDetails,
              },
            ]
          : []),
      ];

      if (outcome === "declined") {
        await db.collection("transactions").insertOne({
          transactionId,
          orderId,
          sessionId,
          customerId,
          status: "failed",
          tenders,
          createdAt: settledAt,
        });

        await db.collection("orders").updateOne(
          { orderId },
          {
            $set: {
              currentStatus: "payment_failed",
              failureReason: "card_declined",
            },
            $push: {
              statusHistory: {
                Status: "payment_failed",
                lastUpdated: settledAt,
              },
            },
          },
        );

        // No customer update, no loyaltyHistory, no coins ever left the
        // balance - the redemption simply didn't happen.
        return sendError(
          reply,
          402,
          "PAYMENT_DECLINED",
          `Payment was declined for redemption ${orderId}`,
        );
      }

      // 4. Success - completed transaction, loyalty block included (matches
      // the "only on success" decision from POST /orders).
      await db.collection("transactions").insertOne({
        transactionId,
        orderId,
        sessionId,
        customerId,
        status: "completed",
        tenders,
        loyalty: {
          rewardsRedeemed: math.coinsApplied,
          rewardsEarned: math.coinsEarned,
          balanceAfter: math.newBalance,
        },
        createdAt: settledAt,
      });

      // 5. Atomic pair: customer loyalty state + its ledger entries.
      const mongoSession = db.client.startSession();
      try {
        await mongoSession.withTransaction(async () => {
          const historyEntries = buildLoyaltyHistoryEntries({
            math,
            orderId,
            transactionId,
            customerId,
            sessionId,
            now: settledAt,
          });

          if (historyEntries.length > 0) {
            await db
              .collection("loyaltyHistory")
              .insertMany(historyEntries, { session: mongoSession });
          }

          const customerUpdatePipeline = buildCustomerLoyaltyDetailsUpdate({ math });

          await db
            .collection("customers")
            .updateOne({ sessionId }, customerUpdatePipeline, {
              session: mongoSession,
            });
        });
      } finally {
        await mongoSession.endSession();
      }

      // 6. Only flip to "placed" here if it wasn't already (fully-coin-covered
      // orders skipped straight to "placed" at creation - don't re-push a
      // duplicate statusHistory entry for the same status).
      if (!isFullyCoinCovered) {
        await db.collection("orders").updateOne(
          { orderId },
          {
            $set: { currentStatus: "placed" },
            $push: {
              statusHistory: { Status: "placed", lastUpdated: settledAt },
            },
          },
        );
      }

      scheduleOrderProgression(orderId);

      const responsePayload = {
        data: {
          order: { ...orderDoc, currentStatus: "placed", transactionId },
          loyalty: {
            oldBalance: math.oldBalance,
            newBalance: math.newBalance,
            oldTier: math.oldTier,
            newTier: math.newTierKey,
            multiplier: math.multiplier,
            dollarsNeededForNextTier: math.dollarsNeededForNextTier,
            qualifyingSpend: math.qualifyingSpend,
          },
        },
      };

      if (explain === true) {
        responsePayload.meta = {
          explain: "N/A — explain not applicable to write operations",
        };
      }

      return reply.send(responsePayload);
    } catch (err) {
      app.log.error(err);
      if (err.code) return sendError(reply, 409, err.code, err.message);
      return sendError(reply, 500, "REDEEM_FAILED", err.message);
    }
  });
}
