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

export default function Receipt({ order, lastRedeem }) {
  const lastOrder = order;
  if (!lastOrder) return null;

  const purchaseCard = (
    <div className={styles.itemsCard}>
      <H3>
        Items ordered{" "}
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
          <Text elementType="span">Total charged</Text>
          <span className="mono">
            {formatPrice(lastOrder.amountSummary.total)}
          </span>
        </div>
      </div>
    </div>
  );

  if (!lastRedeem) return purchaseCard;
  // Same envelope as the main order: { order, loyalty }.

  const r = lastRedeem.order;
  const rLoyalty = lastRedeem.loyalty ?? {};

  console.log("lastRedeem", lastRedeem);

  if (!r) return purchaseCard;

  return (
    <>
      {purchaseCard}
      <div className={`${styles.itemsCard} ${styles.itemsCardFlash}`}>
        <H3>
          Purchased from this receipt{" "}
          <span className={`${styles.ohcId} mono`} style={{ float: "right" }}>
            {r.orderId}
          </span>
        </H3>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            margin: "-8px 0 14px",
          }}
        >
          Completed without leaving the receipt. MongoDB applied the coin
          balance and cash remainder in one confirmation flow.
        </p>
        {r.items.map((i) => (
          <ItemRows
            key={i.productId}
            item={i}
            amount={formatPrice(i.lineTotal)}
          />
        ))}
        <div className={styles.totalsMini}>
          <div className={styles.row}>
            <Text elementType="span">Coins applied</Text>
            <span className="mono">
              {(r.coinsApplied ?? 0).toLocaleString()}
            </span>
          </div>
          {r.amountSummary?.total > 0 ? (
            <>
              <div className={styles.row}>
                <Text elementType="span">Remaining merchandise due</Text>
                <span className="mono">
                  {formatPrice(r.amountSummary.subtotal)}
                </span>
              </div>
              <div className={styles.row}>
                <Text elementType="span">Tax</Text>
                <span className="mono">{formatPrice(r.amountSummary.tax)}</span>
              </div>
              <div className={styles.row}>
                <Text elementType="span">Total cash due</Text>
                <span className="mono">
                  {formatPrice(r.amountSummary.total)}
                </span>
              </div>
            </>
          ) : (
            <div className={styles.row}>
              <Text elementType="span">Total cash due</Text>
              <span className="mono">$0.00</span>
            </div>
          )}
          <div className={`${styles.row} ${styles.grand}`}>
            <Text elementType="span">Updated coin balance</Text>
            <span className="mono">
              {(rLoyalty.newBalance ?? 0).toLocaleString()} coins
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
