'use client'
import React from 'react';
import { CodeBlock, CodeSnippet } from "@via-ds/components/code-block";

const steps = [
  {
    n: 1,
    title: "Calculate the loyalty impact",
    summary:
      "Before anything is saved, the system works out what this purchase is worth. It reads the customer's balance and tier, the live promotion multiplier and the current prices, then computes the coins earned and any tier change. The checkout preview and the final order run the exact same calculation, so what the customer sees is what they get.",
    mongo:
      "Three small reads (customer, loyalty configuration, products) and no joins. The rules come from a document, not from code.",
  },
  {
    n: 2,
    title: "Record this order in MongoDB",
    summary:
      "The order is saved right away with the status authorizing, before the payment result is known. That is a real, visible state, just like a pending order at a physical retailer. The item prices are copied into the order, so the receipt always shows what the customer actually paid.",
    mongo:
      "One order is one document, so a single insert is already atomic. Loyalty fields (coins applied, coins earned) sit next to the commerce fields, and one read renders the whole receipt.",
  },
  {
    n: 3,
    title: "Record the order payment in MongoDB",
    summary:
      "The payment attempt is saved as its own record, approved or declined. A customer can pay with coins, card, or both. If the card is declined, the failed attempt is kept and no coins are awarded. The payment gateway in this demo is simulated.",
    mongo:
      "Each payment method is one entry in a tenders array, so adding a new way to pay does not change the schema. A declined payment is stored as data, ready for decline analytics and retry flows.",
  },
  {
    n: 4,
    title: "Save loyalty changes to history",
    summary:
      "Every loyalty event from the order is written to the customer's ledger: coins earned and coins spent. Retail teams use this for the \"my coins\" activity view, support disputes and audits.",
    mongo:
      "The ledger is its own append-only collection, so it can grow without making the customer document heavier. Entry IDs are built from the order ID, so saving the same event twice cannot create a duplicate.",
  },
  {
    n: 5,
    title: "Update the customer's loyalty",
    summary:
      "The customer's balance, cumulative spend and tier are updated in the same transaction as the history entries from step 4. The new balance is available for the next purchase the moment the transaction commits.",
    mongo:
      "Everything the app needs to show about a member (balance, tier, next tier, spend) lives in one customer document, read in one fetch. The transaction wraps only the two writes that must agree: the balance and its ledger.",
    badge: "Steps 4 and 5 commit together, or neither does.",
  },
  {
    n: 6,
    title: "Refresh the customer's app automatically",
    summary:
      "As soon as the transaction commits, the database tells the app. The balance in the header updates and, when the customer moves up a tier, a celebration plays. No refresh button, no polling, no separate message broker.",
    mongo:
      "A change stream watches the customer document and pushes only committed changes, filtered on the database side to this session and this customer. The app can never show a balance that was later rolled back.",
  },
];

const redeemPipeline = `// GET /redeem/candidates  (simplified)
// "What this customer could get for free, or nearly free, right now?"
db.products.aggregate([
  { $match: { isRedeemElegible: true } },
  { $addFields: { coinsToFullyCover: { $multiply: ["$price", rate] } } },
  { $addFields: { coinsApplied: { $min: ["$coinsToFullyCover", coinBalance] } } },
  { $addFields: { cash: { $max: [0, { $subtract: ["$price", { $divide: ["$coinsApplied", rate] }] }] } } },
  { $match: { cash: { $lte: MAX_CASH_TO_PAY } } },
  { $sort: { cash: 1 } },      // closest to fully covered by coins first
  { $limit: 4 }
])`;

/* ------------------------------------------------------------------ */
/* Small presentational helpers                                        */
/* ------------------------------------------------------------------ */

const card = {
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  padding: "20px",
  marginBottom: "24px",
};

const callout = (bg, color) => ({
  background: bg,
  borderRadius: "8px",
  padding: "18px",
  textAlign: "left",
  fontSize: "1.08rem",
  color,
  marginBottom: "18px",
});

