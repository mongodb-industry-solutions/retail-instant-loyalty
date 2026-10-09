import { sendError } from "../lib/orderEngine.js";
import { createLoyaltyEngine } from "../lib/loyaltyEngine.js";

export default function loyaltyConfigurationRoutes(app) {
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

  app.patch("/loyalty-configuration/", async (request, reply) => {
    const sessionId = request.headers["x-session-id"];
    const responseBody = {};
    const { explain } = request.body || {};
    const db = app.mongo.db;
    let campaignResult;
    let rewardResult;
    const { recalculateSessionCustomerTier } = createLoyaltyEngine(app);

    if (!sessionId)
      return sendError(
        reply,
        400,
        "SESSION_REQUIRED",
        "x-session-id header is required",
      );

    if (request.body && request.body.campaignUpdate) {
      campaignResult = await updateCampaign(
        sessionId,
        request.body.campaignUpdate,
        reply,
        app,
        db,
      );
      if (reply.sent) return reply;
    }

    if (request.body && request.body.rewardUpdates) {
      rewardResult = await updateRewardDetails(
        sessionId,
        request.body.rewardUpdates,
        reply,
        app,
        db,
      );
      if (reply.sent) return reply;
    }

    if (explain === true) {
      responseBody.meta = {
        explain: "N/A — explain not applicable to write operations",
      };
    }

    if (campaignResult || rewardResult) {
      responseBody.message = "Update successful";
      const updateResults = await db
        .collection("loyaltyConfiguration")
        .findOne({ sessionId });

      if (rewardResult) {
        await recalculateSessionCustomerTier(db, {
          sessionId,
          rewardDetails: rewardResult.rewardDetails,
        });
      }
      responseBody.data = updateResults;

      return reply.send(responseBody);
    }

    responseBody.message =
      "Invalid request: either campaign or rewardDetails must be provided";
    return sendError(reply, 400, "INVALID_REQUEST", responseBody.message);
  });
}

async function updateCampaign(sessionId, campaign, reply, app, db) {
  const { promoId, banner = null, isActive, multiplier = null } = campaign;
  let campaignUpdatedSuccessfully = false;

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

    const updateResult = await db
      .collection("loyaltyConfiguration")
      .updateOne(
        { sessionId },
        { $set: { [`campaign.${existingIndex}`]: newCampaign } },
      );

    if (updateResult.modifiedCount > 0) {
      campaignUpdatedSuccessfully = true;
    }

    return campaignUpdatedSuccessfully;
  } catch (err) {
    campaignUpdatedSuccessfully = false;
    app.log.error(err);
    return sendError(reply, 500, "CAMPAIGN_UPDATE_FAILED", err.message);
  }
}

// Only these tier fields may be patched. tierThreshold is cumulative spend
// in dollars (the lowest tier starts at 0); currencyValueForDollar is the
// coins-per-dollar divisor used when redeeming, so it must stay above 0.
const REWARD_FIELD_VALIDATORS = {
  tierThreshold: (value) => Number.isFinite(value) && value >= 0,
  currencyValueForDollar: (value) => Number.isFinite(value) && value > 0,
};

async function updateRewardDetails(sessionId, rewardUpdates, reply, app, db) {
  if (!Array.isArray(rewardUpdates) || rewardUpdates.length === 0) {
    return sendError(
      reply,
      400,
      "NO_REWARD_UPDATES",
      "rewardUpdates must be a non-empty array",
    );
  }

  let config;
  try {
    config = await db.collection("loyaltyConfiguration").findOne({ sessionId });
  } catch (err) {
    app.log.error(err);
    return sendError(reply, 500, "LOYALTY_CONFIG_LOOKUP_FAILED", err.message);
  }
  if (!config)
    return sendError(
      reply,
      404,
      "LOYALTY_CONFIG_NOT_FOUND",
      "No loyalty configuration found for this session",
    );

  const currentRewardDetails = config.rewardDetails || [];
  const configuredTierKeys = new Set(
    currentRewardDetails.map((tier) => tier.tierKey),
  );
  const updatesByTierKey = new Map();

  // Each entry is { tierKey, ...onlyTheFieldsThatChanged }. Validate every
  // entry up front so a bad one rejects the whole request before any write.
  for (const update of rewardUpdates) {
    if (!update || typeof update !== "object" || Array.isArray(update))
      return sendError(
        reply,
        400,
        "INVALID_REWARD_UPDATE",
        "Each reward update must be an object",
      );

    const { tierKey, ...fields } = update;

    if (typeof tierKey !== "string" || tierKey.length === 0)
      return sendError(
        reply,
        400,
        "TIER_KEY_REQUIRED",
        "Each reward update requires a tierKey",
      );
    if (!configuredTierKeys.has(tierKey))
      return sendError(
        reply,
        400,
        "TIER_NOT_FOUND",
        `"${tierKey}" does not match any configured tierKey`,
      );
    if (updatesByTierKey.has(tierKey))
      return sendError(
        reply,
        400,
        "DUPLICATE_TIER_KEY",
        `"${tierKey}" appears more than once in rewardUpdates`,
      );

    for (const [name, value] of Object.entries(fields)) {
      if (!Object.hasOwn(REWARD_FIELD_VALIDATORS, name))
        return sendError(
          reply,
          400,
          "UNSUPPORTED_REWARD_FIELD",
          `"${name}" is not an updatable reward field`,
        );
      if (typeof value !== "number" || !REWARD_FIELD_VALIDATORS[name](value))
        return sendError(
          reply,
          400,
          "INVALID_REWARD_VALUE",
          name === "tierThreshold"
            ? `tierThreshold for "${tierKey}" must be a finite number >= 0`
            : `${name} for "${tierKey}" must be a finite number > 0`,
        );
    }

    updatesByTierKey.set(tierKey, fields);
  }

  // Thresholds must stay strictly increasing in configured tier order, so
  // check the merged result rather than each update in isolation.
  const updatedRewardDetails = currentRewardDetails.map((tier) => ({
    ...tier,
    ...updatesByTierKey.get(tier.tierKey),
  }));
  for (let index = 1; index < updatedRewardDetails.length; index++) {
    const previous = updatedRewardDetails[index - 1];
    const current = updatedRewardDetails[index];
    if (!(current.tierThreshold > previous.tierThreshold))
      return sendError(
        reply,
        400,
        "INVALID_TIER_ORDER",
        `tierThreshold for "${current.tierKey}" must be greater than "${previous.tierKey}"`,
      );
  }

  const operations = [];
  let index = 0;
  for (const [tierKey, fields] of updatesByTierKey) {
    const fieldNames = Object.keys(fields);
    if (fieldNames.length === 0) continue;

    const identifier = `rd${index++}`;
    const set = {};
    for (const name of fieldNames) {
      set[`rewardDetails.$[${identifier}].${name}`] = fields[name];
    }

    operations.push({
      updateOne: {
        filter: { sessionId, "rewardDetails.tierKey": tierKey },
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

    return result.modifiedCount > 0
      ? { rewardDetails: updatedRewardDetails }
      : false;
  } catch (err) {
    app.log.error(err);
    return sendError(reply, 500, "REWARD_UPDATE_FAILED", err.message);
  }
}
