export default function productsRoutes(app) {
  app.get("/products", async (request, reply) => {
    const products = await app.mongo.db
      .collection("products")
      .find({})
      .toArray();
    return products;
  });

  app.get("/products/recommendations", async (request, reply) => {
    const recommendations = await app.mongo.db
      .collection("orders")
      .aggregate([
        // 1. This customer's purchase history
        { $match: { customerId: request.query.customerId } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            timesBought: { $sum: "$items.quantity" },
            priority: { $first: 1 },
          },
        },

        // 2. Fallback: top sellers across all customers
        {
          $unionWith: {
            coll: "orders",
            pipeline: [
              { $unwind: "$items" },
              {
                $group: {
                  _id: "$items.productId",
                  timesBought: { $sum: "$items.quantity" },
                  priority: { $first: 2 },
                },
              },
              { $sort: { timesBought: -1 } },
              { $limit: 8 },
            ],
          },
        },

        // 3. De-duplicate: keep the best priority per product
        {
          $group: {
            _id: "$_id",
            priority: { $min: "$priority" },
            timesBought: { $max: "$timesBought" },
          },
        },
        { $sort: { priority: 1, timesBought: -1 } },
        { $limit: 4 },

        // 4. Product details
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "productId",
            as: "product",
          },
        },
        { $unwind: "$product" },

        // 5. Shape the response
        {
          $project: {
            _id: 0,
            productId: "$product.productId",
            name: "$product.name",
            imageURL: "$product.imageURL",
            price: "$product.price",
            reason: {
              $cond: [{ $eq: ["$priority", 1] }, "bought-before", "top-seller"],
            },
          },
        },
      ])
      .toArray();

    console.log("The recommendations are", recommendations);
    return recommendations;
  });
}
