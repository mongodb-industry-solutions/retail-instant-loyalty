const STATUS_SEQUENCE = ["placed", "processing", "shipped", "delivered"];
const ADVANCE_INTERVAL_MS = 2000;
const TAX_RATE = 0.085;

export default function ordersRoutes(app) {
  function sendError(reply, status, code, message) {
    return reply.code(status).send({ error: { code, message } });
  }

  async function getNextSequence(db, name, session) {
    const result = await db
      .collection("counters")
      .findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after", session },
      );
    return result.seq;
  }

  function resolveTier(rewardDetails, cumulativeSpend) {
    const sorted = [...rewardDetails].sort(
      (a, b) => a.tierThreshold - b.tierThreshold,
    );

    let currentIndex = 0; // floor - lowest tier, even if its own threshold isn't yet met
    for (let i = 0; i < sorted.length; i++) {
      if (cumulativeSpend >= sorted[i].tierThreshold) {
        currentIndex = i;
      }
    }

    const current = sorted[currentIndex];
    const next = sorted[currentIndex + 1] || null;

    return {
      tierKey: current.tierName,
      currencyValueForDolar: current.currencyValueForDolar,
      nextTierKey: next ? next.tierName : null,
      dollarsNeededForNextTier: next
        ? Math.max(0, next.tierThreshold - cumulativeSpend)
        : 0,
    };
  }

  // Shared pricing/loyalty math - used by both /orders/overview (read-only)
  // and POST /orders (which persists what this returns). Never trusts
  // client-sent price/tier - always reads live products + the customer's
  // actual loyaltyDetails.
  async function computeOrderMath(
    db,
    { sessionId, items, coinsToApply },
    session,
  ) {
    const customer = await db
      .collection("customers")
      .findOne({ sessionId }, { session });
    if (!customer)
      throw {
        code: "CUSTOMER_NOT_FOUND",
        message: "Customer not found for this session",
      };
    if (customer.loyaltyDetails.coinBalance < coinsToApply)
      throw {
        code: "INSUFFICIENT_BALANCE",
        message: "Customer does not have enough loyalty coins to apply",
      };

    const loyaltyConfig = await db
      .collection("loyaltyConfiguration")
      .findOne({ sessionId }, { session });
    if (!loyaltyConfig)
      throw {
        code: "LOYALTY_CONFIG_NOT_FOUND",
        message: "No loyalty configuration for this session",
      };

    const activeCampaign = (loyaltyConfig.campaign || []).find(
      (c) => c.isActive,
    );
    const multiplier = activeCampaign ? activeCampaign.multiplier : 1;

    if (!Array.isArray(items) || items.length === 0) {
      throw {
        code: "ITEMS_REQUIRED",
        message: "at least one item is required",
      };
    }

    const productIds = items.map((i) => i.productId);
    const products = await db
      .collection("products")
      .find({ productId: { $in: productIds } }, { session })
      .toArray();
    const productMap = new Map(products.map((p) => [p.productId, p]));

    let subtotal = 0;
    const resolvedItems = items.map((requested) => {
      const product = productMap.get(requested.productId);
      if (!product)
        throw {
          code: "PRODUCT_NOT_FOUND",
          message: `Product ${requested.productId} not found`,
        };

      const unitPrice = Number(product.price.toString());
      const lineTotal = unitPrice * requested.quantity;
      subtotal += lineTotal;

      return {
        productId: product.productId,
        name: product.name,
        imageUrl: product.imageURL,
        quantity: requested.quantity,
        unitPrice,
        lineTotal,
      };
    });

    const currentTierKey = customer.loyaltyDetails.activeTier;
    const tierEntry = loyaltyConfig.rewardDetails.find(
      (t) => t.tierName === currentTierKey,
    );
    if (!tierEntry)
      throw {
        code: "TIER_NOT_FOUND",
        message: `Customer's active tier ${currentTierKey} not found in loyalty config`,
      };

    const oldBalance = customer.loyaltyDetails.coinBalance;
    const requestedCoins = coinsToApply || 0;

    const coinsToDollarsApplied =
      requestedCoins / tierEntry.currencyValueForDolar;
    const qualifyingSpend = Math.max(0, subtotal - coinsToDollarsApplied);
    const tax = qualifyingSpend * TAX_RATE;
    const shipping = 0; // ASSUMPTION
    const total = qualifyingSpend + tax + shipping;
    const coinsEarned = Math.round(qualifyingSpend * multiplier);

    const oldTier = currentTierKey;
    const newCumulativeSpend =
      (customer.cumulativeSpend || 0) + qualifyingSpend;
    const resolved = resolveTier(
      loyaltyConfig.rewardDetails,
      newCumulativeSpend,
    );
    const newBalance = oldBalance - requestedCoins + coinsEarned;
    const tierChanged = resolved.tierKey !== oldTier;

    return {
      customer,
      loyaltyConfig,
      resolvedItems,
      amountSummary: {
        subtotal,
        coinsDiscountValue: coinsToDollarsApplied,
        tax,
        shipping,
        total,
      },
      coinsApplied: requestedCoins,
      coinsToDollarsApplied,
      coinsEarned,
      qualifyingSpend,
      multiplier,
      oldBalance,
      oldTier,
      newBalance,
      newTierKey: resolved.tierKey,
      nextTierKey: resolved.nextTierKey,
      tierChanged,
      dollarsNeededForNextTier: resolved.dollarsNeededForNextTier,
    };
  }

  function scheduleOrderProgression(orderId, startIndex = 0) {
    if (startIndex >= STATUS_SEQUENCE.length - 1) return;

    setTimeout(async () => {
      const db = app.mongo.db;
      const nextStatus = STATUS_SEQUENCE[startIndex + 1];

      try {
        await db.collection("orders").updateOne(
          { orderId },
          {
            $set: { currentStatus: nextStatus },
            $push: {
              statusHistory: { Status: nextStatus, lastUpdated: new Date() },
            },
          },
        );
      } catch (err) {
        app.log.error(err);
        return;
      }

      scheduleOrderProgression(orderId, startIndex + 1);
    }, ADVANCE_INTERVAL_MS);
  }

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
          type: "purchase",
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
              ? [{ method: "card", amount: math.amountSummary.total }]
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
    const sessionId = request.headers["x-session-id"];
    const { page = 1, limit = 20, explain } = request.query || {};

    if (!sessionId)
      return sendError(reply, 400, "SESSION_REQUIRED", "x-session-id header is required");

    const db = app.mongo.db;

    try {
      const customer = await db.collection("customers").findOne({ sessionId });
      if (!customer)
        return sendError(reply, 404, "CUSTOMER_NOT_FOUND", "No customer found for this session");

      const filter = { sessionId, customerId: customer.customerId };

      const skip = (Number(page) - 1) * Number(limit);
      const [orders, totalCount] = await Promise.all([
        db.collection("orders").find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).toArray(),
        db.collection("orders").countDocuments(filter),
      ]);

      const response = { data: { orders, page: Number(page), totalCount } };

      if (explain === "true") {
        response.meta = {
          explain: await db.collection("orders").find(filter).sort({ createdAt: -1 }).limit(Number(limit)).explain("executionStats"),
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
      return reply.send({ data: order });
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "ORDER_LOOKUP_FAILED", err.message);
    }
  });
}
