import { sendError } from "../lib/orderEngine.js";
import { resolveTier } from "../lib/loyaltyEngine.js";

export default function loyaltyConfigurationRoutes(app) {
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
  app.post("/loyalty-configuration/campaigns", async (request, reply) => {
    const sessionId = request.headers["x-session-id"];
    const { promoId, banner = null, isActive, multiplier = null, explain } = request.body || {};

    if (!sessionId) return sendError(reply, 400, "SESSION_REQUIRED", "x-session-id header is required");
    if (!promoId) return sendError(reply, 400, "PROMO_ID_REQUIRED", "promoId is required");
    if (isActive === undefined) return sendError(reply, 400, "IS_ACTIVE_REQUIRED", "isActive is required");
    if(multiplier !== null && Number(multiplier) <= 0) return sendError(reply, 400, "INVALID_MULTIPLIER", "multiplier must be greater than 0");

    const db = app.mongo.db;

    try {
      const config = await db.collection("loyaltyConfiguration").findOne({ sessionId: sessionId });
      if (!config) return sendError(reply, 404, "LOYALTY_CONFIG_NOT_FOUND", "No loyalty configuration found for this session");

      let existingIndex
      let oldCampaign 
      for (let index = 0; index < config.campaign.length; index++) {
        const element = config.campaign[index];
        if (element.promoId === promoId) {
          existingIndex = index;
          oldCampaign = element;
          break;
        }
      }
      if (!oldCampaign) return sendError(reply, 404, "CAMPAIGN_NOT_FOUND", "No campaign found with this promoId");

      const newCampaign = { 
        ...oldCampaign, 
        promoId, 
        isActive: isActive, 
        banner: banner ? banner : oldCampaign.banner, 
        multiplier: Number(multiplier) ? Number(multiplier) : oldCampaign.multiplier
      };

      // Only one campaign can be active at once - deactivate every other
      // entry first if this one is being activated.
      if (isActive === true) {
        await db
          .collection("loyaltyConfiguration")
          .updateOne({ sessionId }, { $set: { "campaign.$[].isActive": false } });
      }

      await db.collection("loyaltyConfiguration").updateOne(
        { sessionId },
        { $set: { [`campaign.${existingIndex}`]: newCampaign } }
      );

      const response = { data: { campaign: newCampaign } };

      if (explain === true) {
        response.meta = { explain: "N/A — explain not applicable to write operations" };
      }

      return reply.send(response);
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "CAMPAIGN_UPDATE_FAILED", err.message);
    }
  });
}
