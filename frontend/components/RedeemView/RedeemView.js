"use client";

import { useSelector, useDispatch } from "react-redux";
import {
  confirmRedeemOrderSuccess,
  selectSelectedUser,
  selectLoyaltyConfig,
  selectLastEvent,
  openModal,
} from "../../redux/slices/GlobalSlice";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@via-ds/components/button";
import { fetchRedeemCandidates, confirmRedeemRequest } from "@/lib/api";
import { formatPrice, formatCoinValue } from "@/lib/helper";
import shared from "@/components/shared.module.css";
import { toast } from "@via-ds/components/toast";
import styles from "./RedeemView.module.css";

function CandidateCard({ product, selected, onSelect, onDeselect, onShowDoc }) {
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
        <div className={styles.redeemCardActions}>
          <Button
            className={styles.docToggle}
            aria-label={`Show document for ${product.name}`}
            onClick={onShowDoc}
          >
            {"{ }"}
          </Button>
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
  const dispatch = useDispatch();
  const persona = useSelector(selectSelectedUser);
  const { rewardDetails } = useSelector(selectLoyaltyConfig);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [offer, setOffer] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const excludeKey = [...(excludeItemIds ?? [])].sort().join(",");

  // Keyed off the most recent event rather than "has ever redeemed": offering
  // rewards straight after a redemption is noise, but the next order should
  // bring the section back. lastRedeem is never cleared, so gating on it hid
  // the section permanently after the first redemption.
  const justRedeemed = useSelector(selectLastEvent) === "redeem";

  useEffect(() => {
    let cancelled = false;
    if (!justRedeemed) {
      fetchRedeemCandidates({
        excludeProducts: excludeKey ? excludeKey.split(",") : [],
      })
        .then((data) => {
          if (cancelled) return;
          setOffer(data);
          setLoadError(null);
        })
        .catch((err) => {
          if (cancelled) return;
          setOffer({ products: [] });
          setLoadError(err.message);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [
    persona.customerId,
    persona.loyaltyDetails?.coinBalance,
    excludeKey,
    justRedeemed,
  ]);

  const loading = offer === null;
  const products = offer?.products ?? [];

  const reward =
    products.find((p) => p.productId === selectedProductId) || null;
  const activeTier = persona.loyaltyDetails?.activeTier;

  return (
    !justRedeemed && (
      <div className={styles.redeemSection}>
        <div className={styles.redeemHead}>
          <h3>✨ Treat yourself with the coins you’ve earned</h3>
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

        {loading && <div className={styles.redeemEmpty}>Loading rewards…</div>}

        {!loading && !products.length && (
          <div className={styles.redeemEmpty}>
            {loadError
              ? `Couldn't load rewards right now: ${loadError}`
              : "Nothing to redeem just yet — keep earning and rewards you can cover with coins will show up here."}
          </div>
        )}

        <div className={styles.redeemList}>
          {products.map((pr) => (
            <CandidateCard
              key={pr.productId}
              product={pr}
              selected={pr.productId === selectedProductId}
              onSelect={() => setSelectedProductId(pr.productId)}
              onDeselect={() => setSelectedProductId(null)}
              onShowDoc={() =>
                dispatch(
                  openModal({
                    modalType: "redeemDoc",
                    props: { product: pr },
                  }),
                )
              }
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
