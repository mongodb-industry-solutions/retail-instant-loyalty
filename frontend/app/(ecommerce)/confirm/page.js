"use client";

import styles from "./ConfirmView.module.css";
import { Icon } from "@via-ds/icons";
import { Text } from "@via-ds/components/typography";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSelectedUser,
  selectLastOrder,
  selectLastRedeem,
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
  const redemptionJustConfirmed = false;
  const redeemJustConfirmedOrderId = "123456";
  const hasRedemption = false;
  const reviewing = false;
  const persona = useSelector(selectSelectedUser);
  // POST /orders response envelope: { order, loyalty }. loyalty is a sibling
  // of order in the API, but Receipt/ConfirmSidebar/LiveFeedEvent all read it
  // off the order itself, so it's merged in once here rather than at each
  // call site.
  const lastOrder = useSelector(selectLastOrder);
  const latestRedeem = useSelector(selectLastRedeem);
  const finalOrder = lastOrder?.order
    ? { ...lastOrder.order, loyalty: lastOrder.loyalty }
    : null;
  const shownOrderId = finalOrder?.orderId;

  const excludeItemIds = new Set(
    (finalOrder?.items ?? []).map((item) => item.productId),
  );

  // Redux isn't persisted, so a refresh on /confirm leaves nothing to show.
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
            {hasRedemption ? "Reward order confirmed!" : "Order confirmed!"}
          </div>
          <div className={styles.sub}>
            {hasRedemption
              ? "Your reward order is confirmed and your loyalty balance updated immediately."
              : `Thanks, ${persona.profile.firstName}. Your order is placed and being processed.`}
          </div>
          <div className={styles.orderNumWrap}>
            <span className={styles.orderNum}>Order {shownOrderId}</span>
          </div>
        </>
      )}

      <div className={styles.layout}>
        <div className={styles.main}>
          <LoyaltyRewardCard animKey={shownOrderId} />

          {!reviewing && (
            <Receipt order={finalOrder} lastRedeem={latestRedeem} />
          )}

          {!reviewing &&
            (hasRedemption ? (
              <div className={styles.deliveryCard}>
                <h3>📦 Reward delivery</h3>
                <p className={styles.addr}>
                  {persona.addresses[0].line1}, {persona.addresses[0].city}
                </p>
                <p>
                  Tracking will be sent to {persona.profile.email}
                </p>
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
