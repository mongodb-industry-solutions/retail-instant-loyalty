"use client";

import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { currentTierFor, formatCoinValue } from "@/lib/helper";
import { ChevronRightIcon } from "@/components/Icons/Icons";
import styles from "./OrdersView.module.css";
import shared from "@/components/shared.module.css";
import {
  selectSelectedUser,
  selectLoyaltyConfig,
  openModal,
} from "@/redux/slices/GlobalSlice";
import { use, useEffect, useState } from "react";
import { fetchOrders } from "@/lib/api";

export default function OrdersView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const persona = useSelector(selectSelectedUser);
  const { rewardDetails } = useSelector(selectLoyaltyConfig);
  const [orders, setOrders] = useState(null);
  console.log("Persona:", persona.customerId);

  useEffect(() => {
    let cancelled = false;
    fetchOrders(persona.customerId)
      .then((ordersData) => {
        if (cancelled) return;
        setOrders(ordersData);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to fetch orders:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [persona.customerId]);

  console.log("Orders:", orders);

  const loading = orders === null;

  const completedOrders = loading
    ? 0
    : orders.filter((order) =>
        ["Delivered", "Fulfilled"].includes(order.status),
      ).length;
  const tier = persona.loyaltyDetails
    ? persona.loyaltyDetails.activeTier
    : null;

  return (
    <main className={shared.page}>
      <div className={shared.crumb}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            router.push("/");
          }}
        >
          Continue shopping
        </a>{" "}
        / <span className={shared.current}>My orders</span>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : orders.length === 0 ? (
        <div className={shared.historyCard}>
          <div className={shared.historyEmpty}>
            No orders yet. Place an order to see it here.
          </div>
        </div>
      ) : (
        <div className={styles.shell}>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Orders on file</div>
              <div className={styles.summaryValue}>{orders.length}</div>
              <div className={styles.summarySub}>
                Persisted order history available for this customer profile.
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Completed</div>
              <div className={styles.summaryValue}>{completedOrders}</div>
              <div className={styles.summarySub}>
                Delivered purchases and fulfilled redemptions.
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Reward position</div>
              <div className={`${styles.summaryValue} mono`}>
                {persona.loyaltyDetails.coinBalance}
              </div>
              <div className={styles.summarySub}>
                {tier
                  ? `${tier.tierName} tier · ${formatCoinValue(tier.tierKey, rewardDetails)} per coin`
                  : "New customer profile"}
              </div>
            </div>
          </div>
          <div className={styles.tableCard}>
            <div className={styles.tableHead}>
              <span>Order</span>
              <span>Commercial summary</span>
              <span>Status</span>
            </div>
            <div className={styles.list}>
              {orders.map((order) => (
                <div
                  className={styles.row}
                  key={order.orderId}
                  onClick={() =>
                    dispatch(
                      openModal({
                        modalType: "orderDetail",
                        props: { id: order.orderId },
                      }),
                    )
                  }
                >
                  <div className={styles.rowMain}>
                    <div className={styles.rowKicker}>
                      {order.type === "redeem" ? "Reward order" : "Purchase"}
                    </div>
                    <div className={`${styles.rowId} mono`}>
                      {order.orderId}
                    </div>
                    <div className={styles.rowType}>
                      {/* {orderSecondaryLine(o, orderMeta)} */}
                    </div>
                  </div>
                  <div className={styles.rowMetrics}>
                    <div className={`${styles.rowValue} mono`}>
                      {/* {orderCommercialValue(o)} */}
                    </div>
                    <div className={`${styles.rowCoins} mono`}>
                      {order.type === "redeem"
                        ? `${order.loyalty.coinsUsed.toLocaleString()} coins applied`
                        : `+${order.rewardsEarned.toLocaleString()} coins earned`}
                    </div>
                  </div>
                  <div className={styles.rowRight}>
                    <span
                      className={`${shared.channelBadge} ${shared.channelBadgeOnline}`}
                    >
                      🌐 Online
                    </span>
                    <span
                      className={`${styles.statusPill} ${order.type === "redeem" ? styles.statusPillRedeem : ""}`}
                    >
                      {order.status}
                    </span>
                    <ChevronRightIcon className={styles.chevRight} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
