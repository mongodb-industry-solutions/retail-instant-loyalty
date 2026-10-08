"use client";

import { useEffect, useState } from "react";
import { Text } from "@via-ds/components/typography";
import { useDispatch, useSelector } from "react-redux";
import { formatPrice } from "@/lib/helper";
import { fetchOrder } from "@/lib/api";
import styles from "./OrderDetailModal.module.css";
import modal from "../Modal.module.css";
import shared from "../../shared.module.css";
import {
  selectSelectedUser,
  selectInspectedEvent,
  setInspectedEvent,
} from "@/redux/slices/GlobalSlice";
import OrderStatusBar from "../../OrderStatusBar/OrderStatusBar";
import { ORDER_STATUS_STAGES } from "@/lib/data";
import ConfirmSidebar from "@/components/ConfirmSidebar/ConfirmSidebar";

function formatOrderDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function OrderItems({ items }) {
  if (!items || !items.length) {
    return (
      <div className={shared.historyEmpty}>
        Item-level detail isn&apos;t available for this order.
      </div>
    );
  }
  return (
    <div className={styles.itemsTable}>
      <div className={styles.itemsHead}>
        <span>Item</span>
        <span>Qty</span>
        <span>Total</span>
      </div>
      {items.map((i) => (
        <div className={styles.oiRow} key={i.productId}>
          <div className={styles.oiLeft}>
            <div className={styles.oiThumb}>
              {i.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.imageUrl} alt="" width={32} height={32} />
              )}
            </div>
            <div className={styles.oiCopy}>
              <div className={styles.oiName}>{i.name}</div>
              <div className={styles.oiMeta}>
                {formatPrice(i.unitPrice)} each
              </div>
            </div>
          </div>
          <div className={`${styles.oiQty} mono`}>{i.quantity}</div>
          <div className={`${styles.oiPrice} mono`}>
            {formatPrice(i.lineTotal)}
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderSummaryRows({ order }) {
  const amounts = order.amountSummary ?? {};
  return (
    <>
      <div className={styles.row}>
        <span>Subtotal</span>
        <span className="mono">{formatPrice(amounts.subtotal)}</span>
      </div>
      {order.coinsApplied > 0 ? (
        <div className={styles.row}>
          <span>Coins applied</span>
          <span className="mono">
            −{order.coinsApplied.toLocaleString()} (
            {formatPrice(order.coinsToDollarsApplied)})
          </span>
        </div>
      ) : null}
      <div className={styles.row}>
        <span>Shipping</span>
        <span>
          {amounts.shipping === 0 ? "Free" : formatPrice(amounts.shipping)}
        </span>
      </div>
      <div className={styles.row}>
        <span>Tax</span>
        <span className="mono">{formatPrice(amounts.tax)}</span>
      </div>
      <div className={styles.row}>
        <span>Coins earned</span>
        <span className="mono">
          +{(order.coinsEarned ?? 0).toLocaleString()}
        </span>
      </div>
      <div className={styles.grand}>
        <span>Order total</span>
        <span className="mono">{formatPrice(amounts.total)}</span>
      </div>
    </>
  );
}

export default function OrderDetailModal({ orderId, onClose }) {
  const dispatch = useDispatch();
  const persona = useSelector(selectSelectedUser);
  const inspectedEvent = useSelector(selectInspectedEvent);
  const order = inspectedEvent?.order?.orderId === orderId
    ? inspectedEvent.order
    : null;
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(setInspectedEvent(null));
    if (!orderId || !persona?.customerId) return;
    let cancelled = false;
    setError(null);
    fetchOrder({ orderId, customerId: persona.customerId })
      .then((data) => {
        if (cancelled) return;
        dispatch(setInspectedEvent({ order: data, loyalty: null }));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch, orderId, persona?.customerId]);

  if (error) {
    return (
      <>
        <div className={modal.head}>
          <Text as="h2">Order</Text>
          <button className={modal.close} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={modal.body}>Couldn&apos;t load this order: {error}</div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <div className={modal.head}>
          <Text as="h2">Order</Text>
          <button className={modal.close} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={modal.body}>Loading…</div>
      </>
    );
  }

  const itemCount = (order.items ?? []).reduce(
    (sum, i) => sum + (i.quantity ?? 0),
    0,
  );
  const placedAt = order.statusHistory?.[0]?.lastUpdated ?? order.createdAt;

  let ORDER_STATUS_STAGES_FAILED = null;

  if (order?.currentStatus === "payment_failed") {
    ORDER_STATUS_STAGES_FAILED = [
      "authorizing",
      "payment_failed",
      "placed",
      "shipped",
      "delivered",
    ];
  }

  return (
    <>
      <div className={modal.head}>
        <Text as="h2">Order</Text>
        <button className={modal.close} onClick={onClose}>
          ✕
        </button>
      </div>
      <div className={modal.body}>
        <div className={styles.shell}>
          <div className={styles.top}>
            <div className={styles.title}>
              <div className={styles.kicker}>Order details</div>
              <h3>
                Order <span className="mono">{order.orderId}</span>
              </h3>
              <div className={styles.sub}>
                Placed {formatOrderDate(placedAt)} · {itemCount} item
                {itemCount === 1 ? "" : "s"} · {order.currentStatus}
              </div>
            </div>
            <div className={styles.badges}>
              <span
                className={`${shared.channelBadge} ${shared.channelBadgeOnline}`}
              >
                🌐 Online
              </span>
              <span className={styles.badge}>{order.currentStatus}</span>
            </div>
          </div>
          <OrderStatusBar
            stages={
              ORDER_STATUS_STAGES_FAILED
                ? ORDER_STATUS_STAGES_FAILED
                : ORDER_STATUS_STAGES
            }
            current={order.currentStatus}
          />
          <div className={styles.orderContent}>
            <div className={styles.itemsColumn}>
              <div className={styles.metaCards}>
                <div className={styles.metaCard}>
                  <div className={styles.metaLabel}>Rewards</div>
                  <div className={`${styles.metaValue} mono`}>
                    {order.coinsApplied > 0
                      ? `${order.coinsApplied.toLocaleString()} coins applied`
                      : `+${(order.coinsEarned ?? 0).toLocaleString()} coins earned`}
                  </div>
                  <div className={styles.metaNote}>
                    Applied inside the same order flow that updated this
                    customer record.
                  </div>
                </div>
                <div className={styles.metaCard}>
                  <div className={styles.metaLabel}>Transaction</div>
                  <div className={styles.metaValue}>{order.transactionId}</div>
                  <div className={styles.metaNote}>
                    {order.orderType ?? "ONLINE"}
                  </div>
                </div>
              </div>
              <div className={styles.panel}>
                <div className={styles.panelTitle}>Items</div>
                <OrderItems items={order.items} />
              </div>
            </div>
            <div className={styles.detailsColumn}>
              <div className={styles.panel}>
                <div className={styles.panelTitle}>Details</div>
                <div className={styles.detailList}>
                  <div className={styles.detailRow}>
                    <div className={styles.detailTerm}>Customer</div>
                    <div className={styles.detailValue}>
                      <div className={styles.detailMain}>
                        {persona?.profile?.firstName}{" "}
                        {persona?.profile?.lastName}
                      </div>
                      <div className={styles.detailMeta}>
                        {persona?.profile?.email}
                      </div>
                    </div>
                  </div>
                  <div className={styles.detailRow}>
                    <div className={styles.detailTerm}>Placed</div>
                    <div className={styles.detailValue}>
                      <div className={styles.detailMain}>
                        {formatOrderDate(placedAt)}
                      </div>
                    </div>
                  </div>
                  {persona?.addresses?.[0] && (
                    <div className={styles.detailRow}>
                      <div className={styles.detailTerm}>Delivery</div>
                      <div className={styles.detailValue}>
                        <div className={styles.detailMain}>
                          {persona.addresses[0].line1},{" "}
                          {persona.addresses[0].city}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.panelTitle}>Total</div>
                <div className={styles.summaryList}>
                  <OrderSummaryRows order={order} />
                </div>
                <div className={styles.summaryNote}>
                  Completed purchases update both order history and reward
                  balance in the same customer journey.
                </div>
              </div>
            </div>
          </div>
          <ConfirmSidebar withAnimation={false} learnMoreMode="accordion" />
        </div>
      </div>
    </>
  );
}
