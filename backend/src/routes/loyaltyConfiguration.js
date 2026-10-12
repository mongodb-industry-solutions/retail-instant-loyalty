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
    const { explain, campaignUpdate, rewardUpdates } = request.body || {};
    const db = app.mongo.db;
    const { recalculateSessionCustomerTier } = createLoyaltyEngine(app);

    if (!sessionId)
      return sendError(
        reply,
        400,
        "SESSION_REQUIRED",
        "x-session-id header is required",
      );

    if (!campaignUpdate && !rewardUpdates)
      return sendError(
        reply,
        400,
        "INVALID_REQUEST",
        "Invalid request: either campaign or rewardDetails must be provided",
      );

    try {
      const collection = db.collection("loyaltyConfiguration");
      const config = await collection.findOne({ sessionId });
      if (!config)
        return sendError(
          reply,
          404,
          "LOYALTY_CONFIG_NOT_FOUND",
          "No loyalty configuration found for this session",
        );

      const set = {};
      let updatedRewardDetails;

      if (campaignUpdate) {
        const result = validateCampaignUpdate(config, campaignUpdate);
        if (result.error) return sendValidationError(reply, result.error);
        Object.assign(set, result.set);
      }

      if (rewardUpdates) {
        const result = validateRewardUpdates(config, rewardUpdates);
        if (result.error) return sendValidationError(reply, result.error);
        Object.assign(set, result.set);
        updatedRewardDetails = result.updatedRewardDetails;
      }

      await collection.updateOne({ sessionId }, { $set: set });

      if (updatedRewardDetails) {
        await recalculateSessionCustomerTier(db, {
          sessionId,
          rewardDetails: updatedRewardDetails,
        });
      }

      const responseBody = {
        message: "Update successful",
        data: await collection.findOne({ sessionId }),
      };
      if (explain === true) {
        responseBody.meta = {
          explain: "N/A — explain not applicable to write operations",
        };
      }
      return reply.send(responseBody);
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "LOYALTY_CONFIG_UPDATE_FAILED", err.message);
    }
  });
}

function validationError(status, code, message) {
  return { error: { status, code, message } };
}

function sendValidationError(reply, { status, code, message }) {
  return sendError(reply, status, code, message);
}

// Builds the $set for a campaign change without touching the database.
function validateCampaignUpdate(config, campaign) {
  if (!campaign || typeof campaign !== "object" || Array.isArray(campaign))
    return validationError(
      400,
      "INVALID_CAMPAIGN_UPDATE",
      "campaignUpdate must be an object",
    );

  const { promoId, banner = null, isActive, multiplier = null } = campaign;

  if (!promoId)
    return validationError(400, "PROMO_ID_REQUIRED", "promoId is required");
  if (isActive === undefined)
    return validationError(400, "IS_ACTIVE_REQUIRED", "isActive is required");
  if (multiplier !== null && Number(multiplier) <= 0)
    return validationError(
      400,
      "INVALID_MULTIPLIER",
      "multiplier must be greater than 0",
    );

  const campaigns = config.campaign || [];
  const existingIndex = campaigns.findIndex((c) => c.promoId === promoId);
  if (existingIndex === -1)
    return validationError(
      404,
      "CAMPAIGN_NOT_FOUND",
      "No campaign found with this promoId",
    );

  const oldCampaign = campaigns[existingIndex];
  const newCampaign = {
    ...oldCampaign,
    promoId,
    isActive,
    banner: banner ? banner : oldCampaign.banner,
    multiplier: Number(multiplier)
      ? Number(multiplier)
      : oldCampaign.multiplier,
  };

  const set = { [`campaign.${existingIndex}`]: newCampaign };

  // Only one campaign can be active at once - deactivate every other entry
  // when this one is being activated.
  if (isActive === true) {
    campaigns.forEach((_, index) => {
      if (index !== existingIndex) set[`campaign.${index}.isActive`] = false;
    });
  }

  return { set };
}

const REWARD_FIELD_VALIDATORS = {
  tierThreshold: (value) => Number.isFinite(value) && value >= 0,
  currencyValueForDollar: (value) => Number.isFinite(value) && value > 0,
};

function validateRewardUpdates(config, rewardUpdates) {
  if (!Array.isArray(rewardUpdates) || rewardUpdates.length === 0)
    return validationError(
      400,
      "NO_REWARD_UPDATES",
      "rewardUpdates must be a non-empty array",
    );

  const currentRewardDetails = config.rewardDetails || [];
  const tierIndexByKey = new Map(
    currentRewardDetails.map((tier, index) => [tier.tierKey, index]),
  );
  const updatesByTierKey = new Map();

  for (const update of rewardUpdates) {
    if (!update || typeof update !== "object" || Array.isArray(update))
      return validationError(
        400,
        "INVALID_REWARD_UPDATE",
        "Each reward update must be an object",
      );

    const { tierKey, ...fields } = update;

    if (typeof tierKey !== "string" || tierKey.length === 0)
      return validationError(
        400,
        "TIER_KEY_REQUIRED",
        "Each reward update requires a tierKey",
      );
    if (!tierIndexByKey.has(tierKey))
      return validationError(
        400,
        "TIER_NOT_FOUND",
        `"${tierKey}" does not match any configured tierKey`,
      );
    if (updatesByTierKey.has(tierKey))
      return validationError(
        400,
        "DUPLICATE_TIER_KEY",
        `"${tierKey}" appears more than once in rewardUpdates`,
      );

    for (const [name, value] of Object.entries(fields)) {
      if (!Object.hasOwn(REWARD_FIELD_VALIDATORS, name))
        return validationError(
          400,
          "UNSUPPORTED_REWARD_FIELD",
          `"${name}" is not an updatable reward field`,
        );
      if (typeof value !== "number" || !REWARD_FIELD_VALIDATORS[name](value))
        return validationError(
          400,
          "INVALID_REWARD_VALUE",
          name === "tierThreshold"
            ? `tierThreshold for "${tierKey}" must be a finite number >= 0`
            : `${name} for "${tierKey}" must be a finite number > 0`,
        );
    }

    updatesByTierKey.set(tierKey, fields);
  }

  const updatedRewardDetails = currentRewardDetails.map((tier) => ({
    ...tier,
    ...updatesByTierKey.get(tier.tierKey),
  }));
  for (let index = 1; index < updatedRewardDetails.length; index++) {
    const previous = updatedRewardDetails[index - 1];
    const current = updatedRewardDetails[index];
    if (!(current.tierThreshold > previous.tierThreshold))
      return validationError(
        400,
        "INVALID_TIER_ORDER",
        `tierThreshold for "${current.tierKey}" must be greater than "${previous.tierKey}"`,
      );
  }

  const set = {};
  for (const [tierKey, fields] of updatesByTierKey) {
    for (const [name, value] of Object.entries(fields)) {
      set[`rewardDetails.${tierIndexByKey.get(tierKey)}.${name}`] = value;
    }
  }

  if (Object.keys(set).length === 0)
    return validationError(
      400,
      "NO_REWARD_FIELDS",
      "No updatable fields provided",
    );

  return { set, updatedRewardDetails };
}
