"use client";

import { useState } from "react";
import { Button, Variant } from "@via-ds/components/button";
import { Text } from "@via-ds/components/typography";
import { useDispatch, useSelector } from "react-redux";
import { CAT_COLOR } from "@/lib/data";
import { docToJSON, fmt, productDocFor, seededStock } from "@/lib/helpers";
import styles from "./ProductDetailModal.module.css";
import modal from "../Modal.module.css";
import {
  selectSelectedUser,
  selectProducts,
  addToCart,
} from "@/redux/globalSlice";

export default function ProductDetailModal({ id, onClose }) {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const persona = useSelector(selectSelectedUser);
  const [showProductDoc, setShowProductDoc] = useState(false);
  const [showInvDoc, setShowInvDoc] = useState(false);

  const pr = products.find((x) => x.id === id);
  const catBg = (CAT_COLOR[pr.cat] || { bg: "#EEE" }).bg;
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
  const inventoryDocs = stores.map((s, i) => ({
    _id: `ObjectId("710c${pr.id}${i}0000001")`,
    product_id: `ObjectId("64f1a2${pr.id}0000000001")`,
    store: s.name,
    quantity: s.stock,
  }));

  return (
    <>
      <div className={modal.head}>
        <Text>Product details</Text>
        <button className={modal.close} onClick={onClose}>
          ✕
        </button>
      </div>
      <div className={modal.body}>
        <div className={styles.grid}>
          <div>
            <div className={styles.hero}>
              <div className={styles.art} style={{ background: catBg }}>
                {pr.icon}
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
                  {pr.cat}
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
                  {fmt(pr.price)}
                  {pr.was && (
                    <span
                      style={{
                        textDecoration: "line-through",
                        color: "var(--text-faint)",
                        fontWeight: 500,
                        fontSize: 14,
                        marginLeft: 6,
                      }}
                    >
                      {fmt(pr.was)}
                    </span>
                  )}
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
              A popular pick in {pr.cat.toLowerCase()} — {pr.name} is
              well-reviewed and pairs naturally with the other items in this
              category.
            </p>
            <div className={styles.toggleSection}>
              <button
                className={`${styles.toggleHeader}${showProductDoc ? ` ${styles.toggleHeaderOpen}` : ""}`}
                onClick={() => setShowProductDoc((v) => !v)}
              >
                {"{ } Product document"} <span className={styles.chev}>⌄</span>
              </button>
              {showProductDoc && (
                <pre className={modal.docJson}>{docToJSON(productDoc)}</pre>
              )}
            </div>
            <div className={styles.toggleSection}>
              <button
                className={`${styles.toggleHeader}${showInvDoc ? ` ${styles.toggleHeaderOpen}` : ""}`}
                onClick={() => setShowInvDoc((v) => !v)}
              >
                {"{ } Inventory documents"}{" "}
                <span className={styles.chev}>⌄</span>
              </button>
              {showInvDoc && (
                <pre className={modal.docJson}>{docToJSON(inventoryDocs)}</pre>
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
              variant={Variant.BaseGreen}
              style={{ width: "100%", marginTop: 18 }}
              onClick={() => {
                dispatch(addToCart(pr.id));
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
