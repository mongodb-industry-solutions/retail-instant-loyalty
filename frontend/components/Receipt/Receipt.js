"use client";
import Image from "next/image";
import { H3, Text } from "@via-ds/components/typography";
import { formatPrice } from "@/lib/helper";
import styles from "./Receipt.module.css";

function ItemRows({ item, amount }) {
  console.log("Item image URL:", item.imageURL);
  return (
    <div className={styles.oiRow}>
      <div className={styles.oiLeft}>
        <div className={styles.oiThumb} style={{ background: "grey" }}>
          <Image src={item.imageURL} alt={item.name} width={40} height={40} />
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
  console.log("last redeem:", lastRedeem);

  const FALLBACK_LAST_ORDER = {
    order: {
      orderId: "MS-118820",
      customerId: "CUST-10002",
      items: [
        {
          productId: "PROD-1001",
          name: "Trail Runner Jacket",
          price: 99.98,
          quantity: 1,
          imageURL:
            "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e161468f.png",
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
        newBalance: 3939,
        oldTier: "gold",
        newTier: "gold",
        tierChanged: false,
        qualifyingSpend: 99.98,
        coinsUsed: 0,
      },
    },
  };
  //const lastOrder = useSelector(selectLastOrder);
  const lastOrder = FALLBACK_LAST_ORDER.order;

  console.log("Last order:", lastOrder.items);
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
          amount={formatPrice(i.price * i.quantity)}
        />
      ))}
      <div className={styles.totalsMini}>
        <div className={styles.row}>
          <Text elementType="span">Subtotal</Text>
          <span className="mono">
            {formatPrice(lastOrder.amountSummary.subtotal)}
          </span>
        </div>
        {lastOrder.loyalty.coinsUsed ? (
          <div className={styles.row}>
            <Text elementType="span">Coins applied at checkout</Text>
            <span className="mono">
              −{lastOrder.loyalty.coinsUsed.toLocaleString()} (
              {formatPrice(lastOrder.loyalty.coveredValue)})
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
            +{lastOrder.rewardsEarned.toLocaleString()}
          </span>
        </div>
        <div className={styles.row}>
          <Text elementType="span">Tier qualifying spend</Text>
          <span className="mono">
            {formatPrice(
              lastOrder.loyalty.qualifyingSpend ||
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
  const r = lastRedeem;
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
          <ItemRow
            key={i.id}
            i={i}
            amount={`${(i.coinPrice * i.qty).toLocaleString()} coins`}
          />
        ))}
        <div className={styles.totalsMini}>
          <div className={styles.row}>
            <Text elementType="span">Coins applied</Text>
            <span className="mono">{r.coinsUsed.toLocaleString()}</span>
          </div>
          {r.cashDue > 0 ? (
            <>
              <div className={styles.row}>
                <Text elementType="span">Remaining merchandise due</Text>
                <span className="mono">{fmt(r.cashSubtotal)}</span>
              </div>
              <div className={styles.row}>
                <Text elementType="span">Tax</Text>
                <span className="mono">{fmt(r.tax)}</span>
              </div>
              <div className={styles.row}>
                <Text elementType="span">Total cash due</Text>
                <span className="mono">{fmt(r.cashDue)}</span>
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
              {r.balanceAfter.toLocaleString()} coins
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