const Step = ({ step }) => (
  <div
    style={{
      borderLeft: "4px solid #0288d1",
      paddingLeft: "16px",
      marginBottom: "22px",
    }}
  >
    <h4 style={{ color: "#1a237e", margin: "0 0 6px 0" }}>
      {step.n}. {step.title}
    </h4>
    <p style={{ margin: "0 0 8px 0" }}>{step.summary}</p>
    <p style={{ margin: 0, color: "#00796b" }}>
      <strong>Why MongoDB:</strong> {step.mongo}
    </p>
    {step.badge && (
      <div
        style={{
          display: "inline-block",
          marginTop: 10,
          background: "#e8f5e9",
          color: "#2e7d32",
          borderRadius: "999px",
          padding: "4px 14px",
          fontSize: "0.95rem",
          fontWeight: 600,
        }}
      >
        {step.badge}
      </div>
    )}
  </div>
);

const DocLink = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "#0288d1", textDecoration: "underline" }}
  >
    {children}
  </a>
);

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const BehindTheScenes = () => {
  return (
    <div
      style={{
        background: "linear-gradient(90deg, #f8fafc 0%, #e0f7fa 100%)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      }}
    >
      <h2 style={{ color: "#1a237e", marginBottom: 12 }}>Loyalty: Behind the Scenes</h2>
      <p style={{ fontSize: "1.1rem", marginBottom: 18 }}>
        This demo turns every purchase into rewards the customer can use right away. It is powered by{" "}
        <strong>MongoDB Atlas</strong> as a single operational data layer: orders, payments, loyalty rules, the
        customer's balance and its history all live in one place. The result is a loyalty program that is{" "}
        <strong>correct</strong> (the balance always matches its history), <strong>instant</strong> (the app is
        told the moment coins land) and <strong>easy to change</strong> (promotions are data, not code releases).
      </p>

      {/* Process diagram */}
      <div style={{ ...card, textAlign: "center" }}>
        <h3 style={{ color: "#0288d1", marginBottom: 8 }}>The Customer Journey</h3>
        <p style={{ marginTop: 0 }}>
          From browsing to coins ready to use, and back into the next purchase.
        </p>
        <img
          src="/rsc/talkTrack/loyalty-process.svg"
          alt="Loyalty process diagram"
          style={{ maxWidth: "100%", borderRadius: "8px" }}
        />
      </div>

      {/* Architecture diagram */}
      <div style={{ ...card, textAlign: "center" }}>
        <h3 style={{ color: "#0288d1", marginBottom: 8 }}>Architecture Overview</h3>
        <p style={{ marginTop: 0 }}>
          Commerce channels write to and read from one unified data layer in MongoDB Atlas. Change streams push
          updates back out.
        </p>
        <img
          src="/rsc/talkTrack/loyalty-architecture.svg"
          alt="Loyalty architecture diagram"
          style={{ maxWidth: "100%", borderRadius: "8px" }}
        />
      </div>

      {/* Step by step */}
      <div style={card}>
        <h3 style={{ color: "#0288d1", marginBottom: 8 }}>What Happens When an Order Is Placed</h3>
        <p style={{ marginTop: 0 }}>
          Six steps, each with the business meaning and the MongoDB capability behind it.
        </p>
        {steps.map((s) => (
          <Step key={s.n} step={s} />
        ))}
      </div>

      {/* Callout: rules as data */}
      <div style={callout("#e3f2fd", "#1565c0")}>
        <h4 style={{ marginBottom: 8 }}>Promotions Are Data, Not Releases</h4>
        <div>
          Tiers and campaigns live in a configuration document. When marketing switches on a campaign such as
          Black Friday at 3x, the very next order earns triple coins and the promotion banner updates in the app,
          with no deployment and no engineering ticket. Because a campaign is just a document, new ideas such as
          date windows, category-specific bonuses or tier-only offers can be added as extra fields without a schema
          migration.
        </div>
      </div>

      {/* Callout: right guarantee */}
      <div style={callout("#fffde7", "#f57c00")}>
        <h4 style={{ marginBottom: 8 }}>The Right Guarantee for the Right Job</h4>
        <div>
          Not everything needs a transaction, and this demo shows the difference. The order is one document, so one
          write is already atomic. The payment record stands on its own, and a failed attempt is useful data.
          Only the customer's balance and its ledger entries must never disagree, so those two writes share a
          MongoDB transaction. Payment is never held inside a transaction, because a transaction should not stay
          open while waiting on an outside payment processor.{" "}
          <DocLink href="https://www.mongodb.com/docs/manual/core/transactions/">Learn more about transactions</DocLink>.
        </div>
      </div>

      {/* Callout: change streams */}
      <div style={callout("#e3f2fd", "#1565c0")}>
        <h4 style={{ marginBottom: 8 }}>Pushed, Not Polled</h4>
        <div>
          The app does not ask "has my balance changed yet?". MongoDB change streams notify it as soon as a change
          is committed, filtered to the right customer, and they can resume where they left off after a
          disconnect. In many stacks this takes extra pieces such as change data capture tooling and a message
          broker; here it is built into the database.{" "}
          <DocLink href="https://www.mongodb.com/docs/manual/changeStreams/">Learn more about change streams</DocLink>.
        </div>
      </div>

      {/* The one API worth showing: redeem candidates */}
      <div style={card}>
        <h3 style={{ color: "#0288d1", marginBottom: 8 }}>Turning Coins Into the Next Purchase</h3>
        <p style={{ marginTop: 0 }}>
          Right after coins land, the demo suggests what the customer could get for free or almost free. An{" "}
          <strong>aggregation pipeline</strong> runs inside the database against the freshly committed balance. It
          filters redeemable products, converts prices into coins at the customer's tier rate, works out the cash
          still to pay, and returns the closest matches first. The same data that records the reward also drives
          the next sale.{" "}
          <DocLink href="https://www.mongodb.com/docs/manual/core/aggregation-pipeline/">
            Learn more about aggregation pipelines
          </DocLink>
          .
        </p>
        <CodeBlock language="javascript">
          <CodeSnippet>{redeemPipeline}</CodeSnippet>
        </CodeBlock>
      </div>

      {/* Callout: one platform */}
      <div style={callout("#fffde7", "#f57c00")}>
        <h4 style={{ marginBottom: 8 }}>One Data Layer, Many Channels</h4>
        <div>
          The architecture places online, mobile and in-store point of sale on the same unified data layer. Because
          a member's balance and tier live in a single customer document, every channel that reads it sees the same
          state. This demo shows the e-commerce experience; the same design is what lets stores join without a
          second loyalty system. An Atlas Trigger also prepares a fresh loyalty configuration for each demo session,
          so every run starts clean.{" "}
          <DocLink href="https://www.mongodb.com/docs/atlas/atlas-ui/triggers/">Learn more about Atlas Triggers</DocLink>.
        </div>
      </div>

      {/* Business highlights */}
      <div style={callout("#fffde7", "#f57c00")}>
        <h4 style={{ marginBottom: 8 }}>Business Logic Highlights</h4>
        <ul style={{ paddingLeft: "1.2em", marginBottom: 0 }}>
          <li>Coins are earned on the cash portion of the order, and a higher tier makes each coin worth more</li>
          <li>Tier is driven by cumulative spend and updates automatically with each order</li>
          <li>Hybrid payment: coins, card, or both in a single order</li>
          <li>A declined payment is recorded and awards no coins</li>
          <li>The checkout preview and the final order use the same calculation, so there are no surprises</li>
        </ul>
      </div>
    </div>
  );
};

export default BehindTheScenes;
