import { randomUUID } from "node:crypto";
import { sendError } from "../lib/orderEngine.js";

const MIN_ORDERS = 3;
const MAX_ORDERS = 10;
const MAX_ITEMS_PER_ORDER = 3;
const MAX_QUANTITY_PER_ITEM = 999;
const COIN_USE_PROBABILITY = 0.5;
const CONFIG_WAIT_TIMEOUT_MS = 15000;
const CONFIG_POLL_INTERVAL_MS = 250;

export default function adminRoutes(app) {
  const sessionScopedCollections = ["orders", "transactions", "loyaltyHistory"];

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function toNumber(value) {
    return Number(value?.toString?.() ?? value);
  }

  // Calls this service's own public routes so the simulation goes through the
  // exact same code path (and triggers) a real shopper would.
  async function callRoute(method, url, { sessionId, body } = {}) {
    const response = await app.inject({
      method,
      url,
      headers: sessionId ? { "x-session-id": sessionId } : {},
      payload: body,
    });

    let payload;
    try {
      payload = response.json();
    } catch {
      payload = { error: { code: "UNPARSEABLE_RESPONSE", message: response.body } };
    }

    if (response.statusCode >= 400) {
      throw {
        code: payload?.error?.code || "UPSTREAM_ROUTE_FAILED",
        message: `${method} ${url} failed: ${payload?.error?.message || response.statusCode}`,
      };
    }

    return payload;
  }

  // The per-session loyaltyConfiguration is written by the Atlas trigger that
  // reacts to /sessions/start, so it isn't readable the instant that call returns.
  async function waitForLoyaltyConfiguration(db, sessionId) {
    const deadline = Date.now() + CONFIG_WAIT_TIMEOUT_MS;

    while (Date.now() < deadline) {
      const config = await db
        .collection("loyaltyConfiguration")
        .findOne({ sessionId });
      if (config?.rewardDetails?.length) return config;
      await new Promise((resolve) =>
        setTimeout(resolve, CONFIG_POLL_INTERVAL_MS),
      );
    }

    throw {
      code: "LOYALTY_CONFIG_NOT_FOUND",
      message: `No loyaltyConfiguration appeared for session ${sessionId}`,
    };
  }

  function buildItems(products, targetSubtotal) {
    const pool = [...products]
      .sort(() => Math.random() - 0.5)
      .slice(0, randomInt(1, MAX_ITEMS_PER_ORDER));

    const items = [];
    let subtotal = 0;

    pool.forEach((product, index) => {
      const price = toNumber(product.price);
      const isLast = index === pool.length - 1;
      const share = isLast
        ? Math.max(0, targetSubtotal - subtotal)
        : targetSubtotal / pool.length;
      const quantity = Math.min(
        MAX_QUANTITY_PER_ITEM,
        Math.max(1, Math.ceil(share / price)),
      );

      items.push({ productId: product.productId, quantity });
      subtotal += quantity * price;
    });

    return items;
  }

  // POST /admin/simulate-tier  body: { customerId, tierKey }
  // Drives a customer up to the requested tier with real orders, then detaches
  // those orders from the session so they survive as purchase history.
  app.post("/admin/simulate-tier", async (request, reply) => {
    const { customerId, tierKey } = request.body || {};

    if (!customerId)
      return sendError(reply, 400, "CUSTOMER_REQUIRED", "customerId is required");
    if (!tierKey)
      return sendError(reply, 400, "TIER_REQUIRED", "tierKey is required");

    const db = app.mongo.db;

    try {
      const customer = await db.collection("customers").findOne({ customerId });
      if (!customer)
        return sendError(
          reply,
          404,
          "CUSTOMER_NOT_FOUND",
          `No customer with id ${customerId}`,
        );
      if (customer.isAlwaysNewUser === true)
        return sendError(
          reply,
          400,
          "ALWAYS_NEW_USER_NOT_SUPPORTED",
          "Simulating a tier is not supported for isAlwaysNewUser customers",
        );

      if (customer.sessionId) {
        await callRoute("POST", "/sessions/end", {
          sessionId: customer.sessionId,
        });
      }

      const sessionId = randomUUID();
      await callRoute("POST", "/sessions/start", {
        sessionId,
        body: { selectedCustomerId: customerId },
      });

      const loyaltyConfig = await waitForLoyaltyConfiguration(db, sessionId);
      const targetTier = loyaltyConfig.rewardDetails.find(
        (tier) => tier.tierKey.toLowerCase() === String(tierKey).toLowerCase(),
      );
      if (!targetTier)
        return sendError(
          reply,
          400,
          "TIER_NOT_FOUND",
          `"${tierKey}" does not match any configured tierKey`,
        );

      const products = (
        await db.collection("products").find({}).toArray()
      ).filter((product) => toNumber(product.price) > 0);
      if (products.length === 0)
        return sendError(
          reply,
          409,
          "NO_PRODUCTS",
          "No priced products available to simulate orders",
        );

      const plannedOrders = randomInt(MIN_ORDERS, MAX_ORDERS);
      const placedOrders = [];

      while (placedOrders.length < MAX_ORDERS) {
        const current = await db.collection("customers").findOne({ sessionId });
        const loyaltyDetails = current.loyaltyDetails || {};
        const cumulativeSpend = loyaltyDetails.cumulativeSpendDollars || 0;
        const remainingSpend = targetTier.tierThreshold - cumulativeSpend;

        if (remainingSpend <= 0 && placedOrders.length >= MIN_ORDERS) break;

        const isLastAllowedOrder = placedOrders.length === MAX_ORDERS - 1;
        const ordersRemaining = Math.max(1, plannedOrders - placedOrders.length);
        // Once the threshold is already met we still place filler orders to
        // honour the 3-order minimum.
        const neededSpend =
          remainingSpend <= 0
            ? toNumber(products[randomInt(0, products.length - 1)].price)
            : isLastAllowedOrder
              ? remainingSpend
              : remainingSpend / ordersRemaining;

        const balance = loyaltyDetails.coinBalance || 0;
        const activeTierEntry = loyaltyConfig.rewardDetails.find(
          (tier) => tier.tierKey === loyaltyDetails.activeTier,
        );
        const useCoins =
          balance > 0 &&
          activeTierEntry &&
          Math.random() < COIN_USE_PROBABILITY;
        const coinsToApply = useCoins
          ? Math.max(1, Math.floor(balance * (0.1 + Math.random() * 0.4)))
          : 0;
        // Coins cut into qualifying spend, so pad the subtotal to keep tier progress on plan.
        const coinsInDollars = coinsToApply
          ? coinsToApply / activeTierEntry.currencyValueForDollar
          : 0;

        const items = buildItems(products, neededSpend + coinsInDollars);

        const result = await callRoute("POST", "/orders", {
          sessionId,
          body: { items, coinsToApply, orderType: "ONLINE", validCard: true },
        });

        placedOrders.push({
          orderId: result.data.order.orderId,
          subtotal: result.data.order.amountSummary.subtotal,
          total: result.data.order.amountSummary.total,
          coinsApplied: result.data.order.coinsApplied,
          coinsEarned: result.data.order.coinsEarned,
          tier: result.data.loyalty.newTier,
        });
      }

      // Detach before ending the session: /sessions/end recomputes the persisted
      // balance and tier from orders that have no sessionId.
      for (const name of sessionScopedCollections) {
        await db
          .collection(name)
          .updateMany({ sessionId }, { $unset: { sessionId: "" } });
      }

      await callRoute("POST", "/sessions/end", { sessionId });

      const finalCustomer = await db
        .collection("customers")
        .findOne({ customerId });

      return reply.send({
        data: {
          customerId,
          sessionId,
          requestedTier: targetTier.tierKey,
          reachedTier: finalCustomer.loyaltyDetails?.activeTier ?? null,
          cumulativeSpendDollars:
            finalCustomer.loyaltyDetails?.cumulativeSpendDollars ?? 0,
          coinBalance: finalCustomer.loyaltyDetails?.coinBalance ?? 0,
          orders: placedOrders,
        },
      });
    } catch (err) {
      app.log.error(err);
      if (err.code) return sendError(reply, 409, err.code, err.message);
      return sendError(reply, 500, "SIMULATE_TIER_FAILED", err.message);
    }
  });
}
