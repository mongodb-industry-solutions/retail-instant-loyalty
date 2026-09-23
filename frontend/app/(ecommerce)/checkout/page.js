"use client";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { H3 } from "@via-ds/components/typography";
import { useDispatch, useSelector } from "react-redux";
import { selectLoyaltyConfig } from "@/redux/slices/GlobalSlice";
import { toast } from "@via-ds/components/toast";
import {
  selectSelectedUser,
  selectCart,
  selectProductsData,
  placeOrderSuccess,
  updateSelectedUser,
} from "@/redux/slices/GlobalSlice";
import { Icon } from "@via-ds/icons";
import { Button } from "@via-ds/components/button";
import shared from "@/components/shared.module.css";
import { cartItemList, formatPrice } from "@/lib/helper";
import { createOrder, fetchOrderOverview, fetchCustomer } from "@/lib/api";
import styles from "./CheckoutView.module.css";

export default function CheckoutView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const persona = useSelector(selectSelectedUser);
  const cart = useSelector(selectCart);
  const products = useSelector(selectProductsData);
  const cartItems = cartItemList(cart, products);
  const [placingOrder, setPlacingOrder] = useState(false);

  const coinBalance = persona.loyaltyDetails?.coinBalance ?? 0;
  const [coinsToApply, setCoinsToApply] = useState(0);
  const [overview, setOverview] = useState(null);
  const [overviewError, setOverviewError] = useState(null);
  const loyaltyConfig = useSelector(selectLoyaltyConfig);
  const currentTierConfig = persona.loyaltyDetails?.activeTier
    ? loyaltyConfig.rewardDetails.find(
        (tier) => tier.tierKey === persona.loyaltyDetails?.activeTier,
      )
    : loyaltyConfig.rewardDetails[0];

  const merchandiseValue = Math.max(
    0,
    Number(overview?.order?.amountSummary?.subtotal ?? 0),
  );

  const balance = Math.max(
    0,
    Math.floor(Number(persona.loyaltyDetails?.coinBalance ?? 0)),
  );
  const coinsPerDollar = Number(currentTierConfig.currencyValueForDollar ?? 0);

  const maxCoinsForMerchandise =
    merchandiseValue > 0 && coinsPerDollar > 0
      ? Math.floor(merchandiseValue * coinsPerDollar)
      : 0;

  const maxCoinsUsable = Math.min(balance, maxCoinsForMerchandise);
  const canRedeem = persona.loyaltyDetails.activeTier
    ? maxCoinsUsable > 0
    : false;

  useEffect(() => {
    if (coinsToApply > maxCoinsUsable) {
      setCoinsToApply(maxCoinsUsable);
    }
  }, [maxCoinsUsable, coinsToApply]);

  const orderItems = cartItems.map((item) => ({
    productId: item.productId,
    quantity: item.cartQuantity,
  }));
  const itemsKey = JSON.stringify(orderItems);

  useEffect(() => {
    if (!orderItems.length) {
      setOverview(null);
      return;
    }
    let cancelled = false;
    // Debounced: dragging the coin slider would otherwise fire a request per
    // pixel, and late responses could overwrite newer ones.
    const timer = setTimeout(() => {
      fetchOrderOverview({ items: JSON.parse(itemsKey), coinsToApply })
        .then((data) => {
          if (cancelled) return;
          setOverview(data);
          setOverviewError(null);
        })
        .catch((err) => {
          if (cancelled) return;
          setOverview(null);
          setOverviewError(err.message);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [itemsKey, coinsToApply]);

  const amounts = overview?.order?.amountSummary;
  const loyalty = overview?.loyalty;

  async function handlePlaceOrder() {
    setPlacingOrder(true);
    try {
      // Only ids, quantities and coins — the server re-prices from live
      // products and the session's customer, ignoring anything else we'd send.
      const { order, loyalty: orderLoyalty } = await createOrder({
        items: orderItems,
        coinsToApply,
        orderType: "ONLINE",
      });
      dispatch(placeOrderSuccess({ order, loyalty: orderLoyalty }));
      const getUpdatedUser = await fetchCustomer(persona.customerId);
      dispatch(updateSelectedUser(getUpdatedUser));
      router.push("/confirm");
    } catch (err) {
      toast.error(`Couldn't place order: ${err.message}`);
    } finally {
      setPlacingOrder(false);
    }
  }

  function go(view) {
    router.push(view === "store" ? "/" : `/${view}`);
  }

  return (
    <main className={shared.page}>
      <div className={shared.crumb}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("cart");
          }}
        >
          Back to cart
        </a>{" "}
        / <span className={shared.current}>Checkout</span>
      </div>
      <div className={shared.layoutSplit}>
        <div>
          <div className={styles.formCard}>
            <H3>
              <Icon glyph="Package" /> Shipping information
            </H3>
            <div className={shared.formRow}>
              <div className={shared.field}>
                <label>First name</label>
                <input defaultValue={persona.profile.firstName} />
              </div>
              <div className={shared.field}>
                <label>Last name</label>
                <input defaultValue={persona.profile.lastName} />
              </div>
            </div>
            <div className={shared.field} style={{ marginBottom: 12 }}>
              <label>Email</label>
              <input defaultValue={persona.profile.email} />
            </div>
            <div className={shared.field} style={{ marginBottom: 12 }}>
              <label>Address</label>
              <input defaultValue={persona.addresses[0].line1} />
            </div>
            <div className={shared.field}>
              <label>City, state, ZIP</label>
              <input
                defaultValue={`${persona.addresses[0].city}, ${persona.addresses[0].state} ${persona.addresses[0].postalCode}`}
              />
            </div>
            <div className={shared.field}>
              <label>Country</label>
              <input defaultValue={persona.addresses[0].country} />
            </div>
          </div>
          <div className={styles.formCard}>
            <H3>
              <Icon glyph="CreditCard" /> Payment details
            </H3>
            <div className={shared.field} style={{ marginBottom: 12 }}>
              <label>Card number</label>
              <input
                defaultValue={`•••• •••• •••• ${persona.paymentDetails?.last4}`}
              />
            </div>
            <div className={shared.formRow} style={{ marginBottom: 0 }}>
              <div className={shared.field}>
                <label>Expiry</label>
                <input defaultValue={persona.paymentDetails?.expiry} />
              </div>
              <div className={shared.field}>
                <label>CVV</label>
                <input defaultValue="•••" />
              </div>
            </div>
          </div>
        </div>
        <div className={shared.summaryCard}>
          <H3>Order Summary</H3>
          {cartItems.map((item) => (
            <div className={shared.orderReviewItem} key={item.productId}>
              <span className={shared.name}>
                {item.icon} {item.name} x{item.cartQuantity}
              </span>
              <span className="mono">
                {formatPrice(item.price * item.cartQuantity)}
              </span>
            </div>
          ))}
          {canRedeem && (
            <div className={styles.loyaltyCard}>
              <div className={styles.loyaltyTop}>
                <div>
                  <div className={styles.loyaltyTitle}>
                    Use loyalty coins at checkout
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="small"
                  style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                  onClick={() =>
                    setCoinsToApply(coinsToApply > 0 ? 0 : maxCoinsUsable)
                  }
                >
                  {coinsToApply > 0 ? "Remove points" : "Use points"}
                </Button>
              </div>
              {coinsToApply > 0 ? (
                <div className={styles.sliderWrap}>
                  <input
                    type="range"
                    className={styles.slider}
                    min="0"
                    max={maxCoinsUsable}
                    step="1"
                    value={coinsToApply}
                    onChange={(e) => setCoinsToApply(Number(e.target.value))}
                  />
                  <div className={styles.loyaltyScale}>
                    <span>0</span>
                    <span>{maxCoinsUsable.toLocaleString()} coins</span>
                  </div>
                  {/* <div className={styles.loyaltyNote}>
                    Applying <b>{coinsToApply.toLocaleString()}</b> coins
                    offsets <b>{formatPrice(coinsCoveredValue)}</b> of
                    merchandise and leaves <b>{formatPrice(subtotal)}</b>{" "}
                    eligible for new loyalty coins.
                  </div> */}
                </div>
              ) : (
                <div className={styles.loyaltyNote}>
                  Use up to <b>{maxCoinsUsable.toLocaleString()}</b> coins to
                  offset{" "}
                  <b>
                    {formatPrice(
                      coinsPerDollar > 0 ? maxCoinsUsable / coinsPerDollar : 0,
                    )}
                  </b>{" "}
                  of merchandise. Tier progress still counts the full cart
                  subtotal.
                </div>
              )}
            </div>
          )}

          {overviewError && (
            <div className={shared.summaryRow} style={{ color: "#C4342A" }}>
              Couldn&apos;t price this order: {overviewError}
            </div>
          )}

          <div className={shared.summaryRow} style={{ marginTop: 12 }}>
            <span>Subtotal</span>
            <span className="mono">{formatPrice(amounts?.subtotal)}</span>
          </div>
          {amounts?.coinsDiscountValue > 0 && (
            <div className={shared.summaryRow}>
              <span>Coins applied</span>
              <span className="mono">
                −{formatPrice(amounts.coinsDiscountValue)}
              </span>
            </div>
          )}
          <div className={shared.summaryRow}>
            <span>Shipping</span>
            <span className={amounts?.shipping === 0 ? shared.free : ""}>
              {amounts?.shipping === 0
                ? "Free"
                : formatPrice(amounts?.shipping)}
            </span>
          </div>
          <div className={shared.summaryRow}>
            <span>Tax</span>
            <span className="mono">{formatPrice(amounts?.tax)}</span>
          </div>
          <div className={`${shared.summaryRow} ${shared.summaryRowTotal}`}>
            <span>Total</span>
            <span className="mono">{formatPrice(amounts?.total)}</span>
          </div>

          {overview && (
            <>
              <div className={shared.coinPreview}>
                🪙 This order earns{" "}
                <b>{overview.order.coinsEarned.toLocaleString()}</b> coins
                {loyalty.multiplier > 1 && (
                  <> at {loyalty.multiplier}×</>
                )} on <b>{formatPrice(loyalty.qualifyingSpend)}</b> cash-paid
                merchandise, bringing your balance to{" "}
                <b>{loyalty.projectedBalance.toLocaleString()}</b> coins.
              </div>
              <div
                className={`${shared.coinPreview} ${styles.coinPreviewPolicy}`}
              >
                {loyalty.projectedTier !== loyalty.oldTier ? (
                  <>
                    🎉 This order upgrades you to <b>{loyalty.projectedTier}</b>{" "}
                    tier.
                  </>
                ) : (
                  <>
                    ⭐ This order adds{" "}
                    <b>{formatPrice(loyalty.qualifyingSpend)}</b> toward tier
                    progress —{" "}
                    <b>{formatPrice(loyalty.dollarsNeededForNextTier)}</b> to
                    go.
                  </>
                )}
              </div>
            </>
          )}
          <Button
            variant="primary"
            style={{ width: "100%" }}
            isLoading={placingOrder}
            loadingText="Placing order…"
            isDisabled={!overview}
            onClick={handlePlaceOrder}
          >
            ✓ Place order
          </Button>
        </div>
      </div>
    </main>
  );
}
