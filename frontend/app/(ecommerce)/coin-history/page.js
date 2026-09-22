"use client";

import { useRouter } from "next/navigation";

import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { currentTierFor, formatCoinValue } from "@/lib/helper";
import TierTrack from "@/components/TierTrack/TierTrack";
import styles from "./CoinHistoryView.module.css";
import profile from "@/components/Profile.module.css";
import shared from "@/components/shared.module.css";
import { fetchLoyaltyHistory } from "@/lib/api";
import {
  selectSelectedUser,
  selectLoyaltyConfig,
} from "@/redux/slices/GlobalSlice";

export default function CoinHistoryView() {
  const router = useRouter();
  const persona = useSelector(selectSelectedUser);
  const rewardDetails = useSelector(selectLoyaltyConfig)?.rewardDetails ?? [];
  const tierDetails = rewardDetails.filter(
    (tier) => tier.tierKey === persona.loyaltyDetails?.activeTier,
  );
  const tierInfo = {
    activeTier: persona.loyaltyDetails?.activeTier,
    nextTier: persona.loyaltyDetails?.nextTier,
    dollarsNeededForNextTier: persona.loyaltyDetails?.dollarsNeededForNextTier,
  };
  const [loyaltyDetails, setLoyaltyDetails] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchLoyaltyHistory({ customerId: persona.customerId })
      .then((loyaltyHistoryData) => {
        if (cancelled) return;
        setLoyaltyDetails(loyaltyHistoryData ?? []);
      })
      .catch((error) => {
        if (cancelled) return;

        setLoyaltyDetails([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className={shared.page}>
      <div className={shared.crumb}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            router.push("/");
          }}
        >
          Continue shopping
        </a>{" "}
        / <span className={shared.current}>Coin history</span>
      </div>
      <div className={profile.profileHead}>
        <div
          className={profile.profileAvatar}
          style={{ background: persona.avatarBg, color: persona.avatarColor }}
        >
          {persona.profile.firstName.slice(0, 1)}
        </div>
        <div>
          <div className={profile.profileName}>
            {persona.profile.firstName} {persona.profile.lastName}
          </div>
          <div className={profile.profileSub}>
            {persona.loyaltyDetails.cumulativeSpendDollars > 0
              ? `${persona.loyaltyDetails.activeTier} tier · 1 Dollar = ${tierDetails[0].currencyValueForDollar}`
              : "New customer · no tier yet"}
          </div>
        </div>
        <div className={profile.profileBalance}>
          <div className={profile.lbl}>Coin balance</div>
          <div className={`${profile.num} mono`}>
            {persona.loyaltyDetails?.coinBalance.toLocaleString()}
          </div>
        </div>
      </div>
      {persona.loyaltyDetails.cumulativeSpendDollars > 0 && (
        <div className={profile.profileTrackCard}>
          <TierTrack
            amountSpent={Math.round(
              persona.loyaltyDetails.cumulativeSpendDollars,
            )}
            tierInfo={tierInfo}
            rewardDetails={rewardDetails}
            customerData={persona}
          />
        </div>
      )}
      <div className={shared.historyCard}>
        <h3>Transaction history</h3>
        {loyaltyDetails === null ? (
          <div className={shared.historyEmpty}>Loading…</div>
        ) : loyaltyDetails.length === 0 ? (
          <div className={shared.historyEmpty}>
            No coin activity yet. Place an order to start earning.
          </div>
        ) : (
          loyaltyDetails?.loyaltyHistory?.map((loyalty, idx) => (
            <div className={styles.historyRow} key={idx}>
              <div>
                <div
                  className={`${styles.historyType} ${loyalty.type === "earned" ? styles.historyTypeEarned : styles.historyTypeRedeemed}`}
                >
                  {loyalty.type === "earn" ? "↑ Earned" : "↓ Redeemed"}
                </div>
                <div className={styles.historyLabel}>{loyalty.label}</div>
                <div className={`${styles.historyOrder} mono`}>
                  {loyalty.orderId}
                </div>
              </div>
              <div className={styles.historyRight}>
                <div
                  className={`${styles.historyDelta} ${loyalty.type === "earn" ? styles.historyDeltaEarned : styles.historyDeltaRedeemed} mono`}
                >
                  {loyalty?.coins > 0 ? "+" : ""}
                  {loyalty?.coins.toLocaleString()}
                </div>
                <div className={`${styles.historyBalance} mono`}>
                  Balance: {(loyalty?.coinBalance).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
