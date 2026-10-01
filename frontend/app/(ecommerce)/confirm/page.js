"use client";
import { useState, useEffect, useMemo } from "react";

import styles from "./ConfirmView.module.css";
import { Icon } from "@via-ds/icons";
import { Text } from "@via-ds/components/typography";
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
import { fetchOrder } from "@/lib/api";
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
  const shownOrderId = finalOrder?.orderId;
  const [orderStatus, setOrderStatus] = useState("authorizing");

  const orderId = finalOrder?.orderId ?? finalOrder?.id;
  const customerId = persona?.customerId;

  // Superseded by the change-stream-backed SSE effect below.
  // useEffect(() => {
  //   if (!orderId || !customerId) return;
  //
  //   let stopped = false;
  //   let timer;
  //
  //   const statusPoll = async () => {
  //     console.log("Poll request started");
  //
  //     try {
  //       const orderData = await fetchOrder({ orderId, customerId });
  //
  //       console.log("Poll response:", orderData);
  //
  //       if (stopped) return;
  //
  //       const latestStatus = orderData?.currentStatus ?? "authorizing";
  //
  //       setOrderStatus(latestStatus);
  //
  //       if (latestStatus === "delivered") {
  //         console.log("Polling stopped: delivered");
  //         return;
  //       }
  //
  //       timer = setTimeout(statusPoll, 1000);
  //     } catch (error) {
  //       console.error("Polling failed:", error);
  //
  //       if (!stopped) {
  //         timer = setTimeout(statusPoll, 1000);
  //       }
  //     }
  //   };
  //
  //   statusPoll();
  //
  //   return () => {
  //     stopped = true;
  //     clearTimeout(timer);
  //   };
  // }, [orderId, customerId]);

  useEffect(() => {
    if (!orderId || !customerId) return;

    const source = new EventSource(
      `/api/orders/${orderId}/orderstatus?customerId=${encodeURIComponent(customerId)}`,
    );

    source.onmessage = (event) => {
      try {
        const { status } = JSON.parse(event.data);

        console.log("Order status event:", status);

        if (status) setOrderStatus(status);

        if (status === "delivered") {
          console.log("Order status stream done: delivered");
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

  if (!finalOrder) {
    return (
      <main className={styles.wrap}>
        <div className={styles.sub}>No recent order to show.</div>
        <Button variant="primary" onClick={() => router.push("/")}>
          ← Back to store
        </Button>
      </main>
    );
  }

  const showOnlyStepper = ["authorizing", "placed"].includes(orderStatus);

  if (showOnlyStepper) {
    return (
      <main className={styles.wrap}>
        <OrderStatusBar stages={ORDER_STATUS_STAGES} current={orderStatus} />
        <div className={styles.pendingStatus}>
          <span className={styles.spinner} aria-hidden="true" />
          <span>
            {orderStatus === "authorizing"
              ? "Authorizing payment…"
              : "Confirming your order…"}
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

  return (
    <main className={styles.wrap}>
      <OrderStatusBar stages={ORDER_STATUS_STAGES} current={orderStatus} />

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
        <ConfirmSidebar
          persona={persona}
          order={finalOrder}
          lastRedeem={latestRedeem}
        />
      </div>
    </main>
  );
}
