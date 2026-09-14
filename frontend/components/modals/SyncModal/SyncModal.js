"use client";

import { useState } from "react";
import { Text } from "@via-ds/components/typography";
import { useSelector } from "react-redux";
import { docToJSON, loyaltySyncDocFor } from "@/lib/helper";
import modal from "../Modal.module.css";
import {
  selectSelectedUser,
  selectLoyaltyConfig,
} from "@/redux/slices/GlobalSlice";

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

const TABS = [
  {
    key: "doc",
    label: "Customer document",
    render: (ctx) => (
      <>
        <p>
          There&apos;s one customer document — not one per channel. Online, POS,
          and mobile all read and write the same <code>loyalty</code> field, so
          there&apos;s nothing separate to keep in sync in the first place.
        </p>
        <pre className={modal.docJson}>{docToJSON(ctx.doc)}</pre>
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
        <pre className={modal.docJson}>{CHANGE_STREAM_CODE}</pre>
        <p style={{ marginTop: 14 }}>Event emitted for this order:</p>
        <pre className={modal.docJson}>
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
          {CHANNELS.map((c) => (
            <div
              key={c.name}
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
                {c.icon} {c.name}
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
                {c.note}
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  },
];

export default function SyncModal({ onClose }) {
  const [active, setActive] = useState("doc");
  const { rewardDetails } = useSelector(selectLoyaltyConfig);
  const persona = useSelector(selectSelectedUser);
  const doc = loyaltySyncDocFor(persona, rewardDetails);
  const tab = TABS.find((t) => t.key === active) || TABS[0];

  return (
    <>
      <div className={modal.head}>
        <Text as="h2">📡 How the sync works</Text>
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
      <div className={modal.body}>{tab.render({ doc })}</div>
    </>
  );
}
