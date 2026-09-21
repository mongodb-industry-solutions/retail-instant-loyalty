"use client";

import styles from "./ConfirmView.module.css";
import { Icon } from "@via-ds/icons";
import { Text } from "@via-ds/components/typography";
import { useDispatch, useSelector } from "react-redux";
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
export default function ConfirmView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const redemptionInProgress = false;
  const reviewing = false;
  const persona = useSelector(selectSelectedUser);
  // POST /orders and POST /redeem share the same response envelope:
  // { order, loyalty }. lastEvent says which of the two happened most
  // recently, so a redeem after a purchase drives the page instead of the
  // stale order it was reviewed from.
  const lastOrder = useSelector(selectLastOrder);
  const latestRedeem = useSelector(selectLastRedeem);
  const lastEvent = useSelector(selectLastEvent);
  const hasRedemption = lastEvent === "redeem";
  const activeEvent = hasRedemption ? latestRedeem : lastOrder;
  const finalOrder = activeEvent?.order
    ? { ...activeEvent.order, loyalty: activeEvent.loyalty }
    : null;
  const shownOrderId = finalOrder?.orderId;

  console.log("Final order:", finalOrder);

  const excludeItemIds = new Set(
    (finalOrder?.items ?? []).map((item) => item.productId),
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
