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
}
