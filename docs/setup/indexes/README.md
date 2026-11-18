# Indexes – Setup Guide

> This guide complements:
> - **Root README** (overview, app startup)
> - **Collections Setup Guide** ([`docs/setup/collections/README.md`](../collections/README.md)) – data import, modeling and triggers
> Here we focus exclusively on the **indexes** used by the demo and how to verify them.

---

## What You Will Create

**Nothing manually — if you restored the data with `mongorestore`.** 🎉

This demo uses **regular (B-tree) indexes only**. There are **no Atlas Search, Vector Search, or geospatial indexes**. All indexes below are defined in the `.metadata.json` files inside [`docs/setup/collections`](../collections/) and are **created automatically** by `mongorestore` during the data import step.

---

## Index Inventory (non-default indexes)

**Guiding principle: add indexes that match the query patterns in the API.** Every index below exists because a backend route or Atlas Trigger filters or sorts on those exact fields — no more, no less. If you extend the API with new query patterns, add matching indexes.

| Collection       | Index name               | Keys                          | Options          | Why it exists                                                                 |
| ---------------- | ------------------------ | ----------------------------- | ---------------- | ------------------------------------------------------------------------------ |
| `customers`      | `customerId_1`           | `{ customerId: 1 }`           | `unique: true`   | Fast customer lookups; guarantees one document per customer.                   |
| `customers`      | `preferences.isActive_1` | `{ preferences.isActive: 1 }` | —                | Powers active-session queries (e.g., the scheduled session cleanup trigger).   |
| `products`       | `productId_1`            | `{ productId: 1 }`            | —                | Fast catalog lookups by business product ID.                                   |
| `orders`         | `customerId_1`           | `{ customerId: 1 }`           | —                | Per-customer order history and loyalty recalculations.                         |
| `orders`         | `createdAt_-1`           | `{ createdAt: -1 }`           | —                | Newest-first order listings.                                                   |
| `loyaltyHistory` | `customerId_1`           | `{ customerId: 1 }`           | —                | Per-customer loyalty event lookups.                                            |
| `loyaltyHistory` | `createdAt_-1`           | `{ createdAt: -1 }`           | —                | Newest-first loyalty activity feeds.                                           |

The remaining collections (`transactions`, `loyaltyConfiguration`, `seedLoyaltyConfiguration`, `counters`, `sessionCleanupFailures`, `product_backup`) only use the default `_id` index.

> 💡 Not an index, but restored from the same metadata: the `customers` collection has **changeStreamPreAndPostImages enabled**, which the customer-update Atlas Trigger requires.

---

## Manual Creation (only if you imported data another way)

If you did **not** use `mongorestore` (e.g., you inserted documents via Compass or a script), create the indexes yourself in `mongosh`:

```javascript
use("retail_leafy_loyalty");

db.customers.createIndex({ customerId: 1 }, { unique: true });
db.customers.createIndex({ "preferences.isActive": 1 });

db.products.createIndex({ productId: 1 });
db.orders.createIndex({ customerId: 1 });
db.orders.createIndex({ createdAt: -1 });

db.loyaltyHistory.createIndex({ customerId: 1 });
db.loyaltyHistory.createIndex({ createdAt: -1 });
```

---

## Verify Your Indexes (1 min)

Run this in `mongosh` to list every index in the database:

```javascript
use("retail_leafy_loyalty");

db.getCollectionNames().forEach(collection => {
  print(`\nCollection: ${collection}`);
  printjson(db.getCollection(collection).getIndexes());
});
```

Compare the output against the **Index Inventory** table above.

---

> ✅ Indexes are ready!\
> Next step: Go back to the [root README](../../../README.md) to continue the app setup.
