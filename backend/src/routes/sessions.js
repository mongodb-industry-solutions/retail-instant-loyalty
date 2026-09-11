export default function sessionsRoutes(app) {
  const collectionName = "customers";

  function sendError(reply, status, code, message) {
    return reply.code(status).send({ error: { code, message } });
  }

  // returns max 4 personas not currently claimed by any session
  app.get("/sessions", async (request, reply) => {
    const db = app.mongo.db;
    const explain = request.body?.explain === true;

    const shapeStage = {
      $project: {
        _id: 0,
        customerId: "$CustomerID",
        name: "$profile.firstName",
        lastName: "$profile.lastName",
        gender: "$profile.gender",
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


}
