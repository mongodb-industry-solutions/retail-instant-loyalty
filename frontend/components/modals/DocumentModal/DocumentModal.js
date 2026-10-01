"use client";

import { Text } from "@via-ds/components/typography";
import { useSelector } from "react-redux";
import { docToJSON, productDocFor, userLoyaltyDocFor } from "@/lib/helper";
import modal from "../Modal.module.css";
import {
  selectSelectedUser,
  selectProductsData,
  selectLoyaltyConfig,
} from "@/redux/slices/GlobalSlice";

// What each field in a redemption candidate means. The candidate payload is
// the /redeem/candidates projection, so most of it is computed server-side by
// the aggregation rather than stored on the product.
const REDEEM_FIELD_NOTES = [
  ["isRedeemElegible", "The catalog flag the redeem aggregation matches on — without it a product never becomes a candidate."],
  ["price", "Stored list price, converted from Decimal128 so the pipeline can do arithmetic on it."],
  ["coins", "Coins needed to cover this product at the customer's tier rate, capped at their balance."],
  ["cash", "Whatever the coins can't cover — $0 means a coins-only redemption, anything above it is a hybrid."],
];

export default function DocumentModal({ onClose, variant, id, product }) {
  const { rewardDetails } = useSelector(selectLoyaltyConfig);
  const products = useSelector(selectProductsData);
  const persona = useSelector(selectSelectedUser);

  let title, intro, doc, fieldNotes;
  if (variant === "userDoc") {
    title = "User Schema";
    intro =
      "User data and loyalty data live together in one flexible MongoDB document, which shows the power of the flexible document model without forcing a separate loyalty table or join.";
    doc = persona;
  } else if (variant === "redeemDoc") {
    title = "Redemption candidate";
    intro =
      "One document as returned by the redeem aggregation. The catalog stores the product and its eligibility flag; the coin and cash split is computed in the pipeline against this customer's tier and balance.";
    doc = product;
    fieldNotes = REDEEM_FIELD_NOTES;
  } else {
    const pr = products.find((x) => x.id === id);
    title = "Document view";
    intro =
      "How this product is stored as a document in the product catalog collection.";
    doc = productDocFor(pr);
  }

  return (
    <>
      <div className={modal.head}>
        <Text as="h2">{"{ } " + title}</Text>
        <button className={modal.close} onClick={onClose}>
          ✕
        </button>
      </div>
      <div className={modal.body}>
        <p style={{ marginBottom: 12 }}>{intro}</p>
        <pre className={modal.docJson}>{docToJSON(doc)}</pre>
        {fieldNotes && (
          <ul style={{ marginTop: 14 }}>
            {fieldNotes.map(([field, note]) => (
              <li key={field}>
                <b>{field}</b> — {note}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
