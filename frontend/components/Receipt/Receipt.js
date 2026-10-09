"use client";
import Image from "next/image";
import { H3, Text } from "@via-ds/components/typography";
import { formatPrice } from "@/lib/helper";
import styles from "./Receipt.module.css";

function ItemRows({ item, amount }) {
  return (
    <div className={styles.oiRow}>
      <div className={styles.oiLeft}>
        <div className={styles.oiThumb} style={{ background: "grey" }}>
          {item.imageUrl && (
            <Image src={item.imageUrl} alt={item.name} width={40} height={40} />
          )}
        </div>
        <div>
          <div className={styles.oiName}>{item.name}</div>
          <div className={styles.oiQty}>Qty {item.quantity}</div>
        </div>
      </div>
      <div className={`${styles.oiPrice} mono`}>{amount}</div>
    </div>
  );
}

export default function Receipt({ order, label = "Items ordered" }) {
  const lastOrder = order;
  if (!lastOrder) return null;

  const purchaseCard = (
    <div className={styles.itemsCard}>
      <H3>
        {label}{" "}
        <span className={`${styles.ohcId} mono`} style={{ float: "right" }}>
          {lastOrder.orderId}
        </span>
      </H3>
      {lastOrder.items.map((i) => (
        <ItemRows
          key={i.productId}
          item={i}
          amount={formatPrice(i.lineTotal)}
        />
      ))}
      <div className={styles.totalsMini}>
        <div className={styles.row}>
          <Text elementType="span">Subtotal</Text>
          <span className="mono">
            {formatPrice(lastOrder.amountSummary.subtotal)}
          </span>
        </div>
        {lastOrder.coinsApplied ? (
          <div className={styles.row}>
            <Text elementType="span">Coins applied at checkout</Text>
            <span className="mono">
              −{lastOrder.coinsApplied.toLocaleString()} (
              {formatPrice(lastOrder.coinsToDollarsApplied)})
            </span>
          </div>
        ) : null}
        <div className={styles.row}>
          <Text elementType="span">Shipping</Text>
          <span>
            {lastOrder.amountSummary.shipping === 0
              ? "Free"
              : formatPrice(lastOrder.amountSummary.shipping)}
          </span>
        </div>
        <div className={styles.row}>
          <Text elementType="span">Tax</Text>
          <span className="mono">
            {formatPrice(lastOrder.amountSummary.tax)}
          </span>
        </div>
        <div className={styles.row}>
          <Text elementType="span">Coins earned</Text>
          <span className="mono">
            +{(lastOrder.coinsEarned ?? 0).toLocaleString()}
          </span>
        </div>
        <div className={styles.row}>
          <Text elementType="span">Tier qualifying spend</Text>
          <span className="mono">
            {formatPrice(
              lastOrder.loyalty?.qualifyingSpend ??
                lastOrder.amountSummary.subtotal,
            )}
          </span>
        </div>
        <div className={`${styles.row} ${styles.grand}`}>
          <Text elementType="span">Total</Text>
          <span className="mono">
            {formatPrice(lastOrder.amountSummary.total)}
          </span>
        </div>
      </div>
    </div>
  );

  return purchaseCard;
}
