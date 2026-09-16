export const STATUS_SEQUENCE = ["placed", "processing", "shipped", "delivered"];
export const ADVANCE_INTERVAL_MS = 2000;
export const TAX_RATE = 0.085;

export function sendError(reply, status, code, message) {
  return reply.code(status).send({ error: { code, message } });
}

// Factory - needs `app` for db access and scheduling. Both orders.js and
// redeem.js call this to get the exact same pricing/tier/persistence logic,
// so the two routes can never drift out of sync with each other.
export function createOrderEngine(app) {
  async function getNextSequence(db, name, session) {
    const result = await db.collection("counters").findOneAndUpdate(
      { _id: name },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after", session }
    );
    return result.seq;
  }

  function resolveTier(rewardDetails, cumulativeSpend) {
    const sorted = [...rewardDetails].sort((a, b) => a.tierThreshold - b.tierThreshold);

    let currentIndex = 0; // floor - lowest tier, even if its own threshold isn't yet met
    for (let i = 0; i < sorted.length; i++) {
      if (cumulativeSpend >= sorted[i].tierThreshold) currentIndex = i;
    }

    const current = sorted[currentIndex];
    const next = sorted[currentIndex + 1] || null;

    return {
      tierKey: current.tierName,
      currencyValueForDolar: current.currencyValueForDolar,
      nextTierKey: next ? next.tierName : null,
      dollarsNeededForNextTier: next ? Math.max(0, next.tierThreshold - cumulativeSpend) : 0,
    };
  }

  // Shared pricing/loyalty math. Used by /orders/overview, POST /orders, and
  // POST /redeem. Never trusts client-sent price/tier - always reads live
  // products + the customer's actual loyaltyDetails.
  //
  // requireRedeemEligible: when true (redeem flow only), every item must
  // have isRedeemElegible: true on its product doc, or the whole request fails.
  async function computeOrderMath(
    db,
    { sessionId, items, coinsToApply, requireRedeemEligible = false },
    session
  ) {
    const customer = await db.collection("customers").findOne({ sessionId }, { session });
    if (!customer) throw { code: "CUSTOMER_NOT_FOUND", message: "Customer not found for this session" };
    if (customer.loyaltyDetails.coinBalance < coinsToApply)
      throw { code: "INSUFFICIENT_BALANCE", message: "Customer does not have enough loyalty coins to apply" };

    const loyaltyConfig = await db.collection("loyaltyConfiguration").findOne({ sessionId }, { session });
    if (!loyaltyConfig) throw { code: "LOYALTY_CONFIG_NOT_FOUND", message: "No loyalty configuration for this session" };

    const activeCampaign = (loyaltyConfig.campaign || []).find((c) => c.isActive);
    const multiplier = activeCampaign ? activeCampaign.multiplier : 1;

    if (!Array.isArray(items) || items.length === 0) {
      throw { code: "ITEMS_REQUIRED", message: "at least one item is required" };
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
      if (!product) throw { code: "PRODUCT_NOT_FOUND", message: `Product ${requested.productId} not found` };

      if (requireRedeemEligible && product.isRedeemElegible !== true) {
        throw { code: "PRODUCT_NOT_REDEEMABLE", message: `Product ${requested.productId} is not redeem-eligible` };
      }

      // Explicit conversion - product.price may be stored as Decimal128
      const unitPrice = Number(product.price?.toString?.() ?? product.price);
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
    const tierEntry = loyaltyConfig.rewardDetails.find((t) => t.tierName === currentTierKey);
    if (!tierEntry) throw { code: "TIER_NOT_FOUND", message: `Customer's active tier ${currentTierKey} not found in loyalty config` };

    const oldBalance = customer.loyaltyDetails.coinBalance;
    const requestedCoins = coinsToApply || 0;

    const coinsToDollarsApplied = requestedCoins / tierEntry.currencyValueForDolar;
    const qualifyingSpend = Math.max(0, subtotal - coinsToDollarsApplied);
    const tax = qualifyingSpend * TAX_RATE;
    const shipping = 0; // ASSUMPTION
    const total = qualifyingSpend + tax + shipping;
    const coinsEarned = Math.round(qualifyingSpend * multiplier);

    const oldTier = currentTierKey;
    const newCumulativeSpend = (customer.cumulativeSpend || 0) + qualifyingSpend;
    const resolved = resolveTier(loyaltyConfig.rewardDetails, newCumulativeSpend);
    const newBalance = oldBalance - requestedCoins + coinsEarned;
    const tierChanged = resolved.tierKey !== oldTier;

    return {
      customer,
      loyaltyConfig,
      resolvedItems,
      amountSummary: { subtotal, coinsDiscountValue: coinsToDollarsApplied, tax, shipping, total },
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
            $push: { statusHistory: { Status: nextStatus, lastUpdated: new Date() } },
          }
        );
      } catch (err) {
        app.log.error(err);
        return;
      }

      scheduleOrderProgression(orderId, startIndex + 1);
    }, ADVANCE_INTERVAL_MS);
  }

  return { getNextSequence, resolveTier, computeOrderMath, scheduleOrderProgression };
}