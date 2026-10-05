"use client";
import { useState, useEffect, useMemo } from "react";

import styles from "./ConfirmView.module.css";
import { Icon } from "@via-ds/icons";
import { useSelector } from "react-redux";
import {
  selectSelectedUser,
  selectLastOrder,
  selectLastRedeem,
  selectLastEvent,
} from "../../../redux/slices/GlobalSlice";
import Receipt from "../../../components/Receipt/Receipt";
import LoyaltyRewardCard from "./LoyaltyRewardCard";
import { useRouter } from "next/navigation";
import RedeemView from "../../../components/RedeemView/RedeemView";
import ConfirmSidebar from "../../../components/ConfirmSidebar/ConfirmSidebar";
import { Button } from "@via-ds/components/button";
import OrderStatusBar from "@/components/OrderStatusBar/OrderStatusBar";
import { ORDER_STATUS_STAGES } from "@/lib/data";

function OrderErrorView({ orderError, ORDER_STATUS_STAGES_FAILED }) {
  let finalOrder = {};
  return (
    <main className={styles.wrap}>
      <OrderStatusBar
        stages={ORDER_STATUS_STAGES_FAILED}
        current="payment_failed"
      />
      <div className={styles.pendingStatus}>
        <span>{orderError}</span>
      </div>
      <div className={styles.layout}>
        <div className={styles.main}>
          <LoyaltyRewardCard order={finalOrder} />
        </div>
      </div>
    </main>
  );
}

export default function ConfirmView() {
  const router = useRouter();
  const redemptionInProgress = false;
  const reviewing = false;
  const persona = useSelector(selectSelectedUser);
  const lastOrder = useSelector(selectLastOrder);
  const latestRedeem = useSelector(selectLastRedeem);
  const lastEvent = useSelector(selectLastEvent);
  const hasRedemption = lastEvent === "redeem";
  const activeEvent = hasRedemption ? latestRedeem : lastOrder;
  const finalOrder = activeEvent?.order
    ? { ...activeEvent.order, loyalty: activeEvent.loyalty }
    : null;
  const orderError = lastOrder?.error;
  const shownOrderId = finalOrder?.orderId;
  const [orderStatus, setOrderStatus] = useState("authorizing");

  const orderId = finalOrder?.orderId ?? finalOrder?.id;
  const customerId = persona?.customerId;
  let ORDER_STATUS_STAGES_FAILED = null;

  useEffect(() => {
    if (!orderId || !customerId) return;

    const source = new EventSource(
      `/api/orders/${orderId}/orderstatus?customerId=${encodeURIComponent(customerId)}`,
    );

    source.onmessage = (event) => {
      try {
        const { status } = JSON.parse(event.data);

        if (status) setOrderStatus(status);

        if (status === "delivered") {
          source.close();
        }
      } catch (error) {
        console.error("Failed to parse order status event:", error);
      }
    };

    source.onerror = () => {
      // Benign reconnects fire here too; only a CLOSED socket is a failure.
      if (source.readyState === EventSource.CLOSED) {
        console.error("Order status stream closed and will not retry");
      }
    };

    return () => {
      source.close();
    };
  }, [orderId, customerId]);

  const excludeItemIds = useMemo(
    () => new Set((finalOrder?.items ?? []).map((item) => item.productId)),
    [finalOrder?.items],
  );

  if (!finalOrder && !orderError) {
    return (
      <main className={styles.wrap}>
        <div className={styles.sub}>No recent order to show.</div>
        <Button variant="primary" onClick={() => router.push("/")}>
          ← Back to store
        </Button>
      </main>
    );
  }

  let showOnlyStepperStatus = ["authorizing", "placed"];

  if (orderError) {
    showOnlyStepperStatus = ["authorizing"];
    ORDER_STATUS_STAGES_FAILED = [
      "authorizing",
      "payment_failed",
      "placed",
      "shipped",
      "delivered",
    ];
  }

  let showOnlyStepper = showOnlyStepperStatus.includes(orderStatus);

  if (showOnlyStepper) {
    return (
      <main className={styles.wrap}>
        <OrderStatusBar
          stages={
            ORDER_STATUS_STAGES_FAILED
              ? ORDER_STATUS_STAGES_FAILED
              : ORDER_STATUS_STAGES
          }
          current={orderStatus}
        />
        <div className={styles.pendingStatus}>
          <span className={styles.spinner} aria-hidden="true" />
          <span>
            {orderStatus === "authorizing"
              ? "Authorizing payment…"
              : "Confirming your order…"}
            {orderStatus === "payment_failed" && "Payment failed."}
          </span>
        </div>
        {/* Placeholders keep the layout stable so the real cards don't pop in
            and shift everything down once the status stream catches up. */}
        <div className={styles.layout} aria-hidden="true">
          <div className={styles.main}>
            <div className={`${styles.skeleton} ${styles.skeletonCard}`} />
            <div className={`${styles.skeleton} ${styles.skeletonCard}`} />
          </div>
          <div className={`${styles.skeleton} ${styles.skeletonSide}`} />
        </div>
      </main>
    );
  }

  if (orderStatus === "payment_failed") {
    return (
      <OrderErrorView
        orderError={orderError.message.message}
        ORDER_STATUS_STAGES_FAILED={ORDER_STATUS_STAGES_FAILED}
      />
    );
  }

  return (
    <main className={styles.wrap}>
      {redemptionInProgress ? (
        <div className={styles.pendingNote}>
          🕒 Reviewing your redemption — nothing&apos;s been confirmed yet
        </div>
      ) : (
        <>
          <div className={styles.icon}>
            <Icon glyph="Checkmark" />
          </div>
          <div className={styles.title}>
            {hasRedemption ? "Redeem successful!" : "Order confirmed!"}
          </div>
          <div className={styles.sub}>
            {hasRedemption
              ? "Your reward was redeemed and your loyalty balance updated immediately."
              : `Thanks, ${persona.profile.firstName}. Your order is placed and being processed.`}
          </div>
          <div className={styles.orderNumWrap}>
            <span className={styles.orderNum}>Order {shownOrderId}</span>
          </div>
        </>
      )}

      <OrderStatusBar stages={ORDER_STATUS_STAGES} current={orderStatus} />

      <div className={styles.layout}>
        <div className={styles.main}>
          <LoyaltyRewardCard order={finalOrder} />
          {!reviewing && (
            <Receipt
              order={finalOrder}
              label={hasRedemption ? "Redeemed items" : "Items ordered"}
            />
          )}

          {!reviewing &&
            (hasRedemption ? (
              <div className={styles.deliveryCard}>
                <h3>📦 Reward delivery</h3>
                <p className={styles.addr}>
                  {persona.addresses[0].line1}, {persona.addresses[0].city}
                </p>
                <p>Tracking will be sent to {persona.profile.email}</p>
              </div>
            ) : (
              <div className={styles.deliveryCard}>
                <h3>🚚 Estimated delivery</h3>
                <p className={styles.addr}>
                  {persona.addresses[0].line1}, {persona.addresses[0].city}
                </p>
                <p>
                  3–5 business days · Tracking emailed to{" "}
                  {persona.profile.email}
                </p>
              </div>
            ))}

          <RedeemView excludeItemIds={excludeItemIds} />

          <Button
            variant="primary"
            style={{ width: "100%" }}
            onClick={() => router.push("/")}
          >
            ← Back to store
          </Button>
        </div>
        <ConfirmSidebar />
      </div>
    </main>
  );
}
