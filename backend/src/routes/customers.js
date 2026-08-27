export default function customersRoutes(app) {
  const collectionName = "customers";
  const db = app.mongo.db;

  app.get("/customers", async () => {
    const listOfCustomers = await db
      .collection(collectionName)
      .find({ isActive: false })
      .limit(4)
      .toArray();
    console.log("The customers are ", listOfCustomers);
    return listOfCustomers;
  });

  app.get("/:id", async (request, reply) => {
    const customer = await db
      .collection(collectionName)
      .findOne({ _id: request.params.id });
    if (!customer) {
      return reply.code(404).send({ error: "Customer not found" });
    }
    return customer;
  });

  app.patch("/:id", async (request, reply) => {
    const { loyalty, card } = request.body || {};
    const setFields = {};

    const update = await db
      .collection(collectionName)
      .findOneAndUpdate({ _id: request.params.id }, { $set: setFields });
  });
}
