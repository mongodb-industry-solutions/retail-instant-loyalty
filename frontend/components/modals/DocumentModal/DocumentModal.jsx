"use client";

import { Text } from "@via-ds/components/typography";
import { useSelector } from "react-redux";
import { docToJSON, productDocFor, userLoyaltyDocFor } from "@/lib/helpers";
import modal from "../Modal.module.css";
import {
  selectSelectedUser,
  selectProducts,
  selectLoyaltyConfig,
} from "@/redux/globalSlice";

export default function DocumentModal({ onClose, variant, id }) {
  const { rewardDetails } = useSelector(selectLoyaltyConfig);
  const products = useSelector(selectProducts);
  const persona = useSelector(selectSelectedUser);

  let title, intro, doc;
  if (variant === "userDoc") {
    title = "User Schema";
    intro =
      "User data and loyalty data live together in one flexible MongoDB document, which shows the power of the flexible document model without forcing a separate loyalty table or join.";
    doc = userLoyaltyDocFor(persona, rewardDetails);
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
      </div>
    </>
  );
}
