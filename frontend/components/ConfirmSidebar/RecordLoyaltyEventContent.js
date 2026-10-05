"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectLastOrder, selectSelectedUser } from "@/redux/slices/GlobalSlice";
import { fetchOrderLoyaltyHistory } from "@/lib/api";
import { docToJSON } from "@/lib/helper";
import modalStyles from "@/components/modals/Modal.module.css";
import SyncModal from "../modals/SyncModal/SyncModal";

const RecordLoyaltyEventContent = () => {
  const lastOrder = useSelector(selectLastOrder);
  const persona = useSelector(selectSelectedUser);
  const orderId = lastOrder?.order?.orderId;
  const customerId = persona?.customerId;
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setEntries([]);
    setError(null);

    if (!orderId || !customerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchOrderLoyaltyHistory({ orderId, customerId })
      .then((data) => {
        if (!cancelled) setEntries(data);
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
          Loyalty history records the coins earned, coins spent, and tier
          changes associated with the order. These entries are saved in the
          same MongoDB transaction as the customer's loyalty update.
        </p>
      ),
    },
    {
      key: "doc",
      label: "Loyalty History Document(s)",
      render: () => {
        if (!orderId || !customerId) return <p>No order is available.</p>;
        if (loading) return <p role="status">Loading loyalty history...</p>;
        if (error) return <p role="alert">Couldn't load loyalty history: {error}</p>;
        if (!entries.length) return <p>No loyalty history entries were found for this order.</p>;
        return <pre className={modalStyles.docJson}>{docToJSON(entries)}</pre>;
      },
    },
  ];

  return <SyncModal title="Save the loyalty history" tabs={tabs} />;
};

export default RecordLoyaltyEventContent;