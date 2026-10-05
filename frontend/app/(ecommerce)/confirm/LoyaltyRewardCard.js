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
} from "@/redux/slices/GlobalSlice";
import TierTrack from "@/components/TierTrack/TierTrack";
import { Badge } from "@via-ds/components/badge";
import { Icon } from "@via-ds/icons";

// `order` is the currently active transaction — whichever of the last order
// or last redeem happened most recently — with `loyalty` merged onto it by
// the caller (confirm/page.js), so this card (and its tier track) reflects
// a redeem instead of staying stuck on the original purchase.
export default function LoyaltyRewardCard({ order }) {
  const [phase, setPhase] = useState("after");
  const [tierupGlow, setTierupGlow] = useState(false);
  const selectedUser = useSelector(selectSelectedUser);
  const { rewardDetails } = useSelector(selectLoyaltyConfig);

  useEffect(() => {
    setPhase("before");
    setTierupGlow(false);
    const loyaltyForOrder = order?.loyalty ?? {};
    const changed = loyaltyForOrder.newTier !== loyaltyForOrder.oldTier;
    const t = setTimeout(() => {
      setPhase("after");
      if (changed) setTierupGlow(true);
    }, 250);
    return () => clearTimeout(t);
    // `order` is a fresh object identity every render (built inline by the
    // caller) — key off orderId instead, or this refires and setPhase loops
    // forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.orderId]);

  if (!order) return null;

  const loyalty = order.loyalty ?? {};

  const tierChanged = loyalty.newTier !== loyalty.oldTier;

  const displayCoinTotal =
    phase === "before" ? loyalty.oldBalance : loyalty.newBalance;

  const cumulativeSpend =
    selectedUser.loyaltyDetails?.cumulativeSpendDollars ?? 0;
  const displayTierSpend =
    phase === "before"
      ? cumulativeSpend - (loyalty.qualifyingSpend ?? 0)
      : cumulativeSpend;

  const cardClass = `${styles.rewardCard}${tierupGlow ? ` ${styles.rewardCardGlow}` : ""}`;

  const tierInfo = {
    activeTier: phase === "before" ? loyalty.oldTier : loyalty.newTier,
    nextTier: selectedUser.loyaltyDetails?.nextTier,
    dollarsNeededForNextTier: loyalty.dollarsNeededForNextTier,
  };
  const multiplier = loyalty.multiplier ?? 1;
  // Tiers come through lowercase ("gold"); this card shows them as a label.
  const tierLabel = loyalty.newTier
    ? loyalty.newTier.charAt(0).toUpperCase() + loyalty.newTier.slice(1)
    : "—";

  const balanceRow = (description) => (
    <div className={styles.rewardNumbers}>
      <span className={styles.rnEarned}>{description}</span>
      <Icon glyph="ArrowRight" />
      <span className={styles.rnTotal}>
        {displayCoinTotal.toLocaleString()}
      </span>
      <Badge variant="info" className={styles.rnTier}>
        {tierLabel}
      </Badge>
    </div>
  );

  return (
    <div className={cardClass}>
      <div className={styles.rewardHead}>
        {order.coinsEarned > 0 ? (
          <h3>🪙 Loyalty rewards earned</h3>
        ) : (
          <h3>Loyalty Progress</h3>
        )}
        {tierChanged && <span className={styles.tierupBadge}>Tier up!</span>}
      </div>
      {tierChanged && (
        <div
          className={`${styles.tierupCelebration}${phase === "after" ? ` ${styles.tierupCelebrationShow}` : ""}`}
        >
          <span className={styles.burst}>🎉</span>
          <span>Upgraded to {tierLabel}</span>
        </div>
      )}

      {order.coinsEarned > 0 &&
        balanceRow(
          `+${(order.coinsEarned ?? 0).toLocaleString()}${multiplier > 1 ? ` (${multiplier}× active)` : ""}`,
        )}
      <TierTrack
        amountSpent={displayTierSpend}
        tierInfo={tierInfo}
        rewardDetails={rewardDetails}
      />
      {order.coinsApplied > 0 && (
        <div className={shared.coinPreview} style={{ margin: "14px 0 0" }}>
          Applied <b>{order.coinsApplied.toLocaleString()}</b> coins at
          checkout, earned <b>{(order.coinsEarned ?? 0).toLocaleString()}</b>{" "}
          coins on <b>{formatPrice(order.amountSummary.subtotal)}</b> cash-paid
          merchandise, and added <b>{formatPrice(loyalty.qualifyingSpend)}</b>{" "}
          toward tier progress.
        </div>
      )}
    </div>
  );
}
