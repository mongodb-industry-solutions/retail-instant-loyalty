"use client";

import { Button } from "@via-ds/components/button";
import { Icon } from "@via-ds/icons";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./ConfirmSidebar.module.css";
import { openModal, selectActiveEvent } from "@/redux/slices/GlobalSlice";
import { registerFreestyleContent } from "@/components/modals/freestyleContentRegistry";
import { behindTheScenesEvents } from "./LiveFeedEvent";

// persona and order come from confirm/page.js, which guards them before
// rendering. lastRedeem is the { order, loyalty } envelope from a completed
// redemption, or null if none has happened yet this session.
export default function ConfirmSidebar({ withAnimation = true }) {
  const dispatch = useDispatch();
  const activeEvent = useSelector(selectActiveEvent);
  const events = behindTheScenesEvents();
  const eventCount = events.length;
  const orderId = activeEvent?.order?.orderId;
  const [feedProgress, setFeedProgress] = useState(() => ({
    orderId,
    visibleCount: 1,
  }));
  const visibleCount = withAnimation
    ? feedProgress.orderId === orderId
      ? feedProgress.visibleCount
      : 1
    : eventCount;

  useEffect(() => {
    if (!withAnimation) return;

    const timerIds = [];
    for (let count = 2; count <= eventCount; count += 1) {
      timerIds.push(
        setTimeout(
          () => setFeedProgress({ orderId, visibleCount: count }),
          (count - 1) * 1000,
        ),
      );
    }

    return () => timerIds.forEach(clearTimeout);
  }, [eventCount, orderId, withAnimation]);

  return (
    <aside className={styles.side}>
      <div className={styles.liveFeedCard}>
        <div className={styles.liveFeedHead}>
          <div className={styles.liveFeedKickerContainer}>
            <div className={styles.liveFeedKicker}>Behind the scenes</div>
            <span className={styles.livePill}>
              <span className={styles.liveDot}></span>Instant Rewards
            </span>
          </div>
          <h3>
            Learn more about how MongoDB powers instant rewards for
            customers.{" "}
          </h3>
        </div>
        <div className={styles.liveFeedList}>
          {events.slice(0, visibleCount).map((evt, idx) => (
            <div className={styles.liveFeedItem} key={idx}>
              <div className={styles.liveFeedIcon}>
                <Icon glyph={evt.icon} size={18} />
              </div>
              <div className={styles.liveFeedContent}>
                <div className={styles.liveFeedItemHead}>
                  <div className={styles.liveFeedTitle}>{evt.title}</div>
                  {evt.extraElement && evt.extraElement}
                </div>
                {evt.body}
                {evt.modalContent && (
                  <Button
                    variant="tertiary"
                    size="small"
                    onClick={() => {
                      const contentId = registerFreestyleContent(
                        evt.modalContent,
                      );
                      dispatch(
                        openModal({
                          modalType: "freestyle",
                          props: { contentId },
                        }),
                      );
                    }}
                  >
                    <Icon glyph="Wizard" size={14} aria-hidden="true" />
                    Learn more
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
