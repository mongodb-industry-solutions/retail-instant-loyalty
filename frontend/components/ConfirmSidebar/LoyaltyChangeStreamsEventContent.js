"use client";

import { docToJSON } from "@/lib/helper";
import modalStyles from "./EventContent.module.css";
import SyncModal from "../modals/SyncModal/SyncModal";

const CHANGE_STREAM_CODE = `const pipeline = [
  { $match: { "updateDescription.updatedFields.loyalty": { $exists: true } } }
];
const changeStream = db.collection("customers")
  .watch(pipeline, { fullDocument: "updateLookup" });

changeStream.on("change", (event) => {
  const { coins, tier } = event.fullDocument.loyalty;
  posGateway.push(event.documentKey._id, { coins, tier });
  mobilePush.notify(event.documentKey._id, { coins, tier });
});`;

const CHANNELS = [
  { icon: "🖥️", name: "Online store", note: "Read at write time · 0ms" },
  { icon: "🧾", name: "In-store POS", note: "Change stream push · +41ms" },
  { icon: "📱", name: "Mobile app", note: "Change stream push · +58ms" },
];

const SYNC_STEP_TABS = [
  {
    key: "doc",
    label: "Customer document",
    render: (ctx) => (
      <>
        <span className={modalStyles.comingSoon}>Coming soon</span>
        <p>
          There&apos;s one customer document — not one per channel. Online, POS,
          and mobile all read and write the same <code>loyalty</code> field, so
          there&apos;s nothing separate to keep in sync in the first place.
        </p>
        <pre>{docToJSON(ctx.doc)}</pre>
      </>
    ),
  },
  {
    key: "stream",
    label: "Change stream",
    render: (ctx) => (
      <>
        <p>
          A change stream watches the <code>customers</code> collection for
          writes to <code>loyalty</code> and pushes the update out the moment it
          commits — no polling from POS or mobile required.
        </p>
        <pre className="">{CHANGE_STREAM_CODE}</pre>
        <p style={{ marginTop: 14 }}>Event emitted for this order:</p>
        <pre className="">
          {docToJSON({
            operationType: "update",
            documentKey: { _id: ctx.doc._id },
            updatedFields: { "loyalty.coins": ctx.doc.loyalty.coins },
          })}
        </pre>
      </>
    ),
  },
  {
    key: "channels",
    label: "Channel views",
    render: (ctx) => (
      <>
        <p>
          Same balance, three surfaces — each timestamped as it receives the
          change stream push.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
            margin: "16px 0 4px",
          }}
        >
          {CHANNELS.map((channel) => (
            <div
              key={channel.name}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 14,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  marginBottom: 8,
                }}
              >
                {channel.icon} {channel.name}
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "var(--green-dark)",
                }}
              >
                {ctx.doc.loyalty.coins.toLocaleString()} coins
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--text-faint)",
                  marginTop: 6,
                }}
              >
                {channel.note}
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  },
];

const LoyaltyChangeStreamsEventContent = () => {
  return <SyncModal title="Refresh the customer profile across channels" tabs={SYNC_STEP_TABS} />;
};

export default LoyaltyChangeStreamsEventContent;