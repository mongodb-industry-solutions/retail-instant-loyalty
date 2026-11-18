# 🗃️ Collections Setup Guide

This guide will walk you through the setup for the MongoDB Atlas collections powering the instant loyalty demo. You'll learn *how* to restore the sample data, *which* collections exist and what role each one plays, and *which* Atlas Triggers keep the demo data clean.

---

## 1. 🏗️ Database Setup

Start by creating a MongoDB database. We recommend naming it `retail_leafy_loyalty` (update the `DATABASE_NAME` variable in your backend `.env` if you choose a different name).

---

## 2. 📦 Import Demo Collections

The sample data in this folder is a `mongodump` export: each collection ships as a `.bson` data file plus a `.metadata.json` file (which contains its indexes and collection options).

| Collection                  | Purpose                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `customers`                 | Loyalty members: profile, preferences, session state (`sessionId`, `preferences.isActive`) and embedded `loyaltyDetails` (coin balance, tiers, cumulative spend). |
| `products`                  | Product catalog served to the storefront.                                                                                 |
| `orders`                    | Orders placed during a session, including amounts, coins earned and coins applied.                                        |
| `transactions`              | Payment transactions associated with orders.                                                                              |
| `loyaltyHistory`            | Per-customer log of loyalty events (coins earned/spent, tier changes).                                                     |
| `loyaltyConfiguration`      | Session-scoped loyalty configuration, created automatically per active session by an Atlas Trigger.                        |
| `seedLoyaltyConfiguration`  | The seed/template document used to generate each session's `loyaltyConfiguration` entry.                                   |
| `counters`                  | Auto-increment sequence counters used to generate order numbers.                                                           |
| `sessionCleanupFailures`    | Log of sessions the scheduled cleanup trigger failed to close (for troubleshooting).                                       |                                                         |

> ⚠️ **One seed rule keeps sessions independent: the `sessionId` is off the seeded data.**
> The app treats a document (e.g., an order) **without** a `sessionId` as **permanent history**, and a document **with** a `sessionId` as **temporary demo data** — the Atlas Triggers delete everything matching the session's `sessionId` when the session ends. So if you add your own seed orders, transactions, or loyalty history, omit the `sessionId` field or they will be wiped at session cleanup.
> Likewise, `seedLoyaltyConfiguration` is the template for all loyalty rules: keep its rules nested under a `seedFields` object (the trigger spreads `seedFields` into each new session's `loyaltyConfiguration` document, adding the `sessionId` itself).

### Importing Data

From the repository root, restore everything into your cluster with [`mongorestore`](https://www.mongodb.com/docs/database-tools/mongorestore/):

```bash
mongorestore \
  --uri "mongodb+srv://<user>:<password>@<your-cluster>.mongodb.net" \
  --db retail_leafy_loyalty \
  docs/setup/collections
```

> 💡 `mongorestore` reads the `.metadata.json` files automatically, so all secondary indexes and collection options are recreated for you. In particular, the `customers` collection is restored with **changeStreamPreAndPostImages enabled**, which the customer-update Atlas Trigger requires (it needs the document pre-image).

---

## 3. 🧠 Data Modeling

**Relational vs. MongoDB — Two approaches. Two mindsets.**

### In relational databases
- You model entities and relationships first — using strict normalization (Third Normal Form).
  There's essentially one "right" way to model the data.
- Then you write the queries (the workload).
- You avoid duplication and rely on joins.
- ✏️ The schema is rigid and expensive to change.

### In MongoDB
- 🍃 You start by analyzing the workload — estimating data size and measuring read/write operations.
- 🍃 You identify and quantify relationships — embedding or referencing as appropriate.
- 🍃 You apply schema design patterns for peak performance.
- ✏️ The schema is flexible and evolves without friction.

---

## 4. ⚡ Indexes

This demo uses **regular (B-tree) indexes only** — no Atlas Search or Vector Search indexes are required.

- If you restored the data with `mongorestore` as shown above, all indexes were **created automatically** from the `.metadata.json` files in this folder.
- If you imported the data another way, create the indexes defined in the `.metadata.json` files in this folder.
- Check the index configuration guide [here](../indexes/README.md).

---

## 5. ⚙️ Atlas Triggers (Demo Housekeeping)

> ⚠️ These triggers exist **for demo purposes only** — in a productive environment you would handle the cleaning differently. They keep demo data clean and make customer accounts reusable between sessions. We document them here so you can replicate the full demo experience.

The trigger source code lives in [`docs/setup/atlas-triggers`](../atlas-triggers/):

| File                                          | Type                | What it does                                                                                                                                                                                            |
| --------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `retail_leafy_loyalty_customer_updated.js`    | Database trigger    | Watches `customers` for update/replace events where `sessionId` or `preferences.isActive` changes. When a session starts, it creates a session-specific `loyaltyConfiguration` document from the seed; when a session ends, it deletes that session's `loyaltyConfiguration`, `orders`, `transactions`, and `loyaltyHistory` documents. |
| `retail_leafy_loyalty_close_long_sessions.js` | Scheduled trigger   | Runs periodically and closes sessions that have been active for **8+ hours** (users who left without logging out). It recalculates loyalty balances, tiers, spend, and order counts (mirroring the `POST /session/end` API logic), closes the session, and cleans up all session-specific data. Failures are recorded in `sessionCleanupFailures`. |

### Configuration notes

- In both scripts, replace `<your-cluster-name>` and `<db-name>` with your linked cluster name and database name (e.g. `retail_leafy_loyalty`).
- The **customer-update trigger** must be configured as a *Database trigger* on `retail_leafy_loyalty.customers`, listening for **Update Document** and **Replace Document** operations, with **Full Document** and **Document Pre-Image** enabled.
- The **session cleanup trigger** must be configured as an *Atlas Scheduled Trigger* (the 8-hour threshold is measured from each session's `sessionStartedAt`).
- ⚠️ The cleanup trigger intentionally mirrors the loyalty calculations of the `POST /session/end` API (`backend/src/routes/sessions.js`). If you change one, keep the other in sync.

---

## 6. 📚 Dataset Source

- [Amazon Berkeley Objects (ABO) Dataset](https://amazon-berkeley-objects.s3.amazonaws.com/index.html)\
  We took a small subset of products from this dataset and modified the document schemas to fit the instant loyalty demo.

---

> ✅ Collections are ready!\
> Next step: Go back to the [root README](../../../README.md) to continue the app setup and explore the instant loyalty demo.
