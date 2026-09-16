"use client";

import styles from "./ConfirmView.module.css";
import { Icon } from "@via-ds/icons";
import { Text } from "@via-ds/components/typography";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSelectedUser,
  selectLastOrder,
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
  const latestRedeem = useSelector(selectLastOrder);
  const shownOrderId = "123456";
  //const finalOrder = useSelector(selectLastOrder); // To be used once the backend integration is complete
  const finalOrder = {
    orderId: "MS-118820",
    customerId: "CUST-10002",
    items: [
      {
        productId: "PROD-1001",
        name: "Trail Runner Jacket",
        price: 99.98,
        quantity: 1,
      },
    ],
    amountSummary: {
      subtotal: 99.98,
      shipping: 0,
      tax: 8.5,
      total: 108.48,
    },
    transactionId: "TXN-99213",
    rewardsEarned: 99,
    statusHistory: [{ Status: "placed", lastUpdated: null }],
    createdAt: "2026-09-03T15:12:00.000Z",
    loyalty: {
      oldBalance: 3240,
      newBalance: 3739,
      oldTier: "gold",
      newTier: "gold",
      tierChanged: false,
      qualifyingSpend: 99.98,
      coinsUsed: 0,
    },
  };

  const excludeItemIds = new Set(
    finalOrder.items.map((item) => item.productId),
  );

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

          {!reviewing && <Receipt />}

          {!reviewing &&
            (hasRedemption ? (
              <div className={styles.deliveryCard}>
                <h3>📦 Reward delivery</h3>
                <p className={styles.addr}>
                  {persona.profile.ship.address}, {persona.profile.ship.city}
                </p>
                <p>
                  {latestRedeem.shipBy} · Tracking will be sent to{" "}
                  {persona.profile.email}
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
