"use client";

import styles from "./ConfirmView.module.css";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { H3 } from "@via-ds/components/typography";
import shared from "@/components/shared.module.css";
import { formatPrice } from "@/lib/helper";
import {
  selectSelectedUser,
  selectLoyaltyConfig,
  selectLastOrder,
} from "@/redux/slices/GlobalSlice";
import TierTrack from "@/components/TierTrack/TierTrack";
import { Badge } from "@via-ds/components/badge";
import { Icon } from "@via-ds/icons";

const FALLBACK_LAST_ORDER = {
  order: {
    orderId: "MS-118820",
    customerId: "CUST-10002",
    items: [
      {
        productId: "PROD-1001",
        name: "Trail Runner Jacket",
        price: 99.98,
        quantity: 1,
      },
    ],
    amountSummary: {
      subtotal: 99.98,
      shipping: 0,
      tax: 8.5,
      total: 108.48,
    },
    transactionId: "TXN-99213",
    rewardsEarned: 99,
    statusHistory: [{ Status: "placed", lastUpdated: null }],
    createdAt: "2026-09-03T15:12:00.000Z",
  },
  loyalty: {
    oldBalance: 3240,
    newBalance: 3939,
    oldTier: "gold",
    newTier: "gold",
    tierChanged: false,
    qualifyingSpend: 99.98,
    coinsUsed: 0,
  },
};

export default function LoyaltyRewardCard() {
  const [phase, setPhase] = useState("after");
  const [tierupGlow, setTierupGlow] = useState(false);

  const storedLastOrder = useSelector(selectLastOrder);
  const selectedUser = useSelector(selectSelectedUser);
  const { rewardDetails } = useSelector(selectLoyaltyConfig);

  const lastOrder = FALLBACK_LAST_ORDER;

  useEffect(() => {
    setPhase("before");
    const t = setTimeout(() => setPhase("after"), 250);
    return () => clearTimeout(t);
  }, [lastOrder]);

  const displayCoinTotal =
    phase === "before"
      ? lastOrder.loyalty.oldBalance
      : lastOrder.loyalty.newBalance;

  const beforeTotalAmount =
    selectedUser.loyaltyDetails.cumulativeSpendDollars -
    lastOrder.loyalty.qualifyingSpend;

  const displayTierSpend =
    phase === "before"
      ? beforeTotalAmount
      : selectedUser.loyaltyDetails.cumulativeSpendDollars;

  console.log("displayTierSpend:", displayTierSpend);

  const cardClass = `${styles.rewardCard}${tierupGlow ? ` ${styles.rewardCardGlow}` : ""}`;

  const tierInfo = {
    activeTier: lastOrder.loyalty.newTier,
    nextTier: selectedUser.loyaltyDetails.nextTier,
  };
  // Promo multiplier isn't part of the loyalty API response (campaign only
  // carries promoName/banner/isActive) -- hardcoded to match the static
  // "2x loyalty coins" text in Navbar's PromoBanner until it's a real field.
  const promoMultiplierText = "2x";

  const balanceRow = (description) => (
    <div className={styles.rewardNumbers}>
      <span className={styles.rnEarned}>{description}</span>
      <Icon glyph="ArrowRight" />
      <span className={styles.rnTotal}>
        {displayCoinTotal.toLocaleString()}
      </span>
      <Badge variant="info" className={styles.rnTier}>
        {lastOrder.loyalty.newTier.charAt(0).toUpperCase() +
          lastOrder.loyalty.newTier.slice(1)}
      </Badge>
    </div>
  );

  return (
    <div className={cardClass}>
      <div className={styles.rewardHead}>
        <h3>🪙 Loyalty rewards earned</h3>
        {lastOrder.loyalty.tierChanged && (
          <span className={styles.tierupBadge}>Tier up!</span>
        )}
      </div>
      {lastOrder.loyalty.tierChanged && (
        <div
          className={`${styles.tierupCelebration}${phase === "after" ? ` ${styles.tierupCelebrationShow}` : ""}`}
        >
          <span className={styles.burst}>🎉</span>
          <span>
            Upgraded to{" "}
            {lastOrder.loyalty.newTier.charAt(0).toUpperCase() +
              lastOrder.loyalty.newTier.slice(1)}
          </span>
        </div>
      )}
      {balanceRow(
        `+${(lastOrder.loyalty.newBalance - lastOrder.loyalty.oldBalance).toLocaleString()} (${promoMultiplierText} active)`,
      )}
      <TierTrack
        amountSpent={displayTierSpend}
        tierInfo={tierInfo}
        rewardDetails={rewardDetails}
      />
      {lastOrder.loyalty.coinsUsed > 0 && (
        <div className={shared.coinPreview} style={{ margin: "14px 0 0" }}>
          Applied <b>{lastOrder.loyalty.coinsUsed.toLocaleString()}</b> coins at
          checkout, earned <b>{lastOrder.rewardsEarned.toLocaleString()}</b>{" "}
          coins on <b>{formatPrice(lastOrder.amountSummary.subtotal)}</b>{" "}
          cash-paid merchandise, and added{" "}
          <b>{formatPrice(lastOrder.loyalty.qualifyingSpend)}</b> toward tier
          progress.
        </div>
      )}
    </div>
  );
}
