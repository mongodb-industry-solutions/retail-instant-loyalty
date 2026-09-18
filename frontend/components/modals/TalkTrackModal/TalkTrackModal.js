"use client";

import { useState } from "react";
import { Text } from "@via-ds/components/typography";
import modal from "../Modal.module.css";

const TABS = [
  {
    key: "what",
    label: "What is it?",
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
    key: "howto",
    label: "How to demo",
    render: () => (
      <>
        <p>Use the demo as a retail journey, not a feature tour.</p>
        <ul>
          <li>
            <b>Start with persona selection</b> — choose a new shopper first,
            then switch to a returning shopper to show how loyalty context
            changes recommendations, balance, and available actions.
          </li>
          <li>
            <b>Browse or search the store</b> — show the shopper-friendly
            storefront first: promo banner, recommendations, and product
            discovery should feel like a normal retail experience.
          </li>
          <li>
            <b>Open a product and add to cart</b> — use the product detail view
            to talk through current product information, nearby availability,
            and live inventory-aware merchandising.
          </li>
          <li>
            <b>Complete checkout</b> — optionally apply coins, place the order,
            and show that the loyalty balance, tier progress, and order history
            update immediately after confirmation.
          </li>
          <li>
            <b>Use redemption from the receipt</b> — place a reward order
            without leaving the journey to show that balance debiting, optional
            tender split, and reward-order creation happen in one live flow.
          </li>
          <li>
            <b>Use Talk Track, wand icons, and Admin as presenter surfaces</b> —
            keep MongoDB terms here, not on the shopper UI, so the experience
            stays retail-led while you explain the architecture behind it.
          </li>
        </ul>
      </>
    ),
  },
  {
    key: "behind",
    label: "Behind the scenes",
    render: () => (
      <>
        <p>
          This demo shows one operational data foundation supporting commerce,
          loyalty, and post-purchase flows together.
        </p>
        <ul>
          <li>
            <b>The customer profile stays live.</b> Balance, tier, preferences,
            and order history can live together so the app does not need to wait
            for separate systems to reconcile loyalty state.
          </li>
          <li>
            <b>Orders and rewards move through the same operational flow.</b>{" "}
            Purchase confirmation can write the order, credit rewards, and
            refresh the customer view immediately.
          </li>
          <li>
            <b>Reward redemption stays accurate.</b> A redemption can debit
            coins, optionally charge the remaining tender, create the reward
            order, and refresh the shopper experience in one confirmation path.
          </li>
          <li>
            <b>Discovery runs on current catalog and customer context.</b>{" "}
            Search, recommendations, and facets can use live product data plus
            current shopper signals instead of stale copies.
          </li>
          <li>
            <b>Retail teams can tune the program without replatforming.</b> Coin
            value, multiplier windows, featured offers, and audience rules are
            configuration that can be adjusted as campaigns change.
          </li>
          <li>
            <b>Event-driven updates stay available behind the scenes.</b>{" "}
            Triggers, change streams, and downstream consumers can react to
            loyalty and order changes without pushing those implementation
            details into the shopper UI.
          </li>
        </ul>
      </>
    ),
  },
  {
    key: "architecture",
    label: "Architecture",
    render: () => (
      <>
        <p>This is the presenter view of how the demo works end to end.</p>
        {/* LeafyGreen UI pass: this diagram's colors used to be a hand-picked
        warm-neutral palette (bespoke hex, not shared with the rest of the
        app). Now reuses the same @leafygreen-ui/palette-sourced CSS custom
        properties as everywhere else (var(--bg), var(--green-dark), etc. —
        see app/globals.css), via inline style since these are one-off
        diagram boxes rather than a reusable CSS-module class. */}
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
      </>
    ),
  },
];

export default function TalkTrackModal({ onClose }) {
  const [active, setActive] = useState("what");
  const tab = TABS.find((t) => t.key === active) || TABS[0];
  return (
    <>
      <div className={modal.head}>
        <Text as="h2">✨ Talk track</Text>
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
      <div className={modal.body}>{tab.render()}</div>
    </>
  );
}
