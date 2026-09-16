"use client";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { H3 } from "@via-ds/components/typography";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "@via-ds/components/toast";
import {
  selectSelectedUser,
  selectCart,
  selectProductsData,
  placeOrderSuccess,
} from "@/redux/slices/GlobalSlice";
import { Icon } from "@via-ds/icons";
import { Button } from "@via-ds/components/button";
import shared from "@/components/shared.module.css";
import { cartItemList, formatPrice } from "@/lib/helper";
import { createOrder } from "@/lib/api";
import styles from "./CheckoutView.module.css";

export default function CheckoutView() {
  const router = useRouter();
  const dispatch = useDispatch();
  const persona = useSelector(selectSelectedUser);
  const cart = useSelector(selectCart);
  const products = useSelector(selectProductsData);
  const cartItems = cartItemList(cart, products);
  const subtotal = 48;
  const shipping = 0;
  const TAX_RATE = 0.07;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;
  const coins = Math.floor(total / 10);
  const pricing = {
    subtotal,
    shipping,
    tax,
    total,
    coinsUsed: 0,
    coinsEarned: coins,
    projectedBalance: persona.loyaltyDetails.coins + coins,
    cashSubtotal: subtotal,
    qualifyingSpend: subtotal,
  };
  const [placingOrder, setPlacingOrder] = useState(false);

  async function handlePlaceOrder() {
    setPlacingOrder(true);
    try {
      const { order, loyalty } = await createOrder({
        order: {
          customerId: persona.customerId,
          items: cartItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.cartQuantity,
          })),
          amountSummary: {
            subtotal: pricing.subtotal,
            shipping: pricing.shipping,
            tax: pricing.tax,
            total: pricing.total,
          },
          rewardsEarned: pricing.coinsEarned,
        },
        loyalty: {
          coinsUsed: pricing.coinsUsed,
          qualifyingSpend: pricing.qualifyingSpend,
        },
      });
      dispatch(placeOrderSuccess({ order, loyalty }));
      router.push("/confirm");
    } catch (err) {
      toast.error(`Couldn't place order: ${err.message}`);
    } finally {
      setPlacingOrder(false);
    }
  }

  console.log("CheckoutView cartItems:", cartItems);
  function go(view) {
    router.push(view === "store" ? "/" : `/${view}`);
  }

  return (
    <main className={shared.page}>
      <div className={shared.crumb}>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("cart");
          }}
        >
          Back to cart
        </a>{" "}
        / <span className={shared.current}>Checkout</span>
      </div>
      <div className={shared.layoutSplit}>
        <div>
          <div className={styles.formCard}>
            <H3>
              <Icon glyph="Package" /> Shipping information
            </H3>
            <div className={shared.formRow}>
              <div className={shared.field}>
                <label>First name</label>
                <input defaultValue={persona.profile.firstName} />
              </div>
              <div className={shared.field}>
                <label>Last name</label>
                <input defaultValue={persona.profile.lastName} />
              </div>
            </div>
            <div className={shared.field} style={{ marginBottom: 12 }}>
              <label>Email</label>
              <input defaultValue={persona.profile.email} />
            </div>
            <div className={shared.field} style={{ marginBottom: 12 }}>
              <label>Address</label>
              <input defaultValue={persona.addresses[0].line1} />
            </div>
            <div className={shared.field}>
              <label>City, state, ZIP</label>
              <input
                defaultValue={`${persona.addresses[0].city}, ${persona.addresses[0].state} ${persona.addresses[0].postalCode}`}
              />
            </div>
            <div className={shared.field}>
              <label>Country</label>
              <input defaultValue={persona.addresses[0].country} />
            </div>
          </div>
          <div className={styles.formCard}>
            <H3>
              <Icon glyph="CreditCard" /> Payment details
            </H3>
            <div className={shared.field} style={{ marginBottom: 12 }}>
              <label>Card number</label>
              <input
                defaultValue={`•••• •••• •••• ${persona.paymentDetails.cardLast4}`}
              />
            </div>
            <div className={shared.formRow} style={{ marginBottom: 0 }}>
              <div className={shared.field}>
                <label>Expiry</label>
                <input defaultValue={persona.paymentDetails.cardExpiry} />
              </div>
              <div className={shared.field}>
                <label>CVV</label>
                <input defaultValue="•••" />
              </div>
            </div>
          </div>
        </div>
        <div className={shared.summaryCard}>
          <H3>Order Summary</H3>
          {cartItems.map((item) => (
            <div className={shared.orderReviewItem} key={item.productId}>
              <span className={shared.name}>
                {item.icon} {item.name} x{item.cartQuantity}
              </span>
              <span className="mono">
                {formatPrice(item.price * item.cartQuantity)}
              </span>
            </div>
          ))}
          {"Redeem Coins"}
          <div className={shared.summaryRow} style={{ marginTop: 12 }}>
            <span>Subtotal</span>
            <span className="mono">{formatPrice(pricing.subtotal)}</span>
          </div>
          {"Coins Applied Logic"}
          <div className={shared.summaryRow}>
            <span>Shipping</span>
            <span className={pricing.shipping === 0 ? shared.free : ""}>
              {pricing.shipping === 0 ? "Free" : formatPrice(pricing.shipping)}
            </span>
          </div>
          <div className={shared.summaryRow}>
            <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
            <span className="mono">{formatPrice(pricing.tax)}</span>
          </div>
          <div className={`${shared.summaryRow} ${shared.summaryRowTotal}`}>
            <span>Total</span>
            <span className="mono">{formatPrice(pricing.total)}</span>
          </div>
          <div className={shared.coinPreview}>
            🪙 {"Applied coins reduce the cash subtotal to $$20"}
            This order earns <b>{"Coins earned 200"}</b> coins on the{" "}
            <b>{"Cash subtotal 1000"}</b> cash-paid merchandise amount, bringing
            your balance to <b>{"200"}</b> coins.
          </div>
          <div className={`${shared.coinPreview} ${styles.coinPreviewPolicy}`}>
            ⭐ This order still adds <b>{"$$$"}</b> toward tier progress, even
            after applying rewards.
          </div>
          <Button
            variant="primary"
            style={{ width: "100%" }}
            isLoading={placingOrder}
            loadingText="Placing order…"
            onClick={handlePlaceOrder}
          >
            ✓ Place order
          </Button>
        </div>
      </div>
    </main>
  );
}
