"use client";

import { useEffect, useState } from "react";
import { Callout } from "@via-ds/components/callout";
import { useSelector } from "react-redux";
import { selectSelectedUser } from "@/redux/slices/GlobalSlice";
import { fetchCustomer } from "@/lib/api";
import { docToJSON } from "@/lib/helper";
import modalStyles from "./EventContent.module.css";
import SyncModal from "../modals/SyncModal/SyncModal";

const UpdateCustomerLoyaltyEventContent = () => {
  const persona = useSelector(selectSelectedUser);
  const customerId = persona?.customerId;
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setCustomer(null);
    setError(null);

    if (!customerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchCustomer(customerId)
      .then((data) => {
        if (!cancelled) setCustomer(data);
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
  }, [customerId]);

  const tabs = [
    {
      key: "doc",
      label: "Profile & Ledger",
      render: () => (
        <div className={modalStyles.content}>
          <section>
            <h3>Customer Profile is the Current State</h3>
            <Callout className={modalStyles.callout} variant="note">
              <p>
                The customer's balance, cumulative spend, and tier are updated
                in the same transaction as the history entry.
              </p>
            </Callout>
          </section>
          <section>
            <h4>The profile answers current-state questions</h4>
            <ul className={modalStyles.fields}>
              <li>How many coins does this customer have?</li>
              <li>What is their current tier?</li>
              <li>What benefits should they receive?</li>
            </ul>
          </section>
          <section>
            <h4>The ledger answers a different question</h4>
            <p className={modalStyles.question}>
              <strong>How did the customer get here?</strong>
            </p>
            <p>
              Keeping these responsibilities separate prevents the customer
              document from becoming an ever-growing history log. The profile
              maintains the current balance and tier, while the ledger grows
              as new loyalty events occur.
            </p>
            <p>
              This separation works naturally with MongoDB's document model:
              keep frequently accessed current state in the customer document
              while maintaining the growing event history in its own collection.
            </p>
          </section>
          <Callout className={modalStyles.callout} variant="important">
            <p><strong>Current loyalty &rarr; Customer profile</strong></p>
            <p><strong>Historical loyalty events &rarr; Loyalty ledger</strong></p>
          </Callout>
        </div>
      ),
    },
    {
      key: "loyalty-model",
      label: "Document Model",
      render: () => (
        <div className={modalStyles.content}>
          <section>
            <h3>Store Frequently Accessed Loyalty Data with the Customer</h3>
            <p>
              When an application needs to display a customer's profile, it
              will often need their loyalty information at the same time. With
              MongoDB's document model, <strong>data accessed together can be
              modeled together.</strong>
            </p>
            <p>
              Instead of reconstructing the customer's current loyalty state
              from multiple sources, the customer document can contain the
              current loyalty information directly:
            </p>
          </section>
          <section>
            <div className={modalStyles.documentHead}>
              <h4>Embedded loyalty details</h4>
              <span className={modalStyles.badge}>Customer document</span>
            </div>
            {!customerId ? (
              <p>No customer is selected.</p>
            ) : loading ? (
              <p role="status">Loading customer document...</p>
            ) : error ? (
              <p role="alert">Couldn't load customer: {error}</p>
              ) : !customer ? (
                <p>No customer document was returned.</p>
            ) : (
              <pre className={modalStyles.json}>
                  <code>{docToJSON(customer)}</code>
              </pre>
            )}
          </section>
          <Callout className={modalStyles.callout} variant="important">
            <p>
              <code>latestLoyaltyHistory</code> is not the complete history. It
              is a small embedded view of the <strong>latest three loyalty
              events</strong>, while the full history remains in the
              <code>loyaltyHistory</code> collection.
            </p>
            <p>
              This gives applications fast access to commonly needed
              information without loading the entire loyalty ledger.
            </p>
          </Callout>
        </div>
      ),
    },
    {
      key: "consistency",
      label: "Consistency",
      render: () => (
        <div className={modalStyles.content}>
          <section>
            <h3>Keep the Customer and Ledger Consistent</h3>
            <p>
              The customer's balance, cumulative spend, tier, and recent loyalty
              history are updated as part of the same MongoDB transaction that
              records the loyalty event.
            </p>
            <p>For example, when an order earns coins:</p>
          </section>
          <figure className={modalStyles.loyaltyTransaction}>
            <figcaption>MongoDB ACID Transaction</figcaption>
            <div className={modalStyles.loyaltyTransactionGrid}>
              <section className={modalStyles.loyaltyTransactionPanel}>
                <h4>Loyalty Ledger</h4>
                <ul><li>Add &ldquo;earn&rdquo; event</li></ul>
                <ul><li>Add &ldquo;redeem&rdquo; event</li></ul>
                <ul><li>Add &ldquo;tier-change&rdquo; event</li></ul>
              </section>
              <section className={modalStyles.loyaltyTransactionPanel}>
                <h4>Customer Profile</h4>
                <ul>
                  <li>Update balance</li>
                  <li>Update spend</li>
                  <li>Update tier</li>
                  <li>Update recent history</li>
                </ul>
              </section>
            </div>
            <div className={modalStyles.loyaltyCommit}>COMMIT</div>
          </figure>
          <section>
            <h4>One transaction. One consistent loyalty state.</h4>
            <p>
              If the transaction fails, the loyalty event and customer update
              are not partially committed.
            </p>
            <p>
              This is particularly important for loyalty because a mismatch can
              have direct customer and financial impact. A customer should not
              see a balance that does not correspond to the transaction history
              behind it.
            </p>
          </section>
          <Callout className={modalStyles.callout} variant="important">
            <p><strong>One transaction. One consistent loyalty state.</strong></p>
            <p>The ledger entry and current profile state commit together or neither change is applied.</p>
          </Callout>
        </div>
      ),
    },
  ];

  return <SyncModal title="Update the customer's loyalty" tabs={tabs} />;
};

export default UpdateCustomerLoyaltyEventContent;