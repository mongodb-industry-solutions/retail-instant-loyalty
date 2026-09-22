"use client";

import { useSelector, useDispatch } from "react-redux";
import {
  confirmRedeemOrderSuccess,
  selectSelectedUser,
  selectLoyaltyConfig,
  selectLastRedeem,
} from "../../redux/slices/GlobalSlice";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@via-ds/components/button";
import { fetchRedeemCandidates, confirmRedeemRequest } from "@/lib/api";
import { formatPrice, formatCoinValue } from "@/lib/helper";
import shared from "@/components/shared.module.css";
import { toast } from "@via-ds/components/toast";
import styles from "./RedeemView.module.css";

function CandidateCard({ product, selected, onSelect, onDeselect }) {
  const coversWithCoins = product.cash === 0;

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
              {product.coins.toLocaleString()} coins
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
                Use coins + {formatPrice(product.cash)} cash
              </span>
            )}
          </div>
        </div>
        {selected ? (
          <Button variant="primary" size="small" onClick={onDeselect}>
            ✓ Selected
          </Button>
        ) : (
          <Button variant="primary" size="small" onClick={onSelect}>
            Redeem now
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewPanel({ persona, reward, onConfirmed }) {
  const dispatch = useDispatch();

  const balance = persona.loyaltyDetails.coinBalance;
  const coinsToApply = reward.coins;
  const cashDue = reward.cash;
  const balanceAfter = Math.max(0, balance - coinsToApply);
  const [confirming, setConfirming] = useState(false);

  async function handleConfirm() {
    setConfirming(true);
    try {
      const { order, loyalty } = await confirmRedeemRequest({
        items: [{ productId: reward.productId, quantity: 1 }],
        coinsToApply,
      });
      dispatch(confirmRedeemOrderSuccess({ order, loyalty }));
      onConfirmed();
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
        <span className={shared.name}>{reward.name}</span>
        <span className="mono">{coinsToApply.toLocaleString()} coins</span>
      </div>
      <div className={styles.redeemBreakdown} style={{ marginTop: 12 }}>
        <div className={styles.rbRow}>
          <span>Merchandise selected</span>
          <span>{formatPrice(reward.price)}</span>
        </div>
        <div className={styles.rbRow}>
          <span>Coins available</span>
          <span>{balance.toLocaleString()}</span>
        </div>
        <div className={styles.rbRow}>
          <span>Coins applied</span>
          <span>{coinsToApply.toLocaleString()}</span>
        </div>
        {cashDue > 0 ? (
          <div className={styles.rbRow}>
            <span>Remaining merchandise due</span>
            <span>{formatPrice(cashDue)}</span>
          </div>
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
          Confirm {cashDue > 0 ? `→ ${formatPrice(cashDue)} due` : "redemption"}
        </Button>
      </div>
    </div>
  );
}

export default function RedeemSection({ excludeItemIds }) {
  const persona = useSelector(selectSelectedUser);
  const { rewardDetails } = useSelector(selectLoyaltyConfig);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [offer, setOffer] = useState(null);
  const excludeKey = [...(excludeItemIds ?? [])].sort().join(",");

  const lastRedeem = useSelector(selectLastRedeem);

  console.log("Last redeem:", lastRedeem);

  useEffect(() => {
    let cancelled = false;
    if (!lastRedeem) {
      fetchRedeemCandidates({
        excludeProducts: excludeKey ? excludeKey.split(",") : [],
      })
        .then((data) => {
          if (!cancelled) setOffer(data);
        })
        .catch((err) => {
          if (!cancelled) console.error("Couldn't load rewards:", err.message);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [persona.customerId, persona.loyaltyDetails?.coinBalance, excludeKey]);

  const products = offer?.products ?? [];
  if (!products.length) return null;

  const reward =
    products.find((p) => p.productId === selectedProductId) || null;
  const activeTier = persona.loyaltyDetails?.activeTier;

  return (
    !lastRedeem && (
      <div className={styles.redeemSection}>
        <div className={styles.redeemHead}>
          <h3>✨ Buy again from this receipt</h3>
          <span className={styles.redeemBalance}>
            Balance:{" "}
            <b className="mono">
              {(persona.loyaltyDetails?.coinBalance ?? 0).toLocaleString()}
            </b>{" "}
            coins
          </span>
        </div>
        <p className={styles.redeemSub}>
          {`Purchase with your coins at ${activeTier} tier — 1 coin = ${formatCoinValue(activeTier, rewardDetails)}.`}
        </p>

        <div className={styles.redeemList}>
          {products.map((pr) => (
            <CandidateCard
              key={pr.productId}
              product={pr}
              selected={pr.productId === selectedProductId}
              onSelect={() => setSelectedProductId(pr.productId)}
              onDeselect={() => setSelectedProductId(null)}
            />
          ))}
        </div>

        {reward && (
          <ReviewPanel
            persona={persona}
            reward={reward}
            onConfirmed={() => setSelectedProductId(null)}
          />
        )}
      </div>
    )
  );
}
