"use client";

import { useEffect, useState } from "react";
import { Banner } from "@via-ds/components/banner";
import { CodeBlock, CodeSnippet } from "@via-ds/components/code-block";
import { Text } from "@via-ds/components/typography";
import { useSelector } from "react-redux";
import { selectLastOrder, selectSelectedUser } from "@/redux/slices/GlobalSlice";
import { fetchOrderTransaction } from "@/lib/api";
import { docToJSON } from "@/lib/helper";
import modalStyles from "./EventContent.module.css";
import SyncModal from "../modals/SyncModal/SyncModal";

const TRANSACTION_EXAMPLE = {
  transactionId: "TXN-90134",
  orderId: "MS-100134",
  customerId: "CUST-10006",
  status: "completed",
  tenders: [
    {
      method: "card",
      amount: 33.21,
      paymentDetails: {
        cardType: "visa",
        last4: "0753",
        expiry: "04/39",
      },
    },
  ],
  createdAt: "2026-09-30T18:31:22.700Z",
};

const RecordTransactionEventContent = () => {
  const lastOrder = useSelector(selectLastOrder);
  const persona = useSelector(selectSelectedUser);
  const orderId = lastOrder?.order?.orderId;
  const customerId = persona?.customerId;
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setTransaction(null);
    setError(null);

    if (!orderId || !customerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchOrderTransaction({ orderId, customerId })
      .then((data) => {
        if (!cancelled) setTransaction(data);
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
      label: "The enduring record of the transaction",
      render: () => (
        <div className={modalStyles.content}>
          <section>
            <p className={modalStyles.subtitle}>Turning Payments into a Durable Transaction Record</p>
            <h3>The order is more than a transaction—it is a record of the decision</h3>
            <p>
              An order may have been created, loyalty re-calculated, and a
              customer may have selected how they want to pay. But until the
              payment outcome is known, the transaction is not complete.
            </p>
            <p>That makes the payment attempt itself valuable business data.</p>
            <p>
              In a modern retail architecture, every payment attempt—successful
              or failed—can be persisted as a transaction record in MongoDB.
            </p>
          </section>
          <Banner className={modalStyles.banner} variant="info">
            <div>
              <Text as="strong">A durable history and a decision point</Text>
              <p>
                This creates a <strong>durable history of what happened and
                provides the event that determines what happens next.</strong>
              </p>
            </div>
          </Banner>
          <section>
            <h4>Every payment attempt matters</h4>
            <p>
              In this demonstration, the payment gateway is simulated rather
              than connected to a live payment provider. An expired card can
              be used to simulate a failed payment.
            </p>
            <p>
              Whether the payment succeeds or fails, MongoDB records the
              transaction as a durable transaction document.
            </p>
            <div className={modalStyles.exampleHead}>
              <h4>A successful payment</h4>
              <span className={modalStyles.badge}>Illustrative JSON</span>
            </div>
            <CodeBlock language="json">
              <CodeSnippet>{docToJSON(TRANSACTION_EXAMPLE)}</CodeSnippet>
            </CodeBlock>
          </section>
          <section>
            <h4>Different outcomes, one business concept</h4>
            <p>
              A failed transaction can be just as important as a successful
              one. It can be recorded in the same collection with
              {" "}<code className={modalStyles.status}>"status": "failed"</code>
              {" "}and include failure-specific details, such as retry attempts
              or failure reasons.
            </p>
            <p>
              MongoDB's <strong>polymorphic document model</strong> allows
              transaction documents with different fields and structures to
              coexist in the same collection while representing the same
              business concept.
            </p>
          </section>
        </div>
      ),
    },
    {
      key: "model",
      label: "Document Model",
      render: () => {
        return (
          <div className={modalStyles.content}>
            <section>
              <h3>The payment event as a business object</h3>
              <p>
                The transaction document connects the key identifiers needed
                to understand what happened. The transaction document for this
                order is below:
              </p>
            </section>
            <section>
              <div className={modalStyles.documentHead}>
                <h4>Transaction document</h4>
                <span className={modalStyles.badge}>Stored transaction</span>
              </div>
              {!orderId || !customerId ? (
                <p>No order is available.</p>
              ) : loading ? (
                <p role="status">Loading transaction document...</p>
              ) : error ? (
                <p role="alert">Couldn't load transaction: {error}</p>
              ) : !transaction ? (
                <p>No transaction document was returned.</p>
              ) : (
                <CodeBlock language="json">
                  <CodeSnippet>{docToJSON(transaction)}</CodeSnippet>
                </CodeBlock>
              )}
            </section>
            <Banner className={modalStyles.banner} variant="info">
              <div>
                <Text as="strong">A coherent business object</Text>
                <p>
                  Rather than reconstructing the payment from multiple related
                  records, the transaction document represents the payment event
                  as a coherent business object.
                </p>
              </div>
            </Banner>
          </div>
        );
      },
    },
    {
      key: "loyalty",
      label: "Payment becomes the decision point for loyalty",
      render: () => (
        <div className={modalStyles.content}>
          <section>
            <h3>Payment becomes the decision point for loyalty</h3>
            <p>Payment also plays an important role in the loyalty workflow.</p>
            <p>
              Consider a customer who has earned coins from an order or chosen
              to redeem coins toward the purchase.
            </p>
            <p>
              The retailer should not finalize those loyalty changes simply
              because the customer created an order.
            </p>
            <p><strong>The payment outcome determines whether the transaction should proceed.</strong></p>
          </section>
          <figure className={modalStyles.paymentFlow}>
            <figcaption>From order creation to loyalty finalization</figcaption>
            <div className={modalStyles.flowStage}>Order Created</div>
            <div className={modalStyles.flowArrow} aria-hidden="true">↓</div>
            <div className={modalStyles.flowStage}>Payment Attempt</div>
            <div className={modalStyles.flowBranches}>
              <div className={modalStyles.flowBranch}>
                <span className={modalStyles.flowBranchConnector} aria-hidden="true" />
                <strong className={modalStyles.flowSuccess}>Success</strong>
                <span className={modalStyles.flowArrow} aria-hidden="true">↓</span>
                <span>Loyalty finalized</span>
              </div>
              <div className={modalStyles.flowBranch}>
                <span className={modalStyles.flowBranchConnector} aria-hidden="true" />
                <strong className={modalStyles.flowFailed}>Failed</strong>
                <span className={modalStyles.flowArrow} aria-hidden="true">↓</span>
                <span>No loyalty award/redemption</span>
              </div>
            </div>
          </figure>
          <section>
            <h4>When payment succeeds</h4>
            <p>The system can proceed with the appropriate loyalty action:</p>
            <ul className={modalStyles.fields}>
              <li>Award coins earned from the purchase</li>
              <li>Redeem coins used toward the order</li>
              <li>Update the customer's loyalty balance</li>
              <li>Evaluate any resulting tier change</li>
            </ul>
          </section>
          <Banner className={modalStyles.banner} variant="warning">
            <div>
              <Text as="strong">When payment fails, loyalty is not finalized</Text>
              <p>
                Those loyalty changes should not be finalized as if the purchase
                had completed.
              </p>
            </div>
          </Banner>
          <div className={modalStyles.takeaway}>
            <p>
              The transaction document therefore becomes <strong>more than a
              payment record.</strong>
            </p>
          </div>
        </div>
      ),
    },
  ];

  return <SyncModal title="Record the payment in MongoDB" tabs={tabs} />;
};

export default RecordTransactionEventContent;