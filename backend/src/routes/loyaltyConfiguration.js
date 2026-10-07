import { sendError } from "../lib/orderEngine.js";
import { createLoyaltyEngine } from "../lib/loyaltyEngine.js";

export default function loyaltyConfigurationRoutes(app) {
  const { recalculateSessionCustomerTier } = createLoyaltyEngine(app);

  async function updateTierValues(request, reply, fieldName, valueName) {
    const sessionId = request.headers["x-session-id"];
    const { tiers } = request.body || {};

    if (!sessionId)
      return sendError(
        reply,
        400,
        "SESSION_REQUIRED",
        "x-session-id header is required",
      );

    if (
      !Array.isArray(tiers) ||
      tiers.length === 0 ||
      tiers.some(
        (tier) =>
          !tier ||
          typeof tier.tierKey !== "string" ||
          tier.tierKey.length === 0 ||
          typeof tier[valueName] !== "number" ||
          !Number.isFinite(tier[valueName]) ||
          tier[valueName] <= 0,
      )
    ) {
      return sendError(
        reply,
        400,
        "INVALID_TIER_UPDATES",
        `tiers must contain tierKey and a finite positive ${valueName}`,
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

      const configuredTierKeys = new Set(
        (config.rewardDetails || []).map((tier) => tier.tierKey),
      );
      const requestedTierKeys = tiers.map((tier) => tier.tierKey);
      const unknownTierKey = requestedTierKeys.find(
        (tierKey) => !configuredTierKeys.has(tierKey),
      );

      if (unknownTierKey) {
        return sendError(
          reply,
          400,
          "TIER_NOT_FOUND",
          `"${unknownTierKey}" does not match any configured tierKey`,
        );
      }

      const updatesByTierKey = new Map(
        tiers.map((tier) => [tier.tierKey, tier[valueName]]),
      );
      const updatedRewardDetails = config.rewardDetails.map((tier) =>
        updatesByTierKey.has(tier.tierKey)
          ? { ...tier, [fieldName]: updatesByTierKey.get(tier.tierKey) }
          : tier,
      );

      await db
        .collection("loyaltyConfiguration")
        .updateOne(
          { sessionId },
          { $set: { rewardDetails: updatedRewardDetails } },
        );

      await recalculateSessionCustomerTier(db, {
        sessionId,
        rewardDetails: updatedRewardDetails,
      });

      const updatedConfig = await db
        .collection("loyaltyConfiguration")
        .findOne({ sessionId });

      return reply.send({ data: updatedConfig });
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "TIER_UPDATE_FAILED", err.message);
    }
  }

  // body =  {
  //   "tiers": [
  //     { "tierKey": "bronze", "newThreshold": 3 },
  //     { "tierKey": "silver", "newThreshold": 1000 }
  //   ]
  // }
  // app.post("/loyalty-configuration/tiers-thresholds", (request, reply) =>
  //   updateTierValues(request, reply, "tierThreshold", "newThreshold"),
  // );

  // body =  {
  //   "tiers": [
  //     { "tierKey": "bronze", "newCurrencyValueForDollar": 30 }
  //   ]
  // }
  // app.post("/loyalty-configuration/tiers-values", (request, reply) =>
  //   updateTierValues(
  //     request,
  //     reply,
  //     "currencyValueForDollar",
  //     "newCurrencyValueForDollar",
  //   ),
  // );

  // app.post("/loyalty-configuration/campaigns", async (request, reply) => {
  //   const sessionId = request.headers["x-session-id"];
  //   const {
  //     promoId,
  //     banner = null,
  //     isActive,
  //     multiplier = null,
  //     explain,
  //   } = request.body || {};

  //   if (!sessionId)
  //     return sendError(
  //       reply,
  //       400,
  //       "SESSION_REQUIRED",
  //       "x-session-id header is required",
  //     );
  //   if (!promoId)
  //     return sendError(reply, 400, "PROMO_ID_REQUIRED", "promoId is required");
  //   if (isActive === undefined)
  //     return sendError(
  //       reply,
  //       400,
  //       "IS_ACTIVE_REQUIRED",
  //       "isActive is required",
  //     );
  //   if (multiplier !== null && Number(multiplier) <= 0)
  //     return sendError(
  //       reply,
  //       400,
  //       "INVALID_MULTIPLIER",
  //       "multiplier must be greater than 0",
  //     );

  //   const db = app.mongo.db;

  //   try {
  //     const config = await db
  //       .collection("loyaltyConfiguration")
  //       .findOne({ sessionId: sessionId });
  //     if (!config)
  //       return sendError(
  //         reply,
  //         404,
  //         "LOYALTY_CONFIG_NOT_FOUND",
  //         "No loyalty configuration found for this session",
  //       );

  //     let existingIndex;
  //     let oldCampaign;
  //     for (let index = 0; index < config.campaign.length; index++) {
  //       const element = config.campaign[index];
  //       if (element.promoId === promoId) {
  //         existingIndex = index;
  //         oldCampaign = element;
  //         break;
  //       }
  //     }
  //     if (!oldCampaign)
  //       return sendError(
  //         reply,
  //         404,
  //         "CAMPAIGN_NOT_FOUND",
  //         "No campaign found with this promoId",
  //       );

  //     const newCampaign = {
  //       ...oldCampaign,
  //       promoId,
  //       isActive: isActive,
  //       banner: banner ? banner : oldCampaign.banner,
  //       multiplier: Number(multiplier)
  //         ? Number(multiplier)
  //         : oldCampaign.multiplier,
  //     };

  //     // Only one campaign can be active at once - deactivate every other
  //     // entry first if this one is being activated.
  //     if (isActive === true) {
  //       await db
  //         .collection("loyaltyConfiguration")
  //         .updateOne(
  //           { sessionId },
  //           { $set: { "campaign.$[].isActive": false } },
  //         );
  //     }

  //     await db
  //       .collection("loyaltyConfiguration")
  //       .updateOne(
  //         { sessionId },
  //         { $set: { [`campaign.${existingIndex}`]: newCampaign } },
  //       );

  //     const response = { data: { campaign: newCampaign } };

  //     if (explain === true) {
  //       response.meta = {
  //         explain: "N/A — explain not applicable to write operations",
  //       };
  //     }

  //     return reply.send(response);
  //   } catch (err) {
  //     app.log.error(err);
  //     return sendError(reply, 500, "CAMPAIGN_UPDATE_FAILED", err.message);
  //   }
  // });

  // GET /loyalty-configuration — full config doc for this session
  app.get("/loyalty-configuration", async (request, reply) => {
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

  // Get the campaign list
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

  // Update/replace a campaign;
  // only one campaign may be isActive at a time.

  ////////////////////////////////////

  app.patch("/loyalty-configuration/", async (request, reply) => {
    const sessionId = request.headers["x-session-id"];

    console.log("PATCH request body:", request.body);

    if (!sessionId)
      return sendError(
        reply,
        400,
        "SESSION_REQUIRED",
        "x-session-id header is required",
      );

    if (request.body && request.body.campaignUpdate) {
      return updateCampaign(sessionId, request.body.campaignUpdate, reply, app);
    }

    if (request.body && request.body.rewardUpdates) {
      return updateRewardDetails(
        sessionId,
        request.body.rewardUpdates,
        reply,
        app,
      );
    }

    return sendError(
      reply,
      400,
      "INVALID_REQUEST",
      "Invalid request: either campaign or rewardDetails must be provided",
    );
  });
}

async function updateCampaign(sessionId, campaign, reply, app) {
  const {
    promoId,
    banner = null,
    isActive,
    multiplier = null,
    explain,
  } = campaign;

  if (!promoId)
    return sendError(reply, 400, "PROMO_ID_REQUIRED", "promoId is required");
  if (isActive === undefined)
    return sendError(reply, 400, "IS_ACTIVE_REQUIRED", "isActive is required");
  if (multiplier !== null && Number(multiplier) <= 0)
    return sendError(
      reply,
      400,
      "INVALID_MULTIPLIER",
      "multiplier must be greater than 0",
    );

  const db = app.mongo.db;

  try {
    const config = await db
      .collection("loyaltyConfiguration")
      .findOne({ sessionId: sessionId });
    if (!config)
      return sendError(
        reply,
        404,
        "LOYALTY_CONFIG_NOT_FOUND",
        "No loyalty configuration found for this session",
      );

    let existingIndex;
    let oldCampaign;
    for (let index = 0; index < config.campaign.length; index++) {
      const element = config.campaign[index];
      if (element.promoId === promoId) {
        existingIndex = index;
        oldCampaign = element;
        break;
      }
    }
    if (!oldCampaign)
      return sendError(
        reply,
        404,
        "CAMPAIGN_NOT_FOUND",
        "No campaign found with this promoId",
      );

    const newCampaign = {
      ...oldCampaign,
      promoId,
      isActive: isActive,
      banner: banner ? banner : oldCampaign.banner,
      multiplier: Number(multiplier)
        ? Number(multiplier)
        : oldCampaign.multiplier,
    };

    // Only one campaign can be active at once - deactivate every other
    // entry first if this one is being activated.
    if (isActive === true) {
      await db
        .collection("loyaltyConfiguration")
        .updateOne({ sessionId }, { $set: { "campaign.$[].isActive": false } });
    }

    await db
      .collection("loyaltyConfiguration")
      .updateOne(
        { sessionId },
        { $set: { [`campaign.${existingIndex}`]: newCampaign } },
      );

    const updatedConfig = await db
      .collection("loyaltyConfiguration")
      .find({ sessionId })
      .toArray();

    const response = { data: updatedConfig[0] };

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
}

async function updateRewardDetails(sessionId, rewardUpdates, reply, app) {
  if (!Array.isArray(rewardUpdates) || rewardUpdates.length === 0) {
    return sendError(
      reply,
      400,
      "NO_REWARD_UPDATES",
      "rewardUpdates must be a non-empty array",
    );
  }

  const db = app.mongo.db;
  const { recalculateSessionCustomerTier } = createLoyaltyEngine(app);

  // Each entry is { tierKey, ...onlyTheFieldsThatChanged } — build one
  // updateOne per entry that $sets just those fields on the matching tier.
  const operations = [];

  for (let index = 0; index < rewardUpdates.length; index++) {
    const { tierKey, ...fields } = rewardUpdates[index];

    if (!tierKey)
      return sendError(
        reply,
        400,
        "TIER_KEY_REQUIRED",
        "Each reward update requires a tierKey",
      );

    const fieldNames = Object.keys(fields).filter(
      (name) => !name.startsWith("$") && !name.includes("."),
    );

    console.log("Field Names", fieldNames);

    if (fieldNames.length === 0) continue;

    const identifier = `rd${index}`;
    const set = {};
    for (const name of fieldNames) {
      set[`rewardDetails.$[${identifier}].${name}`] = fields[name];
    }

    operations.push({
      updateOne: {
        filter: { sessionId },
        update: { $set: set },
        arrayFilters: [{ [`${identifier}.tierKey`]: tierKey }],
      },
    });
  }

  if (operations.length === 0) {
    return sendError(
      reply,
      400,
      "NO_REWARD_FIELDS",
      "No updatable fields provided",
    );
  }

  try {
    const result = await db
      .collection("loyaltyConfiguration")
      .bulkWrite(operations);

    if (result.matchedCount === 0)
      return sendError(
        reply,
        404,
        "LOYALTY_CONFIG_NOT_FOUND",
        "No loyalty configuration found for this session",
      );

    const updatedConfig = await db
      .collection("loyaltyConfiguration")
      .findOne({ sessionId });

    await recalculateSessionCustomerTier(db, {
      sessionId,
      rewardDetails: updatedConfig.rewardDetails,
    });

    return reply.send({ data: updatedConfig });
  } catch (err) {
    app.log.error(err);
    return sendError(reply, 500, "REWARD_UPDATE_FAILED", err.message);
  }
}
