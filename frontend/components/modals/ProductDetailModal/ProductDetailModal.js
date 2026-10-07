"use client";

import { useState } from "react";
import { Button } from "@via-ds/components/button";
import { CodeBlock, CodeSnippet } from "@via-ds/components/code-block";
import { Text } from "@via-ds/components/typography";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { CAT_COLOR } from "@/lib/data";
import {
  docToJSON,
  formatPrice,
  productDocFor,
  seededStock,
} from "@/lib/helper";
import styles from "./ProductDetailModal.module.css";
import modal from "../Modal.module.css";
import {
  selectSelectedUser,
  selectProductsData,
  addToCart,
} from "@/redux/slices/GlobalSlice";

export default function ProductDetailModal({ id, onClose }) {
  const dispatch = useDispatch();
  const products = useSelector(selectProductsData);
  const persona = useSelector(selectSelectedUser);
  const [showProductDoc, setShowProductDoc] = useState(false);
  const [showInvDoc, setShowInvDoc] = useState(false);

  const pr = products.find((x) => x.id === id);
  const catBg = (CAT_COLOR[pr.category] || { bg: "#EEE" }).bg;
  const city = (persona.addresses?.[0]?.city ?? "").split(",")[0];
  const stores = [
    `${city} Downtown`,
    `${city} Westside`,
    `${city} Distribution Center`,
  ].map((s) => ({
    name: s,
    stock: seededStock(pr.id + s),
  }));

  const productDoc = productDocFor(pr);
  
  return (
    <>
      <div className={modal.head}>
        <Text>Product details</Text>
        <Button className={modal.close} onClick={onClose}>
          ✕
        </Button>
      </div>
      <div className={modal.body}>
        <div className={styles.grid}>
          <div>
            <div className={styles.hero}>
              <div className={styles.art} style={{ background: catBg }}>
                <Image
                  src={pr.imageURL}
                  alt={pr.name}
                  fill
                  style={{ objectFit: "cover" }}
                  className={styles.pThumbImg}
                />
              </div>
              <div className={styles.copy}>
                <div
                  style={{
                    fontSize: 11.9,
                    fontWeight: 700,
                    color: "var(--text-faint)",
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                  }}
                >
                  {pr.category}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--forest)",
                    margin: "4px 0 0",
                  }}
                >
                  {pr.name}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "var(--forest)",
                    marginTop: 6,
                  }}
                >
                  {formatPrice(pr.price)}
                </div>
                <div className={styles.detailScoreRow}>
                  <span className={styles.detailScoreMeta}>
                    ★ {pr.rating.toFixed(1)} rating ·{" "}
                    {pr.reviews.toLocaleString()} reviews · Loyalty redemption
                    available at checkout
                  </span>
                </div>
              </div>
            </div>
            <p>
              A popular pick in {pr.category.toLowerCase()} — {pr.name} is
              well-reviewed and pairs naturally with the other items in this
              category.
            </p>
            <div className={styles.toggleSection}>
              <Button
                className={`${styles.toggleHeader}${showProductDoc ? ` ${styles.toggleHeaderOpen}` : ""}`}
                onClick={() => setShowProductDoc((v) => !v)}
              >
                {"{ } Product document"} <span className={styles.chev}>⌄</span>
              </Button>
              {showProductDoc && (
                <CodeBlock language="json">
                  <CodeSnippet>{docToJSON(productDoc)}</CodeSnippet>
                </CodeBlock>
              )}
            </div>
          </div>
          <div className={styles.side}>
            <h3>📍 Availability near {city}</h3>
            <div className={styles.invList}>
              {stores.map((s) => (
                <div className={styles.invRow} key={s.name}>
                  <span>{s.name}</span>
                  <span
                    className={s.stock > 0 ? styles.inStock : styles.outStock}
                  >
                    {s.stock > 0 ? `${s.stock} in stock` : "Out of stock"}
                  </span>
                </div>
              ))}
            </div>
            <p>
              Eligible members can redeem rewards at checkout and still keep
              their tier progress moving based on merchandise spend.
            </p>
            <Button
              variant="primary"
              style={{ width: "100%", marginTop: 18 }}
              onClick={() => {
                dispatch(addToCart(pr.productId));
                onClose();
              }}
            >
              + Add to cart
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
