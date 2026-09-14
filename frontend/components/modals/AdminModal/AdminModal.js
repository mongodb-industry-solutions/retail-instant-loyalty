import { useDispatch } from "react-redux";
import { H2, Text } from "@via-ds/components/typography";
import { useSelector } from "react-redux";
import { useState } from "react";
import { toast } from "@via-ds/components/toast";
import { updateLoyaltyConfig } from "@/lib/api";
import {
  selectLoyaltyConfig,
  saveRewardDetailsSuccess,
  saveCampaignSuccess,
} from "@/redux/slices/GlobalSlice";
import styles from "./AdminModal.module.css";
import modal from "../Modal.module.css";
import shared from "../../shared.module.css";
import { Button } from "@via-ds/components/button";
import { Badge } from "@via-ds/components/badge";
import { tierBadgeVariant } from "@/components/tierBadgeVariant";
import { PROMO_HOLIDAYS } from "@/lib/data";
import { promoDateWindow, formatPrice, roundCurrency } from "@/lib/helper";
import { coinDollarValue } from "@/shared/pricing";

function RewardValueTab({ loyaltyData, dispatch, onSaved }) {
  console.log("loyaltyData", loyaltyData);
  const [values, setValues] = useState(() => {
    const init = {};
    loyaltyData.rewardDetails.forEach((loyalty) => {
      init[loyalty.tierKey] = String(
        roundCurrency(coinDollarValue(loyalty) * 100),
      );
    });
    return init;
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const nextRewardDetails = loyaltyData.rewardDetails.map((t) => {
      const dollarsPerHundred = parseFloat(values[t.tierKey]) || 1;
      return { ...t, currencyValue: dollarsPerHundred / 100 };
    });
    try {
      const config = await updateLoyaltyConfig({
        rewardDetails: nextRewardDetails,
      });
      dispatch(saveRewardDetailsSuccess(config));
      toast.success("Reward values updated — live across the store");
      onSaved();
    } catch (err) {
      toast.error(`Couldn't save reward values: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <p>
        Set the reward redemption value by tier. These defaults are
        intentionally more conservative so the demo feels closer to a real
        retail loyalty program while still showing clear tier differentiation.
      </p>
      {loyaltyData.rewardDetails.map((reward) => (
        <div className={styles.row} key={reward.tierKey}>
          <Badge variant={tierBadgeVariant(reward.tierKey)}>
            {reward.tierName}
          </Badge>
          <div className={styles.inputWrap}>
            <span>100 coins =</span>
            <span>$</span>
            <input
              type="number"
              step="0.25"
              min="0.25"
              max="5"
              value={values[reward.tierKey]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [reward.tierKey]: e.target.value }))
              }
              className={styles.centsInput}
            />
          </div>
        </div>
      ))}
      <Button
        variant="primary"
        style={{ width: "100%", marginTop: 16 }}
        isLoading={saving}
        loadingText="Saving…"
        onClick={save}
      >
        Save changes
      </Button>
    </>
  );
}

function CampaignTab({ loyaltyData, dispatch, onSaved }) {
  // Only one campaign entry is supported from this UI today — the array
  // shape leaves room for scheduling multiple campaigns later, but for
  // now we edit whichever one is active (or the first entry, if none is).
  const activeIdx = Math.max(
    0,
    loyaltyData.campaign.findIndex((c) => c.isActive),
  );
  const [campaign, setCampaign] = useState(() => ({
    ...loyaltyData.campaign[activeIdx],
  }));
  const [saving, setSaving] = useState(false);

  function handleHolidayChange(key) {
    const preset = PROMO_HOLIDAYS.find((h) => h.key === key);
    setCampaign((c) => ({
      ...c,
      holiday: preset?.key || c.holiday,
      promoName: preset?.defaultName || c.promoName,
      banner: preset?.defaultName || c.banner,
    }));
  }

  async function save() {
    setSaving(true);
    try {
      const nextCampaign = loyaltyData.campaign.map((c, i) =>
        i === activeIdx ? campaign : c,
      );
      const config = await updateLoyaltyConfig({ campaign: nextCampaign });
      dispatch(saveCampaignSuccess(config));
      toast.success(
        "Campaign updated — banner, earn logic, and cart all refreshed",
      );
      onSaved();
    } catch (err) {
      toast.error(`Couldn't save campaign: ${err.message}`);
    } finally {
      setSaving(false);
    }
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
          <label>Holiday preset</label>
          <select
            className={styles.select}
            value={campaign.holiday}
            onChange={(e) => handleHolidayChange(e.target.value)}
          >
            {PROMO_HOLIDAYS.map((h) => (
              <option key={h.key} value={h.key}>
                {h.label}
              </option>
            ))}
          </select>
        </div>
        <div className={shared.field}>
          <label>Start date</label>
          <input
            type="date"
            className={styles.select}
            value={campaign.startDate}
            onChange={(e) =>
              setCampaign((c) => ({ ...c, startDate: e.target.value }))
            }
          />
        </div>
        <div className={shared.field}>
          <label>End date</label>
          <input
            type="date"
            className={styles.select}
            value={campaign.endDate}
            onChange={(e) =>
              setCampaign((c) => ({ ...c, endDate: e.target.value }))
            }
          />
        </div>
        <div className={shared.field}>
          <label>Multiplier</label>
          <select
            className={styles.select}
            value={String(campaign.multiplier)}
            onChange={(e) =>
              setCampaign((c) => ({ ...c, multiplier: Number(e.target.value) }))
            }
          >
            <option value="1">1×</option>
            <option value="2">2×</option>
            <option value="3">3×</option>
          </select>
        </div>
        <div className={shared.field}>
          <label>Campaign status</label>
          <select
            className={styles.select}
            value={String(campaign.isActive)}
            onChange={(e) =>
              setCampaign((c) => ({
                ...c,
                isActive: e.target.value === "true",
              }))
            }
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
      <div className={styles.note}>
        Current event: <b>{campaign.promoName}</b> · {promoDateWindow(campaign)}{" "}
        · {campaign.multiplier}×
      </div>
      <div className={`${styles.note} ${styles.noteSubtle}`}>
        Use this control during the demo to show a live rule change in MongoDB:
        the campaign banner updates immediately and the coins-earned calculation
        changes with no redeploy or ETL.
      </div>
      <Button
        variant="primary"
        style={{ width: "100%", marginTop: 16 }}
        isLoading={saving}
        loadingText="Saving…"
        onClick={save}
      >
        Save campaign
      </Button>
    </>
  );
}

function TierThresholdsTab({ loyaltyData, dispatch, onSaved }) {
  const editable = loyaltyData.rewardDetails.filter(
    (t) => t.tierKey !== "bronze",
  );
  const [mins, setMins] = useState(() => {
    const init = {};
    loyaltyData.rewardDetails.forEach((t) => {
      init[t.tierKey] = t.threshold;
    });
    return init;
  });
  const [saving, setSaving] = useState(false);

  function handleChange(key, rawVal) {
    const idx = loyaltyData.rewardDetails.findIndex((t) => t.tierKey === key);
    const prevMin =
      idx === 0 ? 0 : mins[loyaltyData.rewardDetails[idx - 1].tierKey];
    const nextMin =
      idx < loyaltyData.rewardDetails.length - 1
        ? mins[loyaltyData.rewardDetails[idx + 1].tierKey]
        : Infinity;
    let val = Number(rawVal);
    if (val <= prevMin) val = prevMin + 100;
    if (val >= nextMin) val = nextMin - 100;
    setMins((m) => ({ ...m, [key]: val }));
  }

  async function save() {
    setSaving(true);
    const nextRewardDetails = loyaltyData.rewardDetails.map((t) => ({
      ...t,
      threshold: mins[t.tierKey],
    }));
    try {
      const config = await updateLoyaltyConfig({
        rewardDetails: nextRewardDetails,
      });
      dispatch(saveRewardDetailsSuccess(config));
      toast.success("Tier thresholds updated — live across the store");
      onSaved();
    } catch (err) {
      toast.error(`Couldn't save tier thresholds: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <p>
        Set the cumulative merchandise spend needed to reach each tier. Bronze
        always starts at $0 — dragging a slider is clamped so tiers stay in
        order.
      </p>
      {editable.map((t) => (
        <div className={styles.sliderRow} key={t.tierKey}>
          <div className={styles.sliderLabel}>
            <Badge variant={tierBadgeVariant(t.tierKey)}>{t.tierName}</Badge>
            <span className={`${styles.sliderValue} mono`}>
              {formatPrice(mins[t.tierKey])} spend
            </span>
          </div>
          <input
            type="range"
            min="200"
            max="20000"
            step="100"
            value={mins[t.tierKey]}
            onChange={(e) => handleChange(t.tierKey, e.target.value)}
            className={styles.tierSlider}
          />
        </div>
      ))}
      <Button
        variant="primary"
        style={{ width: "100%", marginTop: 16 }}
        isLoading={saving}
        loadingText="Saving…"
        onClick={save}
      >
        Save changes
      </Button>
    </>
  );
}

export default function AdminModal({ onClose }) {
  const dispatch = useDispatch();
  const loyaltyData = useSelector(selectLoyaltyConfig);
  const [tab, setTab] = useState("promo");

  return (
    <>
      <div className={modal.head}>
        <H2>Loyalty Setting</H2>
        <button className={modal.close} onClick={onClose}>
          ✕
        </button>
      </div>
      <div className={modal.tabs}>
        <button
          className={`${modal.tab} ${tab === "value" ? modal.tabActive : ""}`}
          onClick={() => setTab("value")}
        >
          Reward value
        </button>
        <button
          className={`${modal.tab} ${tab === "tiers" ? modal.tabActive : ""}`}
          onClick={() => setTab("tiers")}
        >
          Tier thresholds
        </button>
        <button
          className={`${modal.tab} ${tab === "promo" ? modal.tabActive : ""}`}
          onClick={() => setTab("promo")}
        >
          Promo campaign
        </button>
      </div>
      <div className={modal.body}>
        {tab === "value" && (
          <RewardValueTab
            loyaltyData={loyaltyData}
            dispatch={dispatch}
            onSaved={onClose}
          />
        )}
        {tab === "tiers" && (
          <TierThresholdsTab
            loyaltyData={loyaltyData}
            dispatch={dispatch}
            onSaved={onClose}
          />
        )}
        {tab === "promo" && (
          <CampaignTab
            loyaltyData={loyaltyData}
            dispatch={dispatch}
            onSaved={onClose}
          />
        )}
      </div>
    </>
  );
}
