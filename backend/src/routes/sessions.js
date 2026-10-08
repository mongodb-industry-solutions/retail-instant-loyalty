import { createLoyaltyEngine } from "../lib/loyaltyEngine.js";

export default function sessionsRoutes(app) {
  const collectionName = "customers";
  const { buildCustomerLoyaltyLogoutReset } = createLoyaltyEngine(app);

  function sendError(reply, status, code, message) {
    return reply.code(status).send({ error: { code, message } });
  }

  // returns max 4 personas not currently claimed by any session
  app.get("/sessions", async (request, reply) => {
    const db = app.mongo.db;
    const explain = request.query?.explain === "true";

    const shapeStage = {
      $project: {
        _id: 0,
        customerId: "$customerId",
        name: "$profile.firstName",
        lastName: "$profile.lastName",
        gender: "$profile.gender",
        activeTier: "$loyaltyDetails.activeTier",
        isAlwaysNewUser: { $eq: ["$isAlwaysNewUser", true] }, // normalizes missing/undefined to false
      },
    };

    const pipeline = [
      { $match: { "preferences.isActive": false } },
      {
        $facet: {
          newUsers: [
            { $match: { isAlwaysNewUser: true } },
            { $sample: { size: 2 } },
          ],
          returningUsers: [
            { $match: { isAlwaysNewUser: { $ne: true } } },
            { $sample: { size: 2 } },
          ],
        },
      },
      {
        $project: {
          customers: {
            $concatArrays: ["$newUsers", "$returningUsers"],
          },
        },
      },
      { $unwind: "$customers" },
      {
        $replaceRoot: {
          newRoot: "$customers",
        },
      },
      shapeStage,
    ];

    try {
      const cursor = db.collection(collectionName).aggregate(pipeline);
      const customers = await cursor.toArray();

      let explainResult;

      if (explain) {
        explainResult = await db
          .collection(collectionName)
          .aggregate(pipeline)
          .explain("executionStats");
      }

      return reply.send({
        data: { customers },
        meta: explain ? { explain: explainResult } : {},
      });
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "SESSIONS_LOOKUP_FAILED", err.message);
    }
  });

  // claim a customer for this session's UUID
  app.post("/sessions/start", async (request, reply) => {
    const sessionId = request.headers["x-session-id"];
    const { selectedCustomerId, explain } = request.body || {};

    if (!sessionId) {
      return sendError(
        reply,
        400,
        "SESSION_REQUIRED",
        "x-session-id header is required",
      );
    }
    if (!selectedCustomerId) {
      return sendError(
        reply,
        400,
        "CUSTOMER_REQUIRED",
        "selectedCustomerId is required",
      );
    }

    const db = app.mongo.db;

    try {
      // Only succeeds if this customer is still unclaimed.
      // Prevents two concurrent demo sessions from grabbing the same persona.
      const result = await db.collection(collectionName).findOneAndUpdate(
        { customerId: selectedCustomerId, "preferences.isActive": false },
        {
          $set: {
            "preferences.isActive": true,
            sessionId: sessionId,
            sessionStartedAt: new Date(),
          },
        },
        { returnDocument: "after" },
      );

      if (!result) {
        // Either the customerId doesn't exist, or it's already claimed by another session.
        return sendError(
          reply,
          409,
          "CUSTOMER_ALREADY_IN_USE",
          "This customer is not available — it may already be in an active session",
        );
      }

      const response = { data: { customer: result } };

      if (explain === true) {
        // Explain isn't meaningful on a completed findOneAndUpdate;
        // noting this rather than faking an explain payload for a write.
        response.meta = {
          explain: "N/A — explain not applicable to write operations",
        };
      }

      return reply.send(response);
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "SESSION_START_FAILED", err.message);
    }
  });

  // POST /sessions/end — release the customer; trigger cascades the rest
  app.post("/sessions/end", async (request, reply) => {
    const sessionId = request.headers["x-session-id"];
    const { explain } = request.body || {};

    if (!sessionId) {
      return sendError(
        reply,
        400,
        "SESSION_REQUIRED",
        "x-session-id header is required",
      );
    }
    const db = app.mongo.db;
    const customer = await db.collection("customers").findOne({ sessionId });
    if (!customer)
      throw {
        code: "CUSTOMER_NOT_FOUND",
        message: "Customer not found for session " + sessionId,
      };

    try {
      const updatePipeline = await buildCustomerLoyaltyLogoutReset(db, {
        customer,
      });
      const result = await db.collection(collectionName).findOneAndUpdate(
        { sessionId },
        updatePipeline,
        { returnDocument: "after" },
      );

      if (!result) {
        return sendError(
          reply,
          404,
          "SESSION_NOT_FOUND",
          "No active customer found for this session",
        );
      }

      // The retail_leafy_loyalty_customer_updated trigger reacts to this write:
      // deletes the matching loyaltyConfiguration doc, and (if isAlwaysNewUser)
      // clears that customer's orders/transactions. Nothing else to do here.
      const response = { data: {} };

      if (explain === true) {
        response.meta = {
          explain: "N/A — explain not applicable to write operations",
        };
      }

      return reply.send(response);
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "SESSION_END_FAILED", err.message);
    }
  });

  // Close all sessions - helpfull while developing the demo to have a clear start
  app.post("/sessions/end-all", async (request, reply) => {
    const db = app.mongo.db;

    try {
      const session = db.client.startSession();

      try {
        await session.withTransaction(async () => {
          await db.collection(collectionName).updateMany(
            {},
            {
              $set: {
                "preferences.isActive": false,
                sessionId: null,
                sessionStartedAt: null,
              },
            },
            { session },
          );

          await db
            .collection("loyaltyConfiguration")
            .deleteMany({}, { session });
        });

        return reply.send({ data: {} });
      } finally {
        await session.endSession();
      }
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "SESSION_END_ALL_FAILED", err.message);
    }
  });
}
