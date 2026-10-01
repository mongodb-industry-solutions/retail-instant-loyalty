export function resolveTier(rewardDetails, cumulativeSpend) {
  const sorted = [...rewardDetails].sort(
    (a, b) => a.tierThreshold - b.tierThreshold,
  );

  let currentIndex = 0;
  for (let index = 0; index < sorted.length; index++) {
    if (cumulativeSpend >= sorted[index].tierThreshold) currentIndex = index;
  }

  const current = sorted[currentIndex];
  const next = sorted[currentIndex + 1] || null;

  return {
    tierKey: current.tierKey,
    currencyValueForDollar: current.currencyValueForDollar,
    nextTierKey: next ? next.tierKey : null,
    dollarsNeededForNextTier: next
      ? Math.max(0, next.tierThreshold - cumulativeSpend)
      : 0,
  };
}

export function createLoyaltyEngine(app) {
  function buildLoyaltyHistoryEntries({
    math,
    orderId,
    transactionId,
    customerId,
    sessionId,
    now,
  }) {
    const entries = [];
    if (math.coinsApplied > 0) {
      entries.push({
        historyId: `LH-${orderId}-REDEEM`,
        customerId,
        sessionId,
        orderId,
        transactionId,
        type: "redeem",
        coins: math.coinsApplied,
        coinBalance: math.newBalance,
        createdAt: now,
      });
    }
    if (math.coinsEarned > 0) {
      entries.push({
        historyId: `LH-${orderId}-EARN`,
        customerId,
        sessionId,
        orderId,
        transactionId,
        type: "earn",
        coins: math.coinsEarned,
        coinBalance: math.newBalance,
        createdAt: now,
      });
    }
    if (math.tierChanged) {
      entries.push({
        historyId: `LH-${orderId}-TIER-CHANGE`,
        customerId,
        sessionId,
        orderId,
        transactionId,
        type: "tier-change",
        coins: null,
        createdAt: now,
        tierKey: math.newTierKey,
        activatedAt: now,
        previousTier: math.oldTier,
        coinBalance: math.newBalance,
      });
    }
    return entries;
  }

  function buildCustomerLoyaltyDetailsUpdate({ math }) {
    const update = {
      $set: {
        "loyaltyDetails.coinBalance": math.newBalance,
        "loyaltyDetails.activeTier": math.newTierKey,
        "loyaltyDetails.nextTier": math.nextTierKey,
        "loyaltyDetails.cumulativeSpendDollars": math.newCumulativeSpendDollars,
      },
      $inc: { "loyaltyDetails.ordersCount": 1 },
    };

    return update;
  }

  async function buildCustomerLoyaltyLogoutReset(db, { customer, now = new Date() }) {
    const { customerId, isAlwaysNewUser } = customer;
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
        db
          .collection("seedLoyaltyConfiguration")
          .findOne({}, { projection: { _id: 0, seedFields: 1 } }),
      ]);

      if (!loyaltySeed?.seedFields?.rewardDetails) {
        throw new Error("Loyalty seed configuration is missing rewardDetails");
      }

      newOrdersCount = newOrdersCountResult;
      coinBalance = orderSummary?.coinBalance || 0;
      cumulativeSpendDollars = orderSummary?.cumulativeSpendDollars || 0;
      const resolvedTier = resolveTier(
        loyaltySeed.seedFields.rewardDetails,
        cumulativeSpendDollars,
      );
      activeTier = resolvedTier.tierKey;
      nextTier = resolvedTier.nextTierKey;
      tierActivatedAt = now;
    }

    const update = {
      $set: {
        "preferences.isActive": false,
        sessionId: null,
        sessionStartedAt: null,
        "loyaltyDetails.coinBalance": coinBalance,
        "loyaltyDetails.activeTier": activeTier,
        "loyaltyDetails.nextTier": nextTier,
        "loyaltyDetails.tierActivatedAt": tierActivatedAt,
        "loyaltyDetails.cumulativeSpendDollars": cumulativeSpendDollars,
        "loyaltyDetails.latestLoyaltyHistory": [],
        "loyaltyDetails.ordersCount": newOrdersCount,
      },
    };

    return update;
  }

  async function recalculateSessionCustomerTier(
    db,
    { sessionId, rewardDetails, now = new Date() },
  ) {
    const customer = await db.collection("customers").findOne({ sessionId });
    if (!customer) return;

    const loyaltyDetails = customer.loyaltyDetails || {};
    const resolved = resolveTier(
      rewardDetails,
      loyaltyDetails.cumulativeSpendDollars || 0,
    );

    const activeTierChanged = resolved.tierKey !== loyaltyDetails.activeTier;
    const nextTierChanged = resolved.nextTierKey !== loyaltyDetails.nextTier;

    if (!activeTierChanged && !nextTierChanged) {
      return;
    }

    const update = {
      $set: {
        "loyaltyDetails.activeTier": resolved.tierKey,
        "loyaltyDetails.nextTier": resolved.nextTierKey,
        "loyaltyDetails.tierActivatedAt": activeTierChanged
          ? now
          : loyaltyDetails.tierActivatedAt || null,
      },
    };

    await db.collection("customers").updateOne({ sessionId }, update);
  }

  return {
    buildLoyaltyHistoryEntries,
    buildCustomerLoyaltyDetailsUpdate,
    buildCustomerLoyaltyLogoutReset,
    recalculateSessionCustomerTier,
  };
}
