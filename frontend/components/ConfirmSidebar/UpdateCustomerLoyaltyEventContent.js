"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectSelectedUser } from "@/redux/slices/GlobalSlice";
import { fetchCustomer } from "@/lib/api";
import { docToJSON } from "@/lib/helper";
import modalStyles from "@/components/modals/Modal.module.css";
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
      key: "overview",
      label: "Overview",
      render: () => (
        <p>
          The customer's loyalty balance and tier are saved in their profile
          in the same MongoDB transaction as the loyalty history entries.
        </p>
      ),
    },
    {
      key: "doc",
      label: "Customer Document",
      render: () => {
        if (!customerId) return <p>No customer is selected.</p>;
        if (loading) return <p role="status">Loading customer document...</p>;
        if (error) return <p role="alert">Couldn't load customer: {error}</p>;
        if (!customer) return <p>No customer document was returned.</p>;
        return <pre className={modalStyles.docJson}>{docToJSON(customer)}</pre>;
      },
    },
  ];

  return <SyncModal title="Update customer's loyalty" tabs={tabs} />;
};

export default UpdateCustomerLoyaltyEventContent;