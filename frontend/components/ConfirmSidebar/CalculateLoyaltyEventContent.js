'use client'
import React, { useEffect, useState } from "react";
import { fetchLoyaltyConfig } from "@/lib/api";
import { docToJSON } from "@/lib/helper";
import modalStyles from "@/components/modals/Modal.module.css";
import SyncModal from "../modals/SyncModal/SyncModal";

const CalculateLoyaltyEventContent = () => {
  const [configuration, setConfiguration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setConfiguration(null);
    setError(null);

    setLoading(true);
    fetchLoyaltyConfig()
      .then((data) => {
        if (!cancelled) setConfiguration(data);
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
  }, []);

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
      label: "Loyalty Configuration Document",
      render: () => {
        if (loading) return <p role="status">Loading loyalty configuration...</p>;
        if (error) return <p role="alert">Couldn't load configuration: {error}</p>;
        if (!configuration) return <p>No loyalty configuration was returned.</p>;
        return <pre className={modalStyles.docJson}>{docToJSON(configuration)}</pre>;
      },
    }];

  return <SyncModal title="Loyalty" tabs={tabs} />;
};

export default CalculateLoyaltyEventContent;
