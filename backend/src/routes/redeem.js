import { createOrderEngine, sendError } from "../lib/orderEngine.js";

const MAX_REDEEM_CASH_GAP = 25; // BUSINESS RULE

export default function redeemRoutes(app) {
  const { getNextSequence, computeOrderMath, scheduleOrderProgression } = createOrderEngine(app);

  // GET /redeem/candidates — up to `limit` redeem-eligible products this
  // customer can fully or near-fully cover with coins
  app.post("/redeem/candidates", async (request, reply) => {
    const sessionId = request.headers["x-session-id"];
    const { excludeProducts = [], limit = 4, explain } = request.body || {};

    if (!sessionId) return sendError(reply, 400, "SESSION_REQUIRED", "x-session-id header is required");

    const db = app.mongo.db;

    try {
      const customer = await db.collection("customers").findOne({ sessionId });
      if (!customer) return sendError(reply, 404, "CUSTOMER_NOT_FOUND", "No customer found for this session");

      const loyaltyConfig = await db.collection("loyaltyConfiguration").findOne({ sessionId });
      if (!loyaltyConfig) return sendError(reply, 404, "LOYALTY_CONFIG_NOT_FOUND", "No loyalty configuration for this session");

      const tierEntry = loyaltyConfig.rewardDetails.find((t) => t.tierName === customer.loyaltyDetails.activeTier);
      if (!tierEntry) return sendError(reply, 409, "TIER_NOT_FOUND", "Customer's active tier not found in loyalty config");

      const rate = tierEntry.currencyValueForDolar; // coins per dollar at this customer's tier
      const coinBalance = customer.loyaltyDetails.coinBalance;

      const pipeline = [
        { $match: { isRedeemElegible: true, productId: { $nin: excludeProducts } } },
        { $addFields: { priceDouble: { $toDouble: "$price" } } }, // handles Decimal128-stored prices
        { $addFields: { coinsToFullyCover: { $multiply: ["$priceDouble", rate] } } },
        { $addFields: { coinsApplied: { $min: ["$coinsToFullyCover", coinBalance] } } },
        {
          $addFields: {
            cash: { $max: [0, { $subtract: ["$priceDouble", { $divide: ["$coinsApplied", rate] }] }] },
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

      const products = await db.collection("products").aggregate(pipeline).toArray();

      const response = { data: { products, maxAmountOfCash: MAX_REDEEM_CASH_GAP } };

      if (explain === true) {
        response.meta = { explain: await db.collection("products").aggregate(pipeline).explain("executionStats") };
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
    const { items, coinsToApply, explain } = request.body || {};

    if (!sessionId) return sendError(reply, 400, "SESSION_REQUIRED", "x-session-id header is required");
    if (!coinsToApply || coinsToApply <= 0)
      return sendError(reply, 400, "COINS_REQUIRED", "coinsToApply is required and must be greater than 0");

    const db = app.mongo.db;
    const mongoSession = db.client.startSession();
    let responsePayload;
    let createdOrderId;

    try {
      await mongoSession.withTransaction(async () => {
        const math = await computeOrderMath(
          db,
          { sessionId, items, coinsToApply, requireRedeemEligible: true },
          mongoSession
        );
        const customerId = math.customer.customerId;

        const orderSeq = await getNextSequence(db, "orderId", mongoSession);
        const txnSeq = await getNextSequence(db, "transactionId", mongoSession);
        const orderId = `MS-${100000 + orderSeq}`;
        const transactionId = `TXN-${90000 + txnSeq}`;
        const now = new Date();

        const orderDoc = {
          orderId,
          sessionId,
          customerId,
          storeId: null,
          orderType: "ONLINE",
          items: math.resolvedItems,
          amountSummary: math.amountSummary,
          transactionId,
          coinsApplied: math.coinsApplied,
          coinsToDollarsApplied: math.coinsToDollarsApplied,
          coinsEarned: math.coinsEarned,
          currentStatus: "placed",
          statusHistory: [{ Status: "placed", lastUpdated: now }],
          createdAt: now,
        };

        const transactionDoc = {
          transactionId,
          orderId,
          sessionId,
          customerId,
          type: "redeem", // only real difference from POST /orders' persisted shape
          status: "completed",
          tenders: [
            ...(math.coinsApplied > 0
              ? [{ method: "coins", rewardsApplied: math.coinsApplied, rewardsInCurrency: math.coinsToDollarsApplied }]
              : []),
            ...(math.amountSummary.total > 0 ? [{ method: "card", amount: math.amountSummary.total }] : []),
          ],
          loyalty: { rewardsRedeemed: math.coinsApplied, rewardsEarned: math.coinsEarned, balanceAfter: math.newBalance },
          createdAt: now,
        };

        await db.collection("orders").insertOne(orderDoc, { session: mongoSession });
        await db.collection("transactions").insertOne(transactionDoc, { session: mongoSession });

        const customerUpdate = {
          $set: {
            "loyaltyDetails.coinBalance": math.newBalance,
            "loyaltyDetails.activeTier": math.newTierKey,
            "loyaltyDetails.nextTier": math.nextTierKey,
          },
          $inc: {
            "loyaltyDetails.lifetimeCoins": math.coinsEarned,
            cumulativeSpend: math.qualifyingSpend,
            ordersCount: 1,
          },
        };
        if (math.tierChanged) {
          customerUpdate.$push = {
            "loyaltyDetails.loyaltyHistory": { tierKey: math.newTierKey, activatedAt: now, previousTier: math.oldTier },
          };
        }

        await db.collection("customers").updateOne({ sessionId }, customerUpdate, { session: mongoSession });

        createdOrderId = orderId;

        responsePayload = {
          data: {
            order: orderDoc,
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
      });

      scheduleOrderProgression(createdOrderId);

      if (explain === true) {
        responsePayload.meta = { explain: "N/A — explain not applicable to write operations" };
      }

      return reply.send(responsePayload);
    } catch (err) {
      app.log.error(err);
      if (err.code) return sendError(reply, 409, err.code, err.message);
      return sendError(reply, 500, "REDEEM_FAILED", err.message);
    } finally {
      await mongoSession.endSession();
    }
  });
}