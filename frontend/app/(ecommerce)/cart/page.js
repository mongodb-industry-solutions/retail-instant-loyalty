"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { H3 } from "@via-ds/components/typography";
import { Button } from "@via-ds/components/button";
import { useSelector } from "react-redux";
import { selectCart, selectProductsData } from "@/redux/slices/GlobalSlice";
import shared from "@/components/shared.module.css";
import styles from "./CartView.module.css";
import { cartItemList, formatPrice } from "@/lib/helper";
import { Icon } from "@via-ds/icons";

export default function CartView() {
  const router = useRouter();
  const cart = useSelector(selectCart);
  const products = useSelector(selectProductsData);
  const itemsList = cartItemList(cart, products);
  const subtotal = 48;
  const shipping = 0;
  const TAX_RATE = 0.07;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;
  const coins = Math.floor(total / 10);

  console.log("CartView itemsList:", itemsList);

  function go(view) {
    router.push(view === "store" ? "/" : `/${view}`);
  }

  if (itemsList.length === 0) {
    return (
      <main className={shared.page}>
        <div className={shared.crumb}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              go("store");
            }}
          >
            Continue shopping
          </a>
          / <span className={shared.current}>My Cart</span>
        </div>
        <div className={styles.emptyCart}>
          <div className={styles.icn}>🛒</div>
          <div
            style={{ fontWeight: 700, color: "var(--forest)", marginBottom: 6 }}
          >
            My Cart is empty
          </div>
          <div style={{ fontSize: 14.6 }}>
            Add a few products to see them here.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={shared.page}>
      <div className={shared.crumb}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("store");
          }}
        >
          Continue shopping
        </a>{" "}
        {"  "}
        <span className={`${shared.current} ${styles.cartTitleWrap}`}>
          My Cart ({itemsList.length} item{itemsList.length > 1 ? "s" : ""}
          ){" "}
        </span>
      </div>
      <div className={shared.layoutSplit}>
        <div>
          {itemsList.map((item) => {
            console.log("CartView item:", item);
            return (
              <div className={styles.cartItem} key={item.productId}>
                <div className={styles.ciThumb} style={{ background: "#EEE" }}>
                  <Image
                    src={item.imageURL || "/images/placeholder.png"}
                    alt={item.name}
                    fill
                    unoptimized
                    className={styles.ciThumb}
                  />
                </div>
                <div className={styles.ciInfo}>
                  <div className={styles.ciCat}>{item.category}</div>
                  <div className={styles.ciName}>{item.name}</div>
                  <div className={styles.ciPrice}>
                    {formatPrice(item.price)}
                  </div>
                </div>
                <div className={shared.qtyStepper}>
                  <button onClick={() => dispatch(cartDec(item.productId))}>
                    −
                  </button>
                  <span>{item.cartQuantity}</span>
                  <button onClick={() => dispatch(cartInc(item.productId))}>
                    +
                  </button>
                </div>
                <button
                  className={styles.ciRemove}
                  aria-label="Remove"
                  onClick={() => dispatch(cartRemove(item.productId))}
                >
                  <Icon glyph="Trash" />
                </button>
              </div>
            );
          })}
        </div>
        <div className={shared.summaryCard}>
          <H3>Order Summary</H3>
          <div className={shared.summaryRow}>
            <span>Subtotal</span>
            <span className="mono">{formatPrice(subtotal)}</span>
          </div>
          <div className={shared.summaryRow}>
            <span>Shipping</span>
            <span className={shipping === 0 ? shared.free : ""}>
              {shipping === 0 ? "Free" : formatPrice(shipping)}
            </span>
          </div>
          <div className={shared.summaryRow}>
            <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
            <span className="mono">{formatPrice(tax)}</span>
          </div>
          <div className={`${shared.summaryRow} ${shared.summaryRowTotal}`}>
            <span>Total</span>
            <span className="mono">{formatPrice(total)}</span>
          </div>
          <div className={shared.coinPreview}>
            🪙 You&apos;ll earn <b>{coins.toLocaleString()}</b> loyalty coins (
            2x active) with this order.
          </div>
          <Button
            variant="primary"
            style={{ width: "100%" }}
            onClick={() => go("checkout")}
          >
            Proceed to checkout →
          </Button>
        </div>
      </div>
    </main>
  );
}
