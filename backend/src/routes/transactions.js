import { sendError } from "../lib/orderEngine.js";

export default function transactionsRoutes(app) {
  app.get("/transactions/:orderId", async (request, reply) => {
    const customerId = request.headers["x-customer-id"];
    const { orderId } = request.params;
    if (!customerId)
      return sendError(reply, 400, "CUSTOMER_ID_REQUIRED", "x-customer-id header is required");

    const db = app.mongo.db;
    try {
      const order = await db.collection("orders").findOne({ orderId, customerId });
      if (!order)
        return sendError(reply, 404, "ORDER_NOT_FOUND", "Order not found for this customer");

      const transaction = await db.collection("transactions").findOne({
        orderId,
        customerId,
        transactionId: order.transactionId,
      });
      if (!transaction)
        return sendError(reply, 404, "TRANSACTION_NOT_FOUND", "Transaction not found for this customer's order");

      return reply.send({ data: transaction });
    } catch (err) {
      app.log.error(err);
      return sendError(reply, 500, "TRANSACTION_LOOKUP_FAILED", err.message);
    }
  });
}