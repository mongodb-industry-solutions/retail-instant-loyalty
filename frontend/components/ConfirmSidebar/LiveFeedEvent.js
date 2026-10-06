import React from 'react'
import RecordOrderEventContent from "./RecordOrderEventContent"
import RecordTransactionEventContent from "./RecordTransactionEventContent"
import LoyaltyChangeStreamsEventContent from "./LoyaltyChangeStreamsEventContent"
import UpdateCustomerLoyaltyEventContent from "./UpdateCustomerLoyaltyEventContent"
import styles from "@/components/ConfirmSidebar/ConfirmSidebar.module.css";
import CalculateLoyaltyEventContent from "./CalculateLoyaltyEventContent";
import RecordLoyaltyEventContent from "./RecordLoyaltyEventContent";

export function behindTheScenesEvents() {
  return [
    {
      icon: "Favorite",
      title: "Calculate loyalty impact",
      body: (
        <div className={styles.liveFeedBody}>
          The system checks the customer’s current balance and tier, applies the
          active promotion multipmlier, converts coins to dollars using the
          tier’s rate, and calculates coins earned and any resulting tier
          change.
        </div>
      ),
      modalContent: (
        <CalculateLoyaltyEventContent />
      ),
    },
    {
      icon: "Database",
      title: "Record the order in MongoDB",
      body: (
        <div className={styles.liveFeedBody}>
          The order is saved immediately with an{" "}
          <code style={{ color: "deeppink" }}>authorizing</code> status. This creates a real, recoverable state that
          support can access and troubleshoot later.
        </div>
      ),
      modalContent: (
        <RecordOrderEventContent />
      ),
    },
    {
      icon: "Database",
      title: "Record the payment in MongoDB",
      body: (
        <div className={styles.liveFeedBody}>
          The payment is saved as its own record. Only after the
          payment is confirmed successfully rewards are granted.
        </div>
      ),
      modalContent: (
        <RecordTransactionEventContent />
      ),
    },
    {
      icon: "ClockWithArrow",
      title: "Save the loyalty history",
      body: (
        <div className={styles.liveFeedBody}>
          Each loyalty event from this order (coins earned, coins spent, tier
          change) is written to the customer's ledger. Retail uses it for the
          "my coins" history, support disputes, and audit.
        </div>
      ),
      modalContent: (
        <RecordLoyaltyEventContent/>
      ),
      extraElement: (
        <span className={styles.transactionPill}>
          MongoDB transaction · 1 of 2
        </span>
      ),
    },
    {
      icon: "Person",
      title: "Update the customer's loyalty",
      body: (
        <div className={styles.liveFeedBody}>
          The customer’s loyalty details are updated in their profile, and the
          new balance is immediately available for use. Keeping loyalty details
          in the customer profile provides a single source of truth for their
          current balance and tier.
        </div>
      ),
      modalContent: (
        <UpdateCustomerLoyaltyEventContent/>
      ),
      extraElement: (
        <span className={styles.transactionPill}>
          MongoDB transaction · 2 of 2
        </span>
      ),
    },
    {
      icon: "Refresh",
      title: "Refresh the customer profile across channels",
      body: (
        <div className={styles.liveFeedBody}>
          Applications across channels receive loyalty change events from
          MongoDB. Change Streams enable near-real-time updates without polling,
          batch processes, or a separate message broker.
        </div>
      ),
      modalContent: (
        <LoyaltyChangeStreamsEventContent />
      ),
    },
  ];
}




