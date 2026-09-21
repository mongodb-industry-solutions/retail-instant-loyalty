import { createOrderEngine, sendError } from "../lib/orderEngine.js";

export default function ordersRoutes(app) {
<<<<<<< HEAD
  const { getNextSequence, computeOrderMath, scheduleOrderProgression } =
    createOrderEngine(app);
=======
  const {
    getNextSequence,
    computeOrderMath,
    scheduleOrderProgression,
    processPayment,
    buildLoyaltyHistoryEntries,
  } = createOrderEngine(app);
>>>>>>> origin/back/apis

  // live pricing preview, no writes.
  // ACID transaction
  app.post("/orders/overview", async (request, reply) => {
    const sessionId = request.headers["x-session-id"];
    const { items, coinsToApply, explain = false } = request.body || {};
    console.log("🔌 Orders Overview: ", { items, coinsToApply, explain });

    if (!sessionId)
      return sendError(
        reply,
        400,
        "SESSION_REQUIRED",
        "x-session-id header is required",
      );

    const db = app.mongo.db;

    try {
      const math = await computeOrderMath(db, {
        sessionId,
        items,
        coinsToApply,
      });

      const response = {
        data: {
          order: {
            items: math.resolvedItems,
            amountSummary: math.amountSummary,
            coinsApplied: math.coinsApplied,
            coinsToDollarsApplied: math.coinsToDollarsApplied,
            coinsEarned: math.coinsEarned,
          },
          loyalty: {
            oldBalance: math.oldBalance,
            projectedBalance: math.newBalance,
            oldTier: math.oldTier,
            projectedTier: math.newTierKey,
            multiplier: math.multiplier,
            dollarsNeededForNextTier: math.dollarsNeededForNextTier,
            qualifyingSpend: math.qualifyingSpend,
          },
        },
      };

      if (explain === true) {
        response.meta = {
          explain: "N/A — no query/aggregation to explain on this read pattern",
        };
      }

      return reply.send(response);
    } catch (err) {
      if (err.code) return sendError(reply, 409, err.code, err.message);
      app.log.error(err);
      return sendError(reply, 500, "ORDER_OVERVIEW_FAILED", err.message);
    }
  });

  // Commits what /orders/overview would have previewed
  app.post("/orders", async (request, reply) => {
    const sessionId = request.headers["x-session-id"];
    const {
      storeId,
      orderType,
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

    const db = app.mongo.db;

    try {
      // 1. Pure validation + pricing - no writes yet. Throws if the request
      // is invalid (bad items, insufficient balance, etc)
      const math = await computeOrderMath(db, {
        sessionId,
        items,
        coinsToApply,
      });
      const customerId = math.customer.customerId;

      // 2. Create the order eagerly, before we know the payment outcome.
      // Not wrapped in a transaction - it's a single document, and a real
      // retailer's equivalent order-created-pending-payment state is exactly
      // this: a real, recoverable, expected transient state.
      const orderSeq = await getNextSequence(db, "orderId");
      const orderId = `MS-${100000 + orderSeq}`;
      const now = new Date();

      const isFullyCoinCovered = math.amountSummary.total === 0;

      const orderDoc = {
        orderId,
        sessionId,
        customerId,
        storeId: storeId || null,
        orderType: orderType || "ONLINE",
        purchaseType: "purchase",
        items: math.resolvedItems,
        amountSummary: math.amountSummary,
        coinsApplied: math.coinsApplied,
        coinsToDollarsApplied: math.coinsToDollarsApplied,
        coinsEarned: math.coinsEarned,
        currentStatus: "authorizing",
        statusHistory: [{ Status: "authorizing", lastUpdated: now }],
        createdAt: now,
      };

      await db.collection("orders").insertOne(orderDoc);

      // 3. "Call" the payment processor. Outside any transaction, deliberately -
      // in production this is a real network call to a bank/processor and a
      // Mongo transaction should never hold open across it.
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
        // Record the failed attempt - this is real business data (decline
        // analytics, retry prompts), not an error state to hide.
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

        // No customer update, no loyaltyHistory - nothing loyalty-related
        // happened. No scheduleOrderProgression call - nothing to progress.
        return sendError(
          reply,
          402,
          "PAYMENT_DECLINED",
          `Payment was declined for order ${orderId}`,
        );
      }

      // 4. Payment succeeded. Insert the completed transaction (outside the
      // transaction below - it's independent of the customer/loyaltyHistory
      // pair, and its own insert can't meaningfully "roll back" anything).
      await db.collection("transactions").insertOne({
        transactionId,
        orderId,
        sessionId,
        customerId,
        status: "completed",
        tenders,
        createdAt: settledAt,
      });

      // 5. The only part that actually needs atomicity: the customer's
      // loyalty state and its ledger entries must never disagree with each
      // other. This is the one place a partial write would be genuinely
      // dangerous (silent, unexplainable balance drift) rather than just an
      // expected in-flight state.
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

          const customerUpdate = {
            $set: {
              "loyaltyDetails.coinBalance": math.newBalance,
              "loyaltyDetails.activeTier": math.newTierKey,
              "loyaltyDetails.nextTier": math.nextTierKey,
              "loyaltyDetails.cumulativeSpendDollars":
                math.newCumulativeSpendDollars,
            },
            $inc: { "loyaltyDetails.ordersCount": 1 },
          };
          if (math.tierChanged) {
            customerUpdate.$push = {
              "loyaltyDetails.loyaltyHistory": {
                tierKey: math.newTierKey,
                activatedAt: settledAt,
                previousTier: math.oldTier,
              },
            };
          }

          await db
            .collection("customers")
            .updateOne({ sessionId }, customerUpdate, {
              session: mongoSession,
            });
        });
      } finally {
        await mongoSession.endSession();
      }

      // 6. Only now, after the transaction committed, flip the order to
      // "placed" and start its fulfillment clock.
      await db.collection("orders").updateOne(
        { orderId },
        {
          $set: { currentStatus: "placed" },
          $push: {
            statusHistory: { Status: "placed", lastUpdated: settledAt },
          },
        },
      );

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
      return sendError(reply, 500, "ORDER_PLACEMENT_FAILED", err.message);
    }
  });

  // Order history list for this customer
  app.get("/orders", async (request, reply) => {
    const customerId = request.headers["x-customer-id"];
    const { page = 1, limit = 20, explain } = request.query || {};

    if (!customerId)
      return sendError(
        reply,
        400,
        "CUSTOMER_ID_REQUIRED",
        "x-customer-id header is required",
      );

    const db = app.mongo.db;

    try {
      const customer = await db.collection("customers").findOne({ customerId });
      if (!customer)
        return sendError(
          reply,
          404,
          "CUSTOMER_NOT_FOUND",
          "No customer found for this customer ID",
        );

      const filter = { customerId: customer.customerId };

      const skip = (Number(page) - 1) * Number(limit);
      const [orders, totalCount] = await Promise.all([
        db
          .collection("orders")
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .toArray(),
        db.collection("orders").countDocuments(filter),
      ]);

      const response = { data: { orders, page: Number(page), totalCount } };

      if (explain === "true") {
        response.meta = {
          explain: await db
            .collection("orders")
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .explain("executionStats"),
        };
      }

      return reply.send(response);
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "ORDERS_LOOKUP_FAILED", err.message);
    }
  });

  // GET /orders/:orderId — single order detail
  app.get("/orders/:orderId", async (request, reply) => {
    const customerId = request.headers["x-customer-id"];
    const { orderId } = request.params;

    if (!customerId)
      return sendError(
        reply,
        400,
        "CUSTOMER_ID_REQUIRED",
        "x-customer-id header is required",
      );

    const db = app.mongo.db;

    try {
      const order = await db
        .collection("orders")
        .findOne({ orderId, customerId });
      if (!order)
        return sendError(
          reply,
          404,
          "ORDER_NOT_FOUND",
          "Order not found for this customer",
        );

      const transaction = await db
        .collection("transactions")
        .findOne({ transactionId: order.transactionId });
      if (!transaction)
        return sendError(
          reply,
          404,
          "TRANSACTION_NOT_FOUND",
          "Transaction not found for this customer's order",
        );
      return reply.send({
        data: { ...order, tenders: transaction.tenders || [] },
      });
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "ORDER_LOOKUP_FAILED", err.message);
    }
  });
}
