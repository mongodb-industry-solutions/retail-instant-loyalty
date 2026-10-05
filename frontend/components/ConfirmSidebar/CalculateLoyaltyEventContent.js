'use client'
import React, { useEffect, useState } from "react";
import { Callout } from "@via-ds/components/callout";
import { Text } from "@via-ds/components/typography";
import { fetchLoyaltyConfig } from "@/lib/api";
import { docToJSON } from "@/lib/helper";
import styles from "./EventContent.module.css";
import SyncModal from "../modals/SyncModal/SyncModal";

const TIER_EXAMPLE = {
  tierName: "elite",
  tierThreshold: 15000,
  currencyValueForDollar: 3,
};

const CAMPAIGN_EXAMPLE = {
  promoId: "PROMO-HOLIDAY",
  promoName: "Holiday Rewards",
  isActive: true,
  multiplier: 4,
  eligibleCategories: ["electronics", "toys"],
};

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
      key: "doc",
      label: "Loyalty as data",
      render: () => (
        <div className={styles.content}>
          <section>
            <h3>Building Loyalty Programs for Continuous Change</h3>
            <p>
              Loyalty programs have evolved far beyond simply awarding points
              for purchases. Retailers continuously introduce new tiers, adjust
              redemption values, launch seasonal promotions, experiment with
              multipliers, and create increasingly personalized rewards.
            </p>
            <p>
              The business rules behind these programs are therefore not static;
              <strong> they are business data.</strong> When loyalty configuration
              is treated as data, retailers can design systems where the rules
              of the loyalty program can evolve alongside the business, without
              forcing every business change to become an application or
              database-structure change.
            </p>
            <p>
              This is where a document database such as MongoDB can provide a
              compelling approach.
            </p>
          </section>
          <Callout className={styles.callout} variant="note">
            <Text slot="title">Business rules are business data</Text>
            <p>
              Tiers, redemption values, and campaign multipliers describe the
              loyalty program the retailer is running today.
            </p>
          </Callout>
          <section>
            <h4>Loyalty rules change. Your data model should be able to change with them.</h4>
            <p>Retailers rarely leave a loyalty program unchanged for long.</p>
            <p>
              A new tier might be introduced for high-value customers. A
              promotion might need an additional eligibility rule. A campaign
              might apply only to certain categories. A new reward mechanism
              might require additional attributes that didn't exist when the
              application was originally built.
            </p>
            <p>
              With a rigid schema, these changes can potentially require changes
              to the database structure and the application that consumes it.
            </p>
            <p>
              With MongoDB's flexible document model, the data can evolve as the
              business requirements evolve.
            </p>
          </section>
          <div className={styles.examples}>
            <section>
              <div className={styles.exampleHead}>
                <h4>Introduce a new tier</h4>
                <span className={styles.badge}>Illustrative JSON</span>
              </div>
              <p>For example, a retailer could introduce a new tier:</p>
              <pre className={styles.json}><code>{docToJSON(TIER_EXAMPLE)}</code></pre>
            </section>
            <section>
              <div className={styles.exampleHead}>
                <h4>Evolve a campaign</h4>
                <span className={styles.badge}>Illustrative JSON</span>
              </div>
              <p>
                Or a campaign could evolve from a simple multiplier into a more
                sophisticated business rule:
              </p>
              <pre className={styles.json}><code>{docToJSON(CAMPAIGN_EXAMPLE)}</code></pre>
            </section>
          </div>
          <div className={styles.takeaway}>
            <p>
              The retailer is adding <strong>business information</strong>, not
              redesigning the entire data model.
            </p>
            <p>
              This distinction becomes particularly valuable when loyalty
              programs need to support experimentation and frequent changes.
            </p>
          </div>
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
              <h3>When configuration becomes business data</h3>
              <p>
                A retailer might define five customer tiers, each with its own
                threshold and redemption value. At the same time, the retailer
                may be running a Summer Rewards campaign that doubles the coins
                customers earn.
              </p>
              <p>
                These aren't simply technical configuration parameters. They
                represent <strong>the retailer's current business rules.</strong>
              </p>
              <p>A document model can represent these concepts directly:</p>
            </section>
            <section>
              <div className={styles.exampleHead}>
                <h4>Loyalty configuration</h4>
                <span className={styles.badge}>Session API response</span>
              </div>
              {loading ? (
                <p role="status">Loading loyalty configuration...</p>
              ) : error ? (
                <p role="alert">Couldn't load configuration: {error}</p>
              ) : !configuration ? (
                <p>No loyalty configuration was returned.</p>
              ) : (
                <pre className={styles.json}><code>{docToJSON(configuration)}</code></pre>
              )}
            </section>
          </div>
        );
      },
    }];

  return <SyncModal 
            title="Calculate loyalty impact" 
            tabs={tabs} 
        />;
};

export default CalculateLoyaltyEventContent;
