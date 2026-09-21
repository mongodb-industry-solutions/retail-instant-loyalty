import { ProgressBar } from "@via-ds/components/progress-bar";
import {
  formatPrice,
  getNextTier,
  getTier,
  findTierDetails,
} from "@/lib/helper";
import styles from "./TierTrack.module.css";

export default function TierTrack({ amountSpent, tierInfo, rewardDetails }) {
  console.log("tierInfo:", tierInfo);
  console.log("rewardDetails:", rewardDetails);
  console.log("amountSpent:", amountSpent);

  const tier = tierInfo?.activeTier;
  const next = tierInfo?.nextTier;
  // The backend computes the remaining spend for us; fall back to deriving it
  // from the threshold if it isn't present.

  console.log("thre", findTierDetails(rewardDetails, tier));

  const spent = Number.isFinite(amountSpent) ? amountSpent : 0;
  const maxValue = next
    ? findTierDetails(rewardDetails, next)?.tierThreshold
    : spent;

  const dollarsToNextTier = next
    ? tierInfo?.dollarsNeededForNextTier || Math.max(maxValue - spent, 0)
    : 0;

  if (!tier || maxValue === undefined) return null;

  return (
    <div className={styles.wrap}>
      <ProgressBar
        aria-label={`${tier} tier progress`}
        value={spent}
        maxValue={maxValue}
      />

      <div className={styles.foot}>
        <span className="mono">
          {formatPrice(spent)} / {formatPrice(maxValue)} cumulative spend
        </span>
        <span className={styles.toNext}>
          {next
            ? `${formatPrice(dollarsToNextTier ?? Math.max(maxValue - spent, 0))} to ${next}`
            : "Top tier reached"}
        </span>
      </div>
    </div>
  );
}
