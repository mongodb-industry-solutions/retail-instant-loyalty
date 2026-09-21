import { sendError, createOrderEngine } from "../lib/orderEngine.js";

export default function loyaltyConfigurationRoutes(app) {
  const { resolveTier } = createOrderEngine(app);

  // GET /loyalty-configuration — full config doc for this session
  app.get("/loyalty-configuration", async (request, reply) => {
    const sessionId = request.headers["x-session-id"];

    console.log("Fetching loyalty configuration for session:", sessionId);

    const { explain } = request.body || {};

    if (!sessionId)
      return sendError(
        reply,
        400,
        "SESSION_REQUIRED",
        "x-session-id header is required",
      );

    const db = app.mongo.db;

    try {
      const config = await db
        .collection("loyaltyConfiguration")
        .findOne({ sessionId });
      if (!config)
        return sendError(
          reply,
          404,
          "LOYALTY_CONFIG_NOT_FOUND",
          "No loyalty configuration for this session",
        );

      const response = { data: config };

      if (explain === true) {
        response.meta = {
          explain: await db
            .collection("loyaltyConfiguration")
            .find({ sessionId })
            .explain("executionStats"),
        };
      }

      return reply.send(response);
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "LOYALTY_CONFIG_LOOKUP_FAILED", err.message);
    }
  });

  // GET /loyalty-configuration/campaigns — just the campaign list
  app.get("/loyalty-configuration/campaigns", async (request, reply) => {
    const sessionId = request.headers["x-session-id"];
    const { explain } = request.body || {};

    if (!sessionId)
      return sendError(
        reply,
        400,
        "SESSION_REQUIRED",
        "x-session-id header is required",
      );

    const db = app.mongo.db;

    try {
      const config = await db
        .collection("loyaltyConfiguration")
        .findOne({ sessionId }, { projection: { _id: 0, campaign: 1 } });
      if (!config)
        return sendError(
          reply,
          404,
          "LOYALTY_CONFIG_NOT_FOUND",
          "No loyalty configuration for this session",
        );

      const response = { data: { campaigns: config.campaign || [] } };

      if (explain === true) {
        response.meta = {
          explain:
            "N/A — projection-only read, no meaningful plan difference to show",
        };
      }

      return reply.send(response);
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "CAMPAIGNS_LOOKUP_FAILED", err.message);
    }
  });

  // POST /loyalty-configuration/tiers — update one or more tiers' fields,
  // then recompute every session customer's activeTier/nextTier against
  // the new thresholds. Accepts any key matching an existing tierName -
  // no hardcoded tier list, so adding/renaming tiers doesn't require a code change.
  app.post("/loyalty-configuration/tiers", async (request, reply) => {
    const sessionId = request.headers["x-session-id"];
    const { explain, ...tierUpdates } = request.body || {};

    if (!sessionId)
      return sendError(
        reply,
        400,
        "SESSION_REQUIRED",
        "x-session-id header is required",
      );

    const requestedTierNames = Object.keys(tierUpdates);
    if (requestedTierNames.length === 0) {
      return sendError(
        reply,
        400,
        "TIER_UPDATES_REQUIRED",
        "At least one tier field is required",
      );
    }

    const db = app.mongo.db;

    try {
      const config = await db
        .collection("loyaltyConfiguration")
        .findOne({ sessionId });
      if (!config)
        return sendError(
          reply,
          404,
          "LOYALTY_CONFIG_NOT_FOUND",
          "No loyalty configuration for this session",
        );

      // Validate every requested key actually matches a tier that exists -
      // catches typos (e.g. a literal "tierName" key) instead of silently no-op-ing.
      for (const name of requestedTierNames) {
        if (!config.rewardDetails.some((t) => t.tierName === name)) {
          return sendError(
            reply,
            400,
            "TIER_NOT_FOUND",
            `"${name}" does not match any existing tierName`,
          );
        }
      }

      const updatedRewardDetails = config.rewardDetails.map((tier) => {
        const patch = tierUpdates[tier.tierName];
        if (!patch) return tier;
        return {
          ...tier,
          ...(patch.tierThreshold !== undefined
            ? { tierThreshold: patch.tierThreshold }
            : {}),
          ...(patch.currencyValueForDollar !== undefined
            ? { currencyValueForDollar: patch.currencyValueForDollar }
            : {}),
        };
      });

      await db
        .collection("loyaltyConfiguration")
        .updateOne(
          { sessionId },
          { $set: { rewardDetails: updatedRewardDetails } },
        );

      // Recompute every customer in this session against the new thresholds.
      // Reuses the same resolveTier logic orders/redeem already validated -
      // one source of truth for "what tier does this spend level map to."
      const customers = await db
        .collection("customers")
        .find({ sessionId })
        .toArray();
      const bulkOps = [];

      for (const customer of customers) {
        const cumulativeSpend =
          customer.loyaltyDetails?.cumulativeSpendDollars || 0;
        const resolved = resolveTier(updatedRewardDetails, cumulativeSpend);

        if (resolved.tierKey !== customer.loyaltyDetails?.activeTier) {
          bulkOps.push({
            updateOne: {
              filter: { _id: customer._id },
              update: {
                $set: {
                  "loyaltyDetails.activeTier": resolved.tierKey,
                  "loyaltyDetails.nextTier": resolved.nextTierKey,
                },
                $push: {
                  "loyaltyDetails.loyaltyHistory": {
                    tierKey: resolved.tierKey,
                    activatedAt: new Date(),
                    previousTier: customer.loyaltyDetails?.activeTier,
                  },
                },
              },
            },
          });
        }
      }

      if (bulkOps.length > 0) {
        await db.collection("customers").bulkWrite(bulkOps);
      }

      // Per the contract: no response.data payload, status only.
      const response = { data: {} };

      if (explain === true) {
        response.meta = {
          explain: "N/A — explain not applicable to write operations",
        };
      }

      return reply.send(response);
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "TIER_UPDATE_FAILED", err.message);
    }
  });

  // POST /loyalty-configuration/campaigns — create/replace a campaign;
  // only one campaign may be isActive at a time.
  app.post("/loyalty-configuration/campaigns", async (request, reply) => {
    const sessionId = request.headers["x-session-id"];
    const { promoId, promoName, banner, isActive, multiplier, explain } =
      request.body || {};

    if (!sessionId)
      return sendError(
        reply,
        400,
        "SESSION_REQUIRED",
        "x-session-id header is required",
      );
    if (!promoId)
      return sendError(reply, 400, "PROMO_ID_REQUIRED", "promoId is required");

    const db = app.mongo.db;

    try {
      const config = await db
        .collection("loyaltyConfiguration")
        .findOne({ sessionId });
      if (!config)
        return sendError(
          reply,
          404,
          "LOYALTY_CONFIG_NOT_FOUND",
          "No loyalty configuration for this session",
        );

      const newCampaign = {
        promoId,
        promoName,
        banner,
        isActive: !!isActive,
        multiplier,
      };

      // Only one campaign can be active at once - deactivate every other
      // entry first if this one is being activated.
      if (isActive === true) {
        await db
          .collection("loyaltyConfiguration")
          .updateOne(
            { sessionId },
            { $set: { "campaign.$[].isActive": false } },
          );
      }

      const existingIndex = config.campaign.findIndex(
        (c) => c.promoId === promoId,
      );

      if (existingIndex >= 0) {
        await db
          .collection("loyaltyConfiguration")
          .updateOne(
            { sessionId },
            { $set: { [`campaign.${existingIndex}`]: newCampaign } },
          );
      } else {
        await db
          .collection("loyaltyConfiguration")
          .updateOne({ sessionId }, { $push: { campaign: newCampaign } });
      }

      const response = { data: { campaign: newCampaign } };

      if (explain === true) {
        response.meta = {
          explain: "N/A — explain not applicable to write operations",
        };
      }

      return reply.send(response);
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "CAMPAIGN_UPDATE_FAILED", err.message);
    }
  });
}
