/******************************************************************************
 *  8-HOUR INACTIVE SESSION CLEANUP TRIGGER                                  *
 *  ========================================================================  *
 *  PURPOSE                                                                   *
 *  -------                                                                   *
 *  This script finds active customer sessions that have been open for       *
 *  more than 8 hours and closes them automatically. It helps keep demo       *
 *  data clean when users leave without logging out, and makes those         *
 *  customer accounts available for future sessions.                         *
 *                                                                            *
 *  - Loyalty balances, tiers, spend, and order counts are recalculated       *
 *    before the session is closed.                                           *
 *  - Session-specific loyalty configuration, orders, transactions, and      *
 *    history are removed to prevent stale demo data from accumulating.      *
 *  - The customer record is rechecked before updating, so sessions that      *
 *    have changed or already closed are skipped.                            *
 *  - Failures are logged and recorded in `sessionCleanupFailures`.           *
 *                                                                            *
 *  IMPORTANT: Keep the loyalty calculations aligned with the session-end     *
 *  API logic.                                                                *
 *                                                                            *
 *  SCHEDULE: Configure as an **Atlas Scheduled Trigger** to run periodically.*
 *            The 8-hour threshold is based on each session's start time.     *
 ******************************************************************************/

exports = async function() {
  const serviceName = "<your-cluster-name>";
  const databaseName = "<db-name>";
  const db = context.services.get(serviceName).db(databaseName);

  // Collections
  
  const customersCollection = db.collection('customers');
  const ordersCollection = db.collection('orders');
  const transactionsCollection = db.collection('transactions');
  const loyaltyHistoryCollection = db.collection('loyaltyHistory');
  const seedLoyaltyConfigCollection = db.collection('seedLoyaltyConfiguration');
  const loyaltyConfigCollection = db.collection('loyaltyConfiguration');

  const now = new Date();

  // Sessions that started 8 hours ago or earlier
  const eightHoursAgo = new Date(
    now.getTime() - 8 * 60 * 60 * 1000,
  );

  // Customers with sessions opened > 8hrs ago
    const customers = await customersCollection
    .find({
      "preferences.isActive": true,
      sessionStartedAt: {
        $lte: eightHoursAgo,
      },
    })
  .toArray();
  
  console.log(`Found ${customers.length} sessions that have been active for 8+ hours.`,);

  let closedCount = 0;
  let failedCount = 0;

  // ---------------------------------------------------------
  // IMPORTANT. This logic mimics the logic of our POST session/end API (must keep logic identical)
  // Located inside the repo /backend/src/rputes/sessions.js
  // The reason we have this trigger is to clean sessions that users dont manually close (click on logout) 
  // To keep demo data clean, prevent data overload and allow to always have available users.
  // ---------------------------------------------------------
  
  for (const customer of customers) {
    try {
      const {
        _id,
        customerId,
        sessionId: previousSessionId,
        isAlwaysNewUser,
        loyaltyDetails = {},
      } = customer;

      // ---------------------------------------------------------
      // 1. Calculate the loyalty state after closing the session
      // ---------------------------------------------------------

      let newOrdersCount;
      let coinBalance;
      let activeTier;
      let nextTier;
      let tierActivatedAt;
      let cumulativeSpendDollars;

      if (isAlwaysNewUser) {
        newOrdersCount = 0;
        coinBalance = 0;
        activeTier = null;
        nextTier = "bronze";
        tierActivatedAt = null;
        cumulativeSpendDollars = 0;
      } else {
        const persistentOrdersFilter = {
          customerId,
          sessionId: { $exists: false },
        };

        const [newOrdersCountResult, orderSummary, loyaltySeed] = await Promise.all([
          db.collection("orders").countDocuments(persistentOrdersFilter),
          db
            .collection("orders")
            .aggregate([
              { $match: persistentOrdersFilter },
              {
                $group: {
                  _id: null,
                  cumulativeSpendDollars: { $sum: "$amountSummary.total" },
                  coinBalance: {
                    $sum: {
                      $subtract: [
                        { $ifNull: ["$coinsEarned", 0] },
                        { $ifNull: ["$coinsApplied", 0] },
                      ],
                    },
                  },
                },
              },
            ])
            .next(),
          seedLoyaltyConfigCollection.findOne(
            {},
            {
              projection: {
                _id: 0,
                seedFields: 1,
              },
            },
          ),
        ]);

        if (!loyaltySeed?.seedFields?.rewardDetails) {
          throw new Error(
            "Loyalty seed configuration is missing rewardDetails",
          );
        }

        newOrdersCount = newOrdersCountResult;
        coinBalance = orderSummary?.coinBalance || 0;
        cumulativeSpendDollars =
          orderSummary?.cumulativeSpendDollars || 0;

        // Same resolveTier logic as your loyaltyEngine resolveTier()
        const sortedRewardDetails = [
          ...loyaltySeed.seedFields.rewardDetails,
        ].sort(
          (a, b) => a.tierThreshold - b.tierThreshold,
        );

        let currentIndex = 0;

        for (
          let index = 0;
          index < sortedRewardDetails.length;
          index++
        ) {
          if (
            cumulativeSpendDollars >=
            sortedRewardDetails[index].tierThreshold
          ) {
            currentIndex = index;
          }
        }

        const current = sortedRewardDetails[currentIndex];
        const next =
          sortedRewardDetails[currentIndex + 1] || null;

        activeTier = current.tierKey;
        nextTier = next ? next.tierKey : null;
        tierActivatedAt = now;
      }

      // ---------------------------------------------------------
      // 2. Close the customer session
      // ---------------------------------------------------------

      const update = {
        $set: {
          "preferences.isActive": false,
          sessionId: null,
          sessionStartedAt: null,
          "loyaltyDetails.coinBalance": coinBalance,
          "loyaltyDetails.activeTier": activeTier,
          "loyaltyDetails.nextTier": nextTier,
          "loyaltyDetails.tierActivatedAt": tierActivatedAt,
          "loyaltyDetails.cumulativeSpendDollars":
            cumulativeSpendDollars,
          "loyaltyDetails.latestLoyaltyHistory": [],
          "loyaltyDetails.ordersCount": newOrdersCount,
        },
      };

      // Re-check that this is still the same active,
      // overlong session before modifying it.
      const result = await customersCollection.updateOne(
        {
          _id,
          "preferences.isActive": true,
          sessionStartedAt: {
            $lte: eightHoursAgo,
          },
          sessionId: previousSessionId,
        },
        update,
      );

      if (result.modifiedCount !== 1) {
        console.log(
          `Skipped customer ${customerId}: session changed or was already closed.`,
        );
        continue;
      }

      // ---------------------------------------------------------
      // 3. Clean all session-specific data
      // ---------------------------------------------------------

      await loyaltyConfigCollection.deleteOne({sessionId: previousSessionId,});

      await ordersCollection.deleteMany({sessionId: previousSessionId,});

      await transactionsCollection.deleteMany({sessionId: previousSessionId,});

      await loyaltyHistoryCollection.deleteMany({sessionId: previousSessionId,});

      closedCount++;

      console.log( `Closed and cleaned session ${previousSessionId} for customer ${customerId}`,);
    } catch (err) {
      failedCount++;

      console.error(`Failed to close session for customer ${customer.customerId}:`,err,);
      await db.collection("sessionCleanupFailures").insertOne({customerDocumentId: customer._id, sessionId: customer.sessionId, customerId: customer.customerId});
    }
  }

  return {
    checkedAt: now,
    found: customers.length,
    closed: closedCount,
    failed: failedCount,
  };
};