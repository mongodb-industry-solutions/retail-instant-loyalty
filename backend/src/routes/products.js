export default function productsRoutes(app) {
  app.get("/", async (request, reply) => {
    const products = await app.mongo.db
      .collection("products")
      .find({})
      .toArray();
    return products;
  });
}
