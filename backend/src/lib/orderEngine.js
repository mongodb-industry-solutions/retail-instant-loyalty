import { resolveTier } from "./loyaltyEngine.js";

export const STATUS_SEQUENCE = ["placed", "processing", "shipped", "delivered"];
export const ADVANCE_INTERVAL_MS = 2000;
export const TAX_RATE = 0.085;
const PAYMENT_DELAY_MS = 1200; // ASSUMPTION - simulated gateway latency, tune for demo pacing

export function sendError(reply, status, code, message) {
  return reply.code(status).send({ error: { code, message } });
}

export function isFirstPurchase(customer) {
  return customer.isAlwaysNewUser && customer.loyaltyDetails.activeTier === null;
}

export function createOrderEngine(app) {
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

  // Pure calculation + validation - no writes. Safe to call before any
  // order/payment attempt exists, since it only reads current state.
  async function computeOrderMath(db, { sessionId, items, coinsToApply }) {
    const customer = await db.collection("customers").findOne({ sessionId });
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
    if(isFirstPurchase(customer) && coinsToApply > 0)
      throw {
        code: "CANNOT_APPLY_COINS_ON_FIRST_PURCHASE",
        message: "Loyalty coins cannot be applied on the first purchase",
      };

    const loyaltyConfig = await db
      .collection("loyaltyConfiguration")
      .findOne({ sessionId });
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
      .find({ productId: { $in: productIds } })
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

      const unitPrice = Number(product.price?.toString?.() ?? product.price);
      const lineTotal =unitPrice * requested.quantity;
      subtotal += lineTotal;

      return {
        productId: product.productId,
        name: product.name,
        imageUrl: product.imageURL,
        quantity: requested.quantity,
        unitPrice,
        lineTotal: lineTotal,
      };
    });

    const currentTierKey = customer.loyaltyDetails.activeTier;
    let tierEntry = loyaltyConfig.rewardDetails.find((t) => t.tierKey === currentTierKey,);
    if (!tierEntry) {
      if (currentTierKey == null &&
          (customer.isAlwaysNewUser === true || customer.loyaltyDetails.ordersCount === 0)) {
        tierEntry = loyaltyConfig.rewardDetails.reduce((lowestTier, tier) =>
          tier.tierThreshold < lowestTier.tierThreshold ? tier : lowestTier,
        );
      } else {
        throw {
          code: "TIER_NOT_FOUND",
          message: `Customer's active tier ${currentTierKey} not found in loyalty config`,
        };
      }
    }

    const oldBalance = customer.loyaltyDetails.coinBalance;
    let requestedCoins = coinsToApply || 0;

    let coinsToDollarsApplied =  Math.round((requestedCoins / tierEntry.currencyValueForDollar) * 100) / 100;
    const qualifyingSpend = Math.max(0, subtotal - coinsToDollarsApplied);
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const shipping = 0;
    const total = Math.round((qualifyingSpend + tax + shipping) * 100) / 100;
    const coinsEarned = Math.round(qualifyingSpend * multiplier);

    // validate we do not use more coins than the orders total amount
    // i.e. if user applies 2000 coins but the subtotal can be covered with 700 coins we just take 700
    if (coinsToDollarsApplied > subtotal) {
      coinsToDollarsApplied = subtotal;
      requestedCoins = Math.round(
        coinsToDollarsApplied * tierEntry.currencyValueForDollar,
      );
    }

    const oldTier = currentTierKey;
    const oldCumulativeSpendDollars =
      customer.loyaltyDetails.cumulativeSpendDollars || 0;
    const newCumulativeSpend = oldCumulativeSpendDollars + qualifyingSpend;
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
        coinsDiscountValue: Math.round(coinsToDollarsApplied * 100) / 100,
        tax,
        shipping,
        total,
      },
      coinsApplied: requestedCoins,
      coinsToDollarsApplied: Math.round(coinsToDollarsApplied * 100) / 100,
      coinsEarned,
      qualifyingSpend: Math.round(qualifyingSpend * 100) / 100,
      multiplier,
      oldBalance,
      oldTier,
      newBalance,
      newTierKey: resolved.tierKey,
      nextTierKey: resolved.nextTierKey,
      tierChanged,
      newCumulativeSpendDollars: Math.round(newCumulativeSpend * 100) / 100,
      dollarsNeededForNextTier: Math.round(resolved.dollarsNeededForNextTier * 100) / 100,
    };
  }

  // Simulated payment gateway call. Deliberately outside any transaction -
  // in production this would be a real network call to a processor, and a
  // Mongo transaction should never wrap an external call it doesn't control.
  async function processPayment(validCard) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(validCard === true ? "approved" : "declined");
      }, PAYMENT_DELAY_MS);
    });
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

  return {
    getNextSequence,
    computeOrderMath,
    processPayment,
    scheduleOrderProgression,
  };
}
