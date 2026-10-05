'use client'
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectLastOrder, selectSelectedUser } from "@/redux/slices/GlobalSlice";
import { fetchOrder } from "@/lib/api";
import { docToJSON } from "@/lib/helper";
import styles from "./EventContent.module.css";
import SyncModal from "../modals/SyncModal/SyncModal";

const RecordOrderEventContent = () => {
  const lastOrder = useSelector(selectLastOrder);
  const persona = useSelector(selectSelectedUser);
  const orderId = lastOrder?.order?.orderId ;
  const customerId = persona?.customerId ;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setOrder(null);
    setError(null);

    if (!orderId || !customerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchOrder({ orderId, customerId, addTenders: false })
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId, customerId]);

  const tabs = [
    {
      key: "doc",
      label: "The order is more than a transaction—it is a record of the decision",
      render: () => (
        <div className={styles.content}>
          <section>
            <h3>The order is more than a transaction—it is a record of the decision</h3>
            <p>The loyalty calculation is based on rules that can change.</p>
            <p>
              A customer may be Gold today, with one redemption rate and an
              active promotional multiplier. Six months later, the retailer
              may change the Gold tier threshold, modify the redemption value,
              or retire the promotion entirely.
            </p>
            <p>
              This is where capturing the loyalty context at the time of the
              transaction becomes valuable.
            </p>
            <p>
              The order can preserve the relevant loyalty information used to
              calculate the purchase:
            </p>
            <ul className={styles.fields}>
              <li><code>coinsApplied</code> Coins used for this purchase</li>
              <li><code>coinsToDollarsApplied</code> Their applied currency value</li>
              <li><code>coinsEarned</code> Coins awarded for this purchase</li>
            </ul>
          </section>
          <section>
            <h4>Recoverable business record.</h4>
            <p>
              The order can be persisted in MongoDB immediately, beginning with
              an <code className={styles.status}>authorizing</code> state.
            </p>
            <aside className={styles.callout}>
              <strong>Durable from the start</strong>
              <p>
                This turns an in-progress transaction into a durable,
                recoverable business record.
              </p>
            </aside>
          </section>
        </div>
      ),
    }, 
    {
      key: "model",
      label: "Document Model",
      render: () => {
        return (
          <div className={styles.content}>
            <section>
              <h3>Business rules at the time of purchase</h3>
              <p>
                Current configuration describes today's business rules. The
                order needs to preserve the rules that applied to yesterday's
                transaction.
              </p>
            </section>
            <section>
              <div className={styles.documentHead}>
                <h4>Order document</h4>
                <span className={styles.badge}>Stored order</span>
              </div>
              {!orderId || !customerId ? (
                <p>No order is available.</p>
              ) : loading ? (
                <p role="status">Loading order document...</p>
              ) : error ? (
                <p role="alert">Couldn't load order: {error}</p>
              ) : !order ? (
                <p>No order document was returned.</p>
              ) : (
                <pre className={styles.json}><code>{docToJSON(order)}</code></pre>
              )}
            </section>
            <aside className={styles.callout}>
              <strong>Applied to this order, not today's configuration</strong>
              <p>
                The loyalty information inside the order represents what was
                applied to that order—not a live reference to today's loyalty
                configuration.
              </p>
              <p>
                This document stores the applied coin amounts and currency
                value. A full historical rules snapshot would additionally
                need the tier and campaign rules used for the calculation.
              </p>
            </aside>
          </div>
        );
      },
    }];

  return <SyncModal title="Record the order in MongoDB" tabs={tabs} />;
};

export default RecordOrderEventContent;
