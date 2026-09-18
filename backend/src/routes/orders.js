import { createOrderEngine, sendError } from "../lib/orderEngine.js";

export default function ordersRoutes(app) {
  const { getNextSequence, computeOrderMath, scheduleOrderProgression } =
    createOrderEngine(app);

  // live pricing preview, no writes.
  // ACID transaction
  app.post("/orders/overview", async (request, reply) => {
    const sessionId = request.headers["x-session-id"];
    const { items, coinsToApply, explain } = request.body || {};

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
            oldTier: math.oldTier,
            projectedBalance: math.newBalance,
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
    const { storeId, orderType, items, coinsToApply, explain } =
      request.body || {};

    if (!sessionId)
      return sendError(
        reply,
        400,
        "SESSION_REQUIRED",
        "x-session-id header is required",
      );

    const db = app.mongo.db;
    const mongoSession = db.client.startSession();
    let responsePayload;
    let createdOrderId;

    try {
      await mongoSession.withTransaction(async () => {
        const math = await computeOrderMath(
          db,
          { sessionId, items, coinsToApply },
          mongoSession,
        );

        const orderSeq = await getNextSequence(db, "orderId", mongoSession);
        const txnSeq = await getNextSequence(db, "transactionId", mongoSession);
        const orderId = `MS-${100000 + orderSeq}`;
        const transactionId = `TXN-${90000 + txnSeq}`;
        const now = new Date();

        const orderDoc = {
          orderId,
          sessionId,
          customerId: math.customer.customerId,
          storeId: storeId || null,
          orderType: orderType || "ONLINE",
          purchaseType: "purchase",
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
          customerId: math.customer.customerId,
          status: "completed",
          tenders: [
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
          ],
          createdAt: now,
        };

        await db
          .collection("orders")
          .insertOne(orderDoc, { session: mongoSession });
        await db
          .collection("transactions")
          .insertOne(transactionDoc, { session: mongoSession });

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
            "loyaltyDetails.loyaltyHistory": {
              tierKey: math.newTierKey,
              activatedAt: now,
              previousTier: math.oldTier,
            },
          };
        }

        await db
          .collection("customers")
          .updateOne({ sessionId }, customerUpdate, {
            session: mongoSession,
          });

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
        responsePayload.meta = {
          explain: "N/A — explain not applicable to write operations",
        };
      }

      return reply.send(responsePayload);
    } catch (err) {
      app.log.error(err);
      if (err.code) return sendError(reply, 409, err.code, err.message);
      return sendError(reply, 500, "ORDER_PLACEMENT_FAILED", err.message);
    } finally {
      await mongoSession.endSession();
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
    const sessionId = request.headers["x-session-id"];
    const { orderId } = request.params;

    if (!sessionId)
      return sendError(
        reply,
        400,
        "SESSION_REQUIRED",
        "x-session-id header is required",
      );

    const db = app.mongo.db;

    try {
      const order = await db
        .collection("orders")
        .findOne({ orderId, sessionId });
      if (!order)
        return sendError(
          reply,
          404,
          "ORDER_NOT_FOUND",
          "Order not found for this session",
        );

      const transaction = await db
        .collection("transactions")
        .findOne({ transactionId: order.transactionId });
      if (!transaction)
        return sendError(
          reply,
          404,
          "TRANSACTION_NOT_FOUND",
          "Transaction not found for this order",
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
