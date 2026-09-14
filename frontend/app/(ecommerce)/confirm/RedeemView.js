"use client";

import { useSelector, useDispatch } from "react-redux";
import { confirmRedeemOrderSuccess } from "../../../redux/slices/GlobalSlice";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@via-ds/components/button";
import { fetchRedeemCandidates, confirmRedeemRequest } from "@/lib/api";
import { formatPrice } from "@/lib/helper";
import shared from "@/components/shared.module.css";
import { toast } from "@via-ds/components/toast";

import {
  selectSelectedUser,
  selectRedeem,
  selectReward,
  resetReward,
} from "../../../redux/slices/GlobalSlice";
import styles from "./RedeemView.module.css";

function CandidateCard({ product, selected }) {
  const dispatch = useDispatch();

  // coinPrice / cashSubtotal are priced server-side and arrive on the
  // candidate — see the /candidates route in backend/src/routes/redeem.js.
  const coversWithCoins = product.cashSubtotal === 0;

  return (
    <div className={styles.redeemCard}>
      <div className={styles.redeemCardTop}>
        <div className={styles.redeemThumb} style={{ background: "white" }}>
          <Image
            src={product.imageURL}
            alt={product.name}
            width={44}
            height={44}
            unoptimized={false}
          />
        </div>
        <div className={styles.redeemInfo}>
          <div className={styles.redeemName}>{product.name}</div>
          <div className={styles.redeemPriceRow}>
            <span className={styles.redeemCash}>
              {formatPrice(product.price)}
            </span>
            <span>·</span>
            <span className={`${styles.redeemCoins} mono`}>
              {product.coinPrice.toLocaleString()} coins
            </span>
            <span className={styles.redeemAffordTag}>
              {coversWithCoins ? "Coins only" : "Hybrid"}
            </span>
          </div>
          <div className={styles.redeemCardSub}>
            {coversWithCoins ? (
              <span
                className={`${styles.redeemAfford} ${styles.redeemAffordFull}`}
              >
                Covered fully with coins
              </span>
            ) : (
              <span
                className={`${styles.redeemAfford} ${styles.redeemAffordHybrid}`}
              >
                Use coins + {formatPrice(product.cashSubtotal)} cash
              </span>
            )}
          </div>
        </div>
        {selected ? (
          <Button
            variant="primary"
            size="small"
            onClick={() => dispatch(resetReward())}
          >
            ✓ Selected
          </Button>
        ) : (
          <Button
            variant="primary"
            size="small"
            onClick={() => dispatch(selectReward(product.productId))}
          >
            Redeem now
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewPanel({ persona, reward }) {
  const dispatch = useDispatch();

  const {
    coinPrice, // The coin equivalence of the product
    merchandiseSubtotal,
    coinsUsed = 220, // This is to calculated the amount of coins to be used for the product
    cashSubtotal,
    tax,
    cashTotal,
  } = reward;
  const balance = persona.loyaltyDetails.balance;
  const balanceAfter = Math.max(0, balance - coinsUsed);
  const [confirming, setConfirming] = useState(false);

  async function handleConfirm() {
    setConfirming(true);
    try {
      const { order, customer, orderMeta, tierUp, oldTier, newTier } =
        await confirmRedeemRequest({
          personaId: persona.id,
          redeemCart: { [reward.id]: 1 },
        });
      dispatch(
        confirmRedeemOrderSuccess({
          order,
          customer,
          orderMeta,
          tierUp,
          oldTier,
          newTier,
        }),
      );
    } catch (err) {
      toast.error(`Couldn't confirm redemption: ${err.message}`);
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className={styles.redeemReview}>
      <div className={styles.redeemReviewNote}>
        Stay in the receipt flow while MongoDB applies the coin deduction and
        cash remainder in one confirmation step.
      </div>
      <div className={shared.orderReviewItem}>
        <span className={shared.name}>
          {reward.icon} {reward.name}
        </span>
        <span className="mono">{reward.coinPrice.toLocaleString()} coins</span>
      </div>
      <div className={styles.redeemBreakdown} style={{ marginTop: 12 }}>
        <div className={styles.rbRow}>
          <span>Merchandise selected</span>
          <span>{formatPrice(merchandiseSubtotal)}</span>
        </div>
        <div className={styles.rbRow}>
          <span>Coins available</span>
          <span>{balance.toLocaleString()}</span>
        </div>
        <div className={styles.rbRow}>
          <span>Coin price selected</span>
          <span>{coinPrice.toLocaleString()}</span>
        </div>
        <div className={styles.rbRow}>
          <span>Coins applied</span>
          <span>{balance.toLocaleString()}</span>
        </div>
        {cashTotal > 0 ? (
          <>
            <div className={styles.rbRow}>
              <span>Remaining merchandise due</span>
              <span>{formatPrice(cashSubtotal)}</span>
            </div>
            <div className={styles.rbRow}>
              <span>Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className={styles.rbRow}>
              <span>Total cash due</span>
              <span>{formatPrice(cashTotal)}</span>
            </div>
          </>
        ) : (
          <div className={styles.rbRow}>
            <span>Total cash due</span>
            <span>{formatPrice(0)} — fully covered with coins</span>
          </div>
        )}
        <div className={styles.rbRow}>
          <span>Balance after confirmation</span>
          <span>{balanceAfter.toLocaleString()} coins</span>
        </div>
      </div>
      <div className={styles.redeemActions}>
        <Button
          variant="primary"
          style={{ flex: 1 }}
          isLoading={confirming}
          loadingText="Confirming…"
          onClick={handleConfirm}
        >
          Confirm{" "}
          {cashTotal > 0 ? `→ ${formatPrice(cashTotal)} due` : "redemption"}
        </Button>
      </div>
    </div>
  );
}

export default function RedeemSection({ excludeItemIds }) {
  const dispatch = useDispatch();
  const persona = useSelector(selectSelectedUser);
  const redeem = useSelector(selectRedeem);
  const [offer, setOffer] = useState(null);
  const excludeKey = [...(excludeItemIds ?? [])].sort().join(",");

  useEffect(() => {
    let cancelled = false;
    fetchRedeemCandidates({
      customerId: persona.CustomerID,
      exclude: excludeKey ? excludeKey.split(",") : [],
    })
      .then((data) => {
        if (!cancelled) setOffer(data);
      })
      .catch((err) => {
        if (!cancelled) console.error("Couldn't load rewards:", err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [
    persona.CustomerID,
    persona.loyaltyDetails?.balance,
    excludeKey,
    dispatch,
  ]);

  console.log("offer", offer);

  if (!offer?.show) return null;

  const { tier, candidates } = offer;
  // The candidates already carry a tier-priced coinPrice, so the selection is
  // just one of them — no second lookup or re-pricing needed.
  const reward =
    candidates.find((pr) => pr.productId === redeem.productId) || null;

  console.log("reward", reward);

  return (
    <div className={styles.redeemSection}>
      <div className={styles.redeemHead}>
        <h3>✨ Buy again from this receipt</h3>
        <span className={styles.redeemBalance}>
          Balance:{" "}
          <b className="mono">
            {(persona.loyaltyDetails?.balance ?? 0).toLocaleString()}
          </b>{" "}
          coins
        </span>
      </div>
      <p className={styles.redeemSub}>
        {`Purchase with your coins at ${tier.tierName} tier — 1 coin = ${tier.coinValueLabel}.`}
      </p>

      <div className={styles.redeemList}>
        {candidates.map((pr) => (
          <CandidateCard
            key={pr.productId}
            product={pr}
            selected={pr.productId === redeem.productId}
          />
        ))}
      </div>

      {reward && <ReviewPanel persona={persona} reward={reward} />}
    </div>
  );
}
