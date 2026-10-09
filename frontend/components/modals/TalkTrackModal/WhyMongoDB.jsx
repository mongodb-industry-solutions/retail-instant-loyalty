import React from 'react';

const features = [
  {
    title: "One Live Customer View",
    desc: "A member's profile, preferences, coin balance, tier and cumulative spend live together in a single customer document, while orders, payments, the loyalty ledger, the product catalog and the loyalty rules sit in the same Atlas cluster. The app renders the experience from current data in one fetch, with no joins across separate systems and no stale copies."
  },
  {
    title: "Flexible Model, Rules as Data",
    desc: "Tiers, earning rates and promotional campaigns are documents, not code. When an admin switches a campaign on, the very next order earns the new multiplier, and new mechanics such as date windows, category bonuses or new payment methods can be added as fields without schema migrations or downtime."
  },
  {
    title: "Transactions Where They Matter",
    desc: "Most writes are naturally atomic because an order is one document. For the one place that needs more, the customer's balance and its ledger entries, MongoDB multi-document transactions make them commit together or not at all, so the balance can always be explained by its history."
  },
  {
    title: "Real-Time Event Processing",
    desc: "Change Streams push committed balance and tier changes straight to the customer's app, filtered to the right customer, with no polling and no separate message broker. The same pattern can refresh other surfaces, such as messages or admin views, when loyalty or order state changes, and Atlas Triggers add event-driven automation on the same platform."
  },
  {
    title: "Personalization That Stays Operational",
    desc: "Atlas Search and facets work directly against the live catalog and customer context, so discovery reflects current data instead of a stale copy. Aggregation pipelines compute on the fresh balance, such as which products a customer can get free or nearly free right now, and Vector Search is available for semantic recommendations, with no separate engine to keep in sync."
  },
  {
    title: "Enterprise-Grade Scale and Security",
    desc: "Built-in high availability and horizontal scaling help programs stay responsive through peak events such as holiday campaigns. Authentication, role-based access control and encryption protect member data, which is among a retailer's most sensitive customer information."
  }
];

const WhyMongoDB = () => {
  return (
    <div style={{
      background: "linear-gradient(90deg, #f8fafc 0%, #e0f7fa 100%)",
      padding: "32px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    }}>
      <h2 style={{ color: "#1a237e", marginBottom: 18 }}>Why MongoDB is Perfect for Instant Loyalty</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px",
        marginBottom: "24px"
      }}>
        {features.map(feature => (
          <div key={feature.title} style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            padding: "20px",
            minHeight: "140px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}>
            <h4 style={{ color: "#0288d1", marginBottom: 8 }}>{feature.title}</h4>
            <p style={{ fontSize: "1rem", color: "#333" }}>{feature.desc}</p>
          </div>
        ))}
      </div>
      <div style={{
        background: "#e3f2fd",
        borderRadius: "8px",
        padding: "18px",
        textAlign: "center",
        fontSize: "1.08rem",
        color: "#1565c0"
      }}>
        <strong>MongoDB Atlas</strong> gives retailers one operational data foundation for the whole loyalty journey, from purchase and reward to discovery and re-engagement, so loyalty stays instant, trustworthy and easy to change.
      </div>
    </div>
  );
};

export default WhyMongoDB;