import { ProgressBar } from "@via-ds/components/progress-bar";
import {
  formatPrice,
  getNextTier,
  getTier,
  findTierDetails,
} from "@/lib/helper";
import styles from "./TierTrack.module.css";

export default function TierTrack({ amountSpent, tierInfo, rewardDetails }) {
  const tier = tierInfo?.activeTier;
  const next = tierInfo?.nextTier;
  // The backend computes the remaining spend for us; fall back to deriving it
  // from the threshold if it isn't present.
  const dollarsToNextTier = tierInfo?.dollarsNeededForNextTier;
  const maxValue = findTierDetails(rewardDetails, tier)?.threshold;

  if (!tier || maxValue === undefined) return null;

  const spent = Number.isFinite(amountSpent) ? amountSpent : 0;

  return (
    <div className={styles.wrap}>
      <ProgressBar
        aria-label={`${tier} tier progress`}
        value={spent}
        maxValue={maxValue}
      />
      <div className={styles.marks}>
        <span className={`${styles.mark} ${styles.markActive}`}>
          {tier.slice(0, 2).toUpperCase()}
        </span>
        {next && (
          <span className={styles.mark}>{next.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
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
