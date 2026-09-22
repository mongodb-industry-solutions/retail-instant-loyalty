import { sendError } from "../lib/orderEngine.js";
export default function customersRoutes(app) {
  const collectionName = "customers";
  const db = app.mongo.db;

  app.get("/customers/:customerId", async (request, reply) => {
    const customer = await db
      .collection(collectionName)
      .findOne({ customerId: request.params.customerId });
    if (!customer) {
            return sendError(reply, 400, "CUSTOMER_NOT_FOUND", "Customer not found");      
    }
    return customer;
  });

}
