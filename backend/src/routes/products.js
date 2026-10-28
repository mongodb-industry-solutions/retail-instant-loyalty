import { resolveTier } from "../lib/loyaltyEngine.js";
import { sendError } from "../lib/orderEngine.js";

const RECOMMENDATION_LIMIT = 4;
const TIER_BOOST_SLOTS = 2;
const HISTORY_SLOTS = 2;

const NEAR_TIER_DOLLARS = 100;

const UNSETTLED_STATUSES = ["authorizing", "payment_failed"];

export default function productsRoutes(app) {
  app.get("/products", async (request, reply) => {
    const products = await app.mongo.db
      .collection("products")
      .find({})
      .toArray();
    return products;
  });

  // Store-page recommendations:
  //   no orders               -> global top sellers
  //   has orders              -> HISTORY_SLOTS they buy most, rest from their interests
  //   has orders, near a tier -> up to TIER_BOOST_SLOTS products (from their interests)
  //                              that earn the most / close the gap, shown first
  // Intentional: demo app identifies the caller by x-customer-id; no auth by design.

  app.get("/products/recommendations", async (request, reply) => {
    const customerId = request.headers["x-customer-id"];
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
          "Customer not found",
        );

      // Independent reads, so run them together
      const [loyaltyConfig, history] = await Promise.all([
        db
          .collection("loyaltyConfiguration")
          .findOne({ sessionId: customer.sessionId }),
        db
          .collection("orders")
          .aggregate([
            {
              $match: {
                customerId,
                currentStatus: { $nin: UNSETTLED_STATUSES },
              },
            },
            { $unwind: "$items" },
            {
              $group: {
                _id: "$items.productId",
                timesBought: { $sum: "$items.quantity" },
              },
            },
            { $sort: { timesBought: -1, _id: 1 } },
            { $limit: RECOMMENDATION_LIMIT },
            {
              $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "productId",
                as: "product",
              },
            },
            { $unwind: "$product" },
            {
              $replaceWith: {
                $mergeObjects: [
                  "$product",
                  { timesBought: "$timesBought", reason: "bought-before" },
                ],
              },
            },
          ])
          .toArray(),
      ]);

      // New customer: general top sellers
      if (history.length === 0) {
        // Only persistent orders are counted so demo-session orders don't skew the ranking.
        const topProducts = await db
          .collection("orders")
          .aggregate([
            {
              $match: {
                sessionId: { $exists: false },
                currentStatus: { $nin: UNSETTLED_STATUSES },
              },
            },
            { $unwind: "$items" },
            {
              $group: {
                _id: "$items.productId",
                units: { $sum: "$items.quantity" },
              },
            },
            { $sort: { units: -1, _id: 1 } },
            { $limit: RECOMMENDATION_LIMIT },
            {
              $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "productId",
                as: "product",
              },
            },
            { $unwind: "$product" },
            {
              $replaceWith: {
                $mergeObjects: ["$product", { reason: "top-seller" }],
              },
            },
          ])
          .toArray();

        reply.send(topProducts);
        return;
      }

      // Tier proximity: dollars of qualifying spend still needed for the next tier
      let dollarsNeeded = 0;
      let nextTierKey = null;
      if (loyaltyConfig?.rewardDetails?.length) {
        const tier = resolveTier(
          loyaltyConfig.rewardDetails,
          customer.loyaltyDetails?.cumulativeSpendDollars ?? 0,
        );
        dollarsNeeded = tier.dollarsNeededForNextTier;
        nextTierKey = tier.nextTierKey;
      }
      const nearTier =
        nextTierKey !== null &&
        dollarsNeeded > 0 &&
        dollarsNeeded <= NEAR_TIER_DOLLARS;

      const interests = Array.isArray(customer.interests)
        ? customer.interests
        : [];
      const interestFilter =
        interests.length > 0 ? { category: { $in: interests } } : {};
      const historyIds = history.map((p) => p.productId);

      // Query 2: tier boost, only near a tier, from the customer's interests
      let boosted = [];
      if (nearTier) {
        boosted = await db
          .collection("products")
          .aggregate([
            { $match: { productId: { $nin: historyIds }, ...interestFilter } },
            { $sort: { price: -1, productId: 1 } },
            { $limit: TIER_BOOST_SLOTS },
            {
              $set: {
                reason: "tier-boost",
                nextTier: nextTierKey,
                dollarsToNextTier: dollarsNeeded,
                reachesNextTier: { $gte: ["$price", dollarsNeeded] },
              },
            },
          ])
          .toArray();
      }

      // Boosted first, then what they buy most
      const recommendations = [...boosted, ...history.slice(0, HISTORY_SLOTS)];

      // Query 3: fill the remaining slots with unbought products from their interests
      const missing = RECOMMENDATION_LIMIT - recommendations.length;
      if (missing > 0) {
        const taken = [...historyIds, ...boosted.map((p) => p.productId)];
        const interestPicks = await db
          .collection("products")
          .aggregate([
            { $match: { productId: { $nin: taken }, ...interestFilter } },
            { $sort: { price: -1, productId: 1 } },
            { $limit: missing },
            { $set: { reason: "for-you" } },
          ])
          .toArray();
        recommendations.push(...interestPicks);
      }

      // Still short (tiny catalog): use the remaining history items
      if (recommendations.length < RECOMMENDATION_LIMIT) {
        recommendations.push(
          ...history
            .slice(HISTORY_SLOTS)
            .slice(0, RECOMMENDATION_LIMIT - recommendations.length),
        );
      }

      //console.log("History products:", history);
      //console.log("Boosted products:", boosted);

      //console.log("Final recommended products:", recommendations);

      reply.send(recommendations);
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "RECOMMENDATIONS_FAILED", err.message);
    }
  });
}
