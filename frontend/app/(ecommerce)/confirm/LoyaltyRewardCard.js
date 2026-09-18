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

export default function LoyaltyRewardCard() {
  const [phase, setPhase] = useState("after");
  const [tierupGlow, setTierupGlow] = useState(false);

  // { order, loyalty } — the POST /orders response envelope.
  const lastOrder = useSelector(selectLastOrder);
  const selectedUser = useSelector(selectSelectedUser);
  const { rewardDetails } = useSelector(selectLoyaltyConfig);

  useEffect(() => {
    setPhase("before");
    const t = setTimeout(() => setPhase("after"), 250);
    return () => clearTimeout(t);
  }, [lastOrder]);

  if (!lastOrder) return null;

  const order = lastOrder.order;
  const loyalty = lastOrder.loyalty ?? {};
  // The API reports the tier pair rather than a flag.
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
    activeTier: loyalty.newTier,
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
        <h3>🪙 Loyalty rewards earned</h3>
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
      {balanceRow(
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
          merchandise, and added{" "}
          <b>{formatPrice(loyalty.qualifyingSpend)}</b> toward tier progress.
        </div>
      )}
    </div>
  );
}
