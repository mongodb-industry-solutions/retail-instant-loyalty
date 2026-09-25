export function createChangeStream(app, { collection, filter }) {
  return app.mongo.db.collection(collection).watch(
    [
      {
        $match: {
          operationType: { $in: ["insert", "update", "replace"] },
          ...filter,
        },
      },
    ],
    { fullDocument: "updateLookup" },
  );
}