"use client";

import { useEffect, useState } from "react";
import { Button } from "@via-ds/components/button";
import { useDispatch } from "react-redux";
import { liveFeedEventsForOrder } from "../../app/(ecommerce)/confirm/LiveFeedEvent";
import styles from "./ConfirmSidebar.module.css";
import { openModal } from "@/redux/slices/GlobalSlice";

// All three come from confirm/page.js, which guards them before rendering.
export default function ConfirmSidebar({ persona, order, lastRedeem }) {
  const dispatch = useDispatch();

  // Same animation key ConfirmView keys its before/after counters on: the
  // feed replays from empty whenever the narrated order changes. Keyed on
  // lastRedeem, not the 3.4s justConfirmed flash, or the feed would wipe
  // and replay the purchase narration once that flash expired.
  const animKey = lastRedeem ? lastRedeem.orderId : order.orderId;

  const [feedItems, setFeedItems] = useState([]);
  useEffect(() => {
    setFeedItems([]);
    const target = lastRedeem
      ? {
          id: lastRedeem.orderId,
          type: "redeem",
          items: lastRedeem.items,
          coinsUsed: lastRedeem.coinsUsed,
          cashDue: lastRedeem.cashDue,
          balanceBefore: lastRedeem.balanceBefore,
          balanceAfter: lastRedeem.balanceAfter,
          shipBy: lastRedeem.shipBy,
          tracking: lastRedeem.tracking,
        }
      : order;
    const events = liveFeedEventsForOrder(target, persona);
    const timers = events.map((evt, idx) =>
      setTimeout(() => setFeedItems((prev) => [...prev, evt]), 250 + idx * 380),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animKey]);

  return (
    <aside className={styles.side}>
      <div className={styles.liveFeedCard}>
        <div className={styles.liveFeedHead}>
          <div>
            <div className={styles.liveFeedKicker}>Behind the scenes</div>
            <h3>What happens in real time</h3>
          </div>
          <span className={styles.livePill}>
            <span className={styles.liveDot}></span>Live
          </span>
        </div>
        <p className={styles.liveFeedSub}>
          One shopper action can confirm the order, update loyalty state, and
          refresh connected retail experiences in real time.
        </p>
        <div className={styles.liveFeedList}>
          {feedItems.map((evt, idx) => (
            <div className={styles.liveFeedItem} key={idx}>
              <div className={styles.liveFeedIcon}>{evt.icon}</div>
              <div>
                <div className={styles.liveFeedTitle}>{evt.title}</div>
                <div className={styles.liveFeedBody}>{evt.body}</div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.syncCard}>
          <div className={styles.syncIcon}>📡</div>
          <div>
            <h3>Synced across channels</h3>
            <p>
              In-store POS ✓ Mobile app ✓ — a change stream on the customer
              document pushed this balance to both instantly.
            </p>
            <Button
              size="small"
              onClick={() => dispatch(openModal({ modalType: "sync" }))}
            >
              {"{ } See how"}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
