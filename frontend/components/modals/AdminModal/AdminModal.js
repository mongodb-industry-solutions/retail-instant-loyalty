import { useDispatch } from "react-redux";
import { H2, Text } from "@via-ds/components/typography";
import TierBadge from "@/components/TierBadge/TierBadge";
import { useSelector } from "react-redux";
import { useState, useRef } from "react";
import { updateLoyaltyConfig } from "@/lib/api";
import {
  selectLoyaltyConfig,
  setLoyaltyConfigData,
} from "@/redux/slices/GlobalSlice";
import styles from "./AdminModal.module.css";
import modal from "../Modal.module.css";
import shared from "../../shared.module.css";
import { Button } from "@via-ds/components/button";
import { formatPrice } from "@/lib/helper";
import { Banner, BannerVariant } from "@via-ds/components";

function RewardValueTab({ value, getChanges }) {
  return (
    <>
      <p>
        Set the reward redemption value by tier. These defaults are
        intentionally more conservative so the demo feels closer to a real
        retail loyalty program while still showing clear tier differentiation.
      </p>
      {value.map((reward, i) => (
        <div className={styles.row} key={reward.tierKey}>
          <TierBadge overwriteTier={reward.tierName} />
          <div className={styles.inputWrap}>
            <span>1$ =</span>
            <span>coins</span>
            <input
              type="number"
              step="10"
              min="5"
              max="100"
              value={reward.currencyValueForDollar}
              onChange={(e) =>
                getChanges(
                  value.map((tier, j) =>
                    j === i
                      ? {
                          ...tier,
                          currencyValueForDollar: Number(e.target.value) || 1,
                        }
                      : tier,
                  ),
                )
              }
              className={styles.centsInput}
            />
          </div>
        </div>
      ))}
    </>
  );
}

function CampaignTab({ value, getChanges }) {
  const currentCampaign = value.find((promo) => promo.isActive) ?? value[0];

  function patchCurrent(changes) {
    getChanges(
      value.map((promo) =>
        promo.promoId === currentCampaign?.promoId
          ? { ...promo, ...changes }
          : promo,
      ),
    );
  }

  function handlePromoChange(promoId) {
    getChanges(
      value.map((promo) => ({ ...promo, isActive: promo.promoId === promoId })),
    );
  }

  return (
    <>
      <p>
        Control the current campaign from one place. This is the deliberate demo
        moment: switch the multiplier live and show the banner and coin earnings
        change instantly, while Atlas Triggers enforce the rule operationally.
      </p>
      <div className={styles.grid}>
        <div className={shared.field}>
          <label>Promotion</label>
          {}
          <select
            className={styles.select}
            value={currentCampaign?.promoId ?? ""}
            onChange={(e) => handlePromoChange(e.target.value)}
          >
            {value.map((promo, index) => {
              return (
                <option key={index} value={promo.promoId}>
                  {promo.promoName}
                </option>
              );
            })}
          </select>
        </div>
        <div className={shared.field}>
          <label>Promo Duration</label>
          <input type="text" disabled={true} value="30 Days" />
        </div>
        <div className={shared.field}>
          <label>Multiplier</label>
          <select
            className={styles.select}
            value={String(currentCampaign?.multiplier ?? 1)}
            onChange={(e) =>
              patchCurrent({ multiplier: Number(e.target.value) })
            }
          >
            <option value="1">1×</option>
            <option value="2">2×</option>
            <option value="3">3×</option>
          </select>
        </div>
      </div>
      <div className={styles.note}>
        New campaign overview: <b>{currentCampaign?.banner ?? ""}</b> · Earn{" "}
        {currentCampaign?.multiplier ?? 1}× coins on every purchase.
      </div>
      <Banner className={`${styles.note} ${styles.noteSubtle}`}>
        The campaign banner updates immediately and the coins-earned calculation
        changes with no redeploy or ETL.
      </Banner>
              

    </>
  );
}

