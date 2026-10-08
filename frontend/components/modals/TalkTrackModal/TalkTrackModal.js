"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Text } from "@via-ds/components/typography";
import { WizardIcon } from "@/components/Icons/Icons";
import modal from "../Modal.module.css";
import BehindTheScenes from "./BehindTheScenes";

function HowToContent({ pathname }) {
  const route = pathname.replace(/\/+$/, "") || "/";

  switch (route) {
    case "/":
      return (
        <>
          <p>
            Start with the shopper and let the loyalty experience unfold
            naturally.
          </p>
          <ul>
            <li>
              <b>Choose a persona</b> to compare a new shopper with a returning
              customer whose balance and tier personalize the experience.
            </li>
            <li>
              <b>Browse or search the catalog</b> and point out recommendations,
              featured offers, and product availability.
            </li>
            <li>
              <b>Open a product</b> to review its details, then add it to the
              cart to begin a purchase.
            </li>
            <li>
              <b>Continue through checkout</b> to show how coins can be applied
              and how rewards update after the order.
            </li>
          </ul>
        </>
      );
    case "/cart":
      return (
        <>
          <p>
            Use the cart to connect product discovery with a flexible checkout.
          </p>
          <ul>
            <li>
              <b>Review the items and quantities</b> before continuing to
              checkout.
            </li>
            <li>
              <b>Call out the current order total</b> and how the selected
              shopper's loyalty balance can contribute to the purchase.
            </li>
            <li>
              <b>Continue to checkout</b> to choose how coins and other tender
              are combined.
            </li>
          </ul>
        </>
      );
    case "/checkout":
      return (
        <>
          <p>Show how loyalty fits directly into the purchase decision.</p>
          <ul>
            <li>
              <b>Review the order summary</b> alongside the shopper's available
              coin balance.
            </li>
            <li>
              <b>Apply coins</b> and compare the remaining amount due; the
              purchase can use coins, cash, or both.
            </li>
            <li>
              <b>Place the order</b> to demonstrate that confirmation and
              loyalty updates happen in the same flow.
            </li>
          </ul>
        </>
      );
    case "/confirm":
    case "/confirmation":
      return (
        <>
          <p>
            Use the receipt to close the purchase story and show its immediate
            loyalty impact.
          </p>
          <ul>
            <li>
              <b>Review the order confirmation</b> and the items purchased.
            </li>
            <li>
              <b>Point out the loyalty update</b>, including earned or redeemed
              coins and the shopper's refreshed balance or tier progress.
            </li>
            <li>
              <b>Try redemption from the receipt</b> to show how a reward order
              can be created in the same journey.
            </li>
            <li>
              <b>Continue to the profile or order history</b> to verify the
              updated customer and purchase details.
            </li>
          </ul>
        </>
      );
    case "/profile":
      return (
        <>
          <p>Show the customer view of loyalty status and program benefits.</p>
          <ul>
            <li>
              <b>Review the current balance and tier</b> for the selected
              shopper.
            </li>
            <li>
              <b>Walk through tier progress and benefits</b> to explain how
              purchases affect future rewards.
            </li>
            <li>
              <b>Edit profile details</b> to show that customer information can
              be managed from the experience.
            </li>
            <li>
              <b>Return to the store</b> and demonstrate how the shopper's
              current loyalty context informs discovery.
            </li>
          </ul>
        </>
      );
    case "/orders":
      return (
        <>
          <p>
            Use order history to show the post-purchase view for the shopper.
          </p>
          <ul>
            <li>
              <b>Review recent orders</b> and their current status.
            </li>
            <li>
              <b>Open an order</b> to inspect its items, totals, and purchase
              details.
            </li>
            <li>
              <b>Connect the order to loyalty</b> by comparing the purchase with
              the customer's current balance and tier.
            </li>
          </ul>
        </>
      );
    case "/coin-history":
      return (
        <>
          <p>
            Make loyalty activity tangible by following the shopper's coin
            history.
          </p>
          <ul>
            <li>
              <b>Review recent earn and spend activity</b> and identify the
              transaction behind each change.
            </li>
            <li>
              <b>Connect entries to purchases or redemptions</b> to explain why
              the balance changed.
            </li>
            <li>
              <b>Return to the profile</b> to compare the activity with the
              current balance and tier.
            </li>
          </ul>
        </>
      );
    default:
      return (
        <>
          <p>Use the demo as a retail journey, not a feature tour.</p>
          <ul>
            <li>
              <b>Start with persona selection</b> to show how loyalty context
              changes the shopper experience.
            </li>
            <li>
              <b>Browse products, complete a purchase, and review the result</b>{" "}
              to connect discovery, checkout, and loyalty updates.
            </li>
            <li>
              <b>Use Talk Track and Admin as presenter surfaces</b> for the
              architecture and program configuration details.
            </li>
          </ul>
        </>
      );
  }
}

