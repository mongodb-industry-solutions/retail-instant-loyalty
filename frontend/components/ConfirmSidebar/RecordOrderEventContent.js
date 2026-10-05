'use client'
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectLastOrder, selectSelectedUser } from "@/redux/slices/GlobalSlice";
import { fetchOrder } from "@/lib/api";
import { docToJSON } from "@/lib/helper";
import modalStyles from "@/components/modals/Modal.module.css";
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
      key: "doc1",
      label: "Calculate",
      render: (ctx) => (
        <div>tab 1</div>
      ),
    }, 
    {
      key: "doc",
      label: "Order Document",
      render: () => {
        if (!orderId || !customerId) return <p>No order is available.</p>;
        if (loading) return <p role="status">Loading order document...</p>;
        if (error) return <p role="alert">Couldn't load order: {error}</p>;
        if (!order) return <p>No order document was returned.</p>;
        return <pre className={modalStyles.docJson}>{docToJSON(order)}</pre>;
      },
    }];

  return <SyncModal title="Loyalty" tabs={tabs} />;
};

export default RecordOrderEventContent;