function TierThresholdsTab({ value, getChanges }) {
  function handleTierThresholdChange(key, rawVal) {
    const previous = key === 0 ? 0 : value[key - 1].tierThreshold;
    const next =
      key < value.length - 1 ? value[key + 1].tierThreshold : Infinity;
    let threshold = Number(rawVal);
    if (threshold <= previous) threshold = previous + 100;
    if (threshold >= next) threshold = next - 100;
    return value.map((t, i) =>
      i === key ? { ...t, tierThreshold: threshold } : t,
    );
  }

  return (
    <>
      <p>
        Set the cumulative merchandise spend needed to reach each tier. Bronze
        always starts at $0 — dragging a slider is clamped so tiers stay in
        order.
      </p>
      {value.map((t, index) =>
        t.tierKey === "bronze" ? null : (
          <div className={styles.sliderRow} key={index}>
            <div className={styles.sliderLabel}>
              <TierBadge overwriteTier={t.tierKey} />
              <span className={`${styles.sliderValue} mono`}>
                {formatPrice(t.tierThreshold)} spend
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="20000"
              step="100"
              value={t.tierThreshold}
              onChange={(e) =>
                getChanges(handleTierThresholdChange(index, e.target.value))
              }
              className={styles.tierSlider}
            />
          </div>
        ),
      )}
    </>
  );
}

export default function AdminModal({ onClose }) {
  const dispatch = useDispatch();
  const loyaltyData = useSelector(selectLoyaltyConfig);
  const original = useRef({
    rewardDetails: loyaltyData.rewardDetails,
    campaign: loyaltyData.campaign,
  });

  const [tab, setTab] = useState("promo");
  const [saving, setSaving] = useState(false);
  const [tierThresholds, setTierThresholds] = useState(() => [
    ...loyaltyData.rewardDetails,
  ]);

  const [campaign, setCampaign] = useState(() => [...loyaltyData.campaign]);

  // Returns only the items that changed, and within each only the fields
  // that changed — never the untouched original values.
  function changedEntries(edited, baseline) {
    const baselineById = new Map(baseline.map((item) => [item.tierKey, item]));

    return edited.flatMap((item) => {
      const before = baselineById.get(item.tierKey);
      const changedFields = Object.fromEntries(
        Object.entries(item).filter(
          ([key, value]) =>
            key !== "tierKey" &&
            JSON.stringify(value) !== JSON.stringify(before?.[key]),
        ),
      );

      return Object.keys(changedFields).length
        ? [{ tierKey: item.tierKey, ...changedFields }]
        : [];
    });
  }

  function changedCampaign(edited, baseline) {
    const active = edited.find((promo) => promo.isActive);
    if (!active) return null;

    const wasActive = baseline.find((promo) => promo.isActive);
    const promoSwitched = wasActive?.promoId !== active.promoId;
    const fieldsChanged =
      promoSwitched ||
      ["multiplier", "banner"].some(
        (field) => active[field] !== wasActive?.[field],
      );

    return fieldsChanged
      ? {
          promoId: active.promoId,
          isActive: true,
          multiplier: active.multiplier,
          banner: active.banner,
        }
      : null;
  }

  async function save() {
    const updatedRewards = changedEntries(
      tierThresholds,
      original.current.rewardDetails,
      original.current.rewardDetails,
    );
    const campaignChange = changedCampaign(campaign, original.current.campaign);

    console.log({ updatedRewards, campaignChange });

    const patch = {};
    if (updatedRewards.length > 0) patch.rewardUpdates = updatedRewards;
    if (campaignChange) patch.campaignUpdate = campaignChange;

    if (!Object.keys(patch).length) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      const response = await updateLoyaltyConfig(patch);
      dispatch(setLoyaltyConfigData(response));
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={modal.head}>
        <H2>Loyalty Setting</H2>
        <Button className={modal.close} onClick={onClose}>
          ✕
        </Button>
      </div>
      <div className={modal.tabs}>
        <Button
          className={`${modal.tab} ${tab === "value" ? modal.tabActive : ""}`}
          onClick={() => setTab("value")}
        >
          Reward value
        </Button>
        <Button
          className={`${modal.tab} ${tab === "tiers" ? modal.tabActive : ""}`}
          onClick={() => setTab("tiers")}
        >
          Tier thresholds
        </Button>
        <Button
          className={`${modal.tab} ${tab === "promo" ? modal.tabActive : ""}`}
          onClick={() => setTab("promo")}
        >
          Promo campaign
        </Button>
      </div>
      <div className={modal.body}>
        {tab === "value" && (
          <RewardValueTab
            value={tierThresholds}
            getChanges={setTierThresholds}
          />
        )}
        {tab === "tiers" && (
          <TierThresholdsTab
            value={tierThresholds}
            getChanges={setTierThresholds}
          />
        )}
        {tab === "promo" && (
          <CampaignTab value={campaign} getChanges={setCampaign} />
        )}
        <Button
          variant="primary"
          style={{ width: "100%", marginTop: 16 }}
          isLoading={saving}
          loadingText="Saving…"
          onClick={save}
        >
          Save changes
        </Button>
      </div>
    </>
  );
}
