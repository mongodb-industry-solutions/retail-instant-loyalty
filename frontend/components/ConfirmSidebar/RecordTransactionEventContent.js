"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectLastOrder, selectSelectedUser } from "@/redux/slices/GlobalSlice";
import { fetchOrderTransaction } from "@/lib/api";
import { docToJSON } from "@/lib/helper";
import modalStyles from "@/components/modals/Modal.module.css";
import SyncModal from "../modals/SyncModal/SyncModal";

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
      key: "overview",
      label: "Overview",
      render: () => (
        <p>
          <span className={modalStyles.comingSoon}>Coming soon</span>
          The transaction records the payment outcome and tenders associated
          with the order. Loyalty rewards are granted only after a successful
          payment.
        </p>
      ),
    },
    {
      key: "doc",
      label: "Transaction Document",
      render: () => {
        if (!orderId || !customerId) return <p>No order is available.</p>;
        if (loading) return <p role="status">Loading transaction document...</p>;
        if (error) return <p role="alert">Couldn't load transaction: {error}</p>;
        if (!transaction) return <p>No transaction document was returned.</p>;
        return <pre className={modalStyles.docJson}>{docToJSON(transaction)}</pre>;
      },
    },
  ];

  return <SyncModal title="Record the payment in MongoDB" tabs={tabs} />;
};

export default RecordTransactionEventContent;