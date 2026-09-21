export default function loyaltyHistoryRoutes(app) {
  const loyaltyHistoryCollectionName = "loyaltyHistory";

  function sendError(reply, status, code, message) {
    return reply.code(status).send({ error: { code, message } });
  }

  // returns max 4 personas not currently claimed by any session
  app.get("/loyaltyHistory", async (request, reply) => {
    const db = app.mongo.db;
    const customerId = request.headers["x-customer-id"];
    const { page = 1, limit = 20, explain } = request.query || {};

    if (!customerId)
      return sendError(
        reply,
        400,
        "CUSTOMER_ID_REQUIRED",
        "x-customer-id header is required",
      );

    try {
      const customer = await db.collection("customers").findOne({ customerId });
      if (!customer)
        return sendError(
          reply,
          404,
          "CUSTOMER_NOT_FOUND",
          "No customer found for this customer ID",
        );

      const filter = { customerId: customer.customerId };
      const skip = (Number(page) - 1) * Number(limit);
      const [loyaltyHistory, totalCount] = await Promise.all([
        db
          .collection(loyaltyHistoryCollectionName)
          .find(filter, { projection: { _id: 0, sessionId: 0, transactionId: 0 } })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .toArray(),
        db.collection(loyaltyHistoryCollectionName).countDocuments(filter),
      ]);

      const response = {
        data: { loyaltyHistory, page: Number(page), totalCount },
      };

      if (explain === "true") {
        response.meta = {
          explain: await db
            .collection(loyaltyHistoryCollectionName)
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .explain("executionStats"),
        };
      }

      return reply.send(response);
    } catch (err) {
      app.log.error(err);
      return sendError(
        reply,
        500,
        "LOYALTY_HISTORY_LOOKUP_FAILED",
        err.message,
      );
    }
  });
}