const TABS = [
  {
    key: "howto",
    label: "How to demo this page",
    render: (pathname) => <HowToContent pathname={pathname} />,
  },
  {
    key: "what",
    label: "Instant loyalty",
    render: () => (
      <>
        <p>
          An instant, real-time loyalty program — every coin a customer earns or
          spends updates their balance, tier, and available rewards immediately,
          everywhere in the app.
        </p>
        <ul>
          <li>
            No nightly batch job. The balance you see on screen is the balance
            right now, not &quot;as of last night.&quot;
          </li>
          <li>
            Recommendations re-rank live against the customer&apos;s current
            balance — spend coins, and the next set of picks reflects the new
            balance instantly.
          </li>
          <li>
            Checkout supports coins, cash, or a blend of both, calculated live
            at the moment of purchase.
          </li>
          <li>
            Tier, reward value, and promo timing are configurable in Admin and
            apply across the experience immediately.
          </li>
        </ul>
      </>
    ),
  },
  {
    key: "behind",
    label: "Behind the scenes",
    render: () => (<BehindTheScenes />),
  },
  {
    key: "mongodb",
    label: "Why MongoDB",
    render: () => (
      <>
        <p>
          MongoDB fits this retail loyalty use case because loyalty state,
          merchandising context, and order activity all need to move together
          while the shopper is still active.
        </p>
        <ul>
          <li>
            <b>Instant reward updates at checkout</b> — when a purchase closes,
            the customer can see updated coins, tier progress, and next-best
            actions immediately instead of waiting for overnight processing.
          </li>
          <li>
            <b>One live customer view</b> — profile, loyalty balance,
            preferences, and order history can evolve together in a flexible
            document model, so the experience stays current as the program
            changes.
          </li>
          <li>
            <b>Personalization stays operational</b> — Atlas Search and facets
            can work directly against the live catalog and customer context, so
            discovery is based on current data rather than stale copies.
          </li>
          <li>
            <b>Campaigns move at retail speed</b> — multiplier events, seasonal
            offers, and audience rules can be updated as data and configuration,
            with Atlas Triggers applying logic as events arrive.
          </li>
          <li>
            <b>Post-purchase experiences stay in sync</b> — change-stream and
            event-driven patterns can refresh downstream screens, messages, and
            workflows when loyalty or order state changes.
          </li>
          <li>
            <b>The journey runs on one platform</b> — Atlas can support purchase
            events, loyalty state, search-driven discovery, and re-engagement
            flows on the same operational data foundation.
          </li>
        </ul>

        <p>This is the presenter view of how the demo works end to end.</p>
        <div style={{ display: "grid", gap: 12, margin: "16px 0" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 42px 1.2fr 42px 1fr",
              gap: 10,
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border-strong)",
                borderRadius: 16,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: 6,
                }}
              >
                Experience
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "var(--green-dark)",
                  marginBottom: 6,
                }}
              >
                Shopper app
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "var(--text-muted)",
                }}
              >
                Persona selection, product discovery, cart, checkout,
                confirmation, order history, and redemption.
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                color: "var(--green-dark)",
                fontWeight: 700,
              }}
            >
              →
            </div>
            <div
              style={{
                background:
                  "linear-gradient(180deg,var(--green-tint),var(--surface))",
                border: "1px solid var(--border-emerald)",
                borderRadius: 16,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "var(--green-dark)",
                  marginBottom: 6,
                }}
              >
                Operational data layer
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "var(--green-dark)",
                  marginBottom: 8,
                }}
              >
                MongoDB Atlas
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: "var(--green-darker)",
                }}
              >
                Customer profile and loyalty balance
                <br />
                Product catalog and inventory
                <br />
                Orders and order history
                <br />
                Loyalty rules and campaign configuration
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                color: "var(--green-dark)",
                fontWeight: 700,
              }}
            >
              →
            </div>
            <div
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border-strong)",
                borderRadius: 16,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: 6,
                }}
              >
                Retail outcomes
              </div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "var(--green-dark)",
                  marginBottom: 6,
                }}
              >
                Live experiences
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "var(--text-muted)",
                }}
              >
                Instant reward crediting, current balance visibility,
                personalized discovery, redemption, and refreshed order history.
              </div>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 10,
            }}
          >
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--green-dark)",
                  marginBottom: 4,
                }}
              >
                Atlas Search and facets
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  color: "var(--text-muted)",
                }}
              >
                Supports shopper discovery against the live catalog and current
                customer context.
              </div>
            </div>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--green-dark)",
                  marginBottom: 4,
                }}
              >
                Application logic and triggers
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  color: "var(--text-muted)",
                }}
              >
                Applies earn rules, redemption logic, campaign configuration,
                and real-time workflow steps at confirmation.
              </div>
            </div>
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--green-dark)",
                  marginBottom: 4,
                }}
              >
                Change streams and downstream updates
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  color: "var(--text-muted)",
                }}
              >
                Makes it possible to fan out order and loyalty changes to
                messaging, admin views, and other connected experiences.
              </div>
            </div>
          </div>
        </div>
        <ul>
          <li>
            <b>The storefront stays shopper-friendly.</b> Technical terms stay
            inside Talk Track, Admin, and presenter cues.
          </li>
          <li>
            <b>The operational records stay current.</b> Customer, order,
            reward, and catalog state can be updated without waiting for batch
            synchronization.
          </li>
          <li>
            <b>The same data supports both experiences and operations.</b> The
            retailer can personalize the journey while still powering downstream
            event handling from the same foundation.
          </li>
        </ul>
      </>
    ),
  },
];

export default function TalkTrackModal({ onClose }) {
  const [active, setActive] = useState("howto");
  const pathname = usePathname() || "/";
  const tab = TABS.find((t) => t.key === active) || TABS[0];
  return (
    <>
      <div className={modal.head}>
        <Text as="h2">
          <WizardIcon size={18} aria-hidden="true" /> Talk track
        </Text>
        <button className={modal.close} onClick={onClose}>
          ✕
        </button>
      </div>
      <div className={modal.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`${modal.tab} ${t.key === active ? modal.tabActive : ""}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={modal.body}>{tab.render(pathname)}</div>
    </>
  );
}
