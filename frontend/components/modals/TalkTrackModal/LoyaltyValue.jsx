import React from 'react';

const pillars = [
    {
        title: "Instant Recognition",
        desc: "The reward is credited and visible the moment the purchase is complete."
    },
    {
        title: "Immediate Usability",
        desc: "New coins can go straight into the next purchase, alone or combined with a card."
    },
    {
        title: "Live Promotions",
        desc: "Bonus campaigns switch on and off in real time, and customers see them before they buy."
    }
];

// Based on published program terms of real programs, shown anonymously by business type.
// Policies change, so re-check the underlying figures before presenting.
const delays = [
    { program: "Consumer Electronics Retailer", delay: "About 15 days" },
    { program: "Electronics Brand Rewards", delay: "About 14 days after delivery" },
    { program: "Hotel Rewards Program", delay: "Up to 10 business days after check-out" },
    { program: "Department Store (Latin America)", delay: "24 to 72 hours" }
];

const outcomes = [
    {
        title: "Higher engagement and bigger baskets",
        desc: "Industry research links instant rewards to larger baskets, and members who redeem rewards spend noticeably more than non-members."
    },
    {
        title: "Trust and fewer support inquiries",
        desc: "When the balance updates at checkout, customers stop wondering whether the purchase counted and stop contacting support to ask."
    },
    {
        title: "Promotional agility",
        desc: "Marketing can launch a double or triple coin event for a slow afternoon or a surplus category without waiting for a release."
    },
    {
        title: "More redemption, more repeat visits",
        desc: "Coins that are usable right away turn into the next order instead of sitting idle until the next statement."
    }
];

const LoyaltyValue = () => {
    return (
        <div style={{
            background: "linear-gradient(90deg, #f8fafc 0%, #e0f7fa 100%)",
            padding: "32px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}>
            <h2 style={{ color: "#1a237e", marginBottom: 12 }}>Instant Loyalty: Business Value for Retailers</h2>
            <p style={{ fontSize: "1.1rem", marginBottom: 18 }}>
                <strong>Loyalty programs</strong> reward customers for coming back. Shoppers earn points, coins or stars on every purchase, move up tiers as they spend, and redeem what they have earned. For retailers, they are one of the most direct ways to raise purchase frequency and customer lifetime value.
            </p>
            <p style={{ fontSize: "1.1rem", marginBottom: 18 }}>
                <strong>Instant Loyalty</strong> means the reward is credited, visible and usable at the moment of purchase, instead of arriving after an overnight process.
                <br />
                <span style={{ color: "#00796b" }}>
                    <strong>Dynamic Loyalty</strong> refers to the ability to change earning rules, such as multipliers, campaigns and tier values, in real time and see the effect on the very next order, rather than waiting for a release cycle.
                </span>
            </p>
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "24px",
                justifyContent: "center",
                margin: "32px 0"
            }}>
                {pillars.map(pillar => (
                    <div key={pillar.title} style={{
                        background: "#fff",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        padding: "20px",
                        minWidth: 220,
                        textAlign: "center",
                        flex: 1
                    }}>
                        <h4 style={{ color: "#0288d1", marginBottom: 8 }}>{pillar.title}</h4>
                        <p style={{ fontSize: "1rem", color: "#333" }}>{pillar.desc}</p>
                    </div>
                ))}
            </div>

            <h3 style={{ color: "#1565c0", marginBottom: 12, marginTop: 32 }}>The Problem: Rewards Arrive Late</h3>
            <div style={{
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                padding: "20px",
                marginBottom: "24px",
                fontSize: "1rem",
                color: "#333"
            }}>
                <p style={{ marginTop: 0 }}>
                    Many loyalty platforms still credit rewards through overnight batch jobs. After checkout, the transaction waits in a queue until a later process reconciles it with the customer's account. In the meantime the shopper sees an unchanged balance, cannot spend what they just earned, and has no confirmation that the purchase counted. The seconds right after checkout are the highest-intent moment in retail, and a delayed reward gives that moment away.
                </p>
                <p>Published program terms show how common the wait is:</p>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "12px",
                    marginBottom: "14px"
                }}>
                    {delays.map(d => (
                        <div key={d.program} style={{
                            background: "#f5f9fc",
                            borderRadius: "8px",
                            padding: "12px 14px"
                        }}>
                            <strong style={{ color: "#0288d1" }}>{d.program}</strong>
                            <div style={{ marginTop: 4 }}>{d.delay}</div>
                        </div>
                    ))}
                </div>
                <p style={{ marginBottom: 0 }}>
                    Expectations are moving the other way. Industry surveys report that roughly three in four customers are more likely to engage with programs that offer instant rewards, and that a large majority of Gen Z and Millennial shoppers expect real-time responsiveness from the brands they buy from.
                </p>
            </div>

            <h3 style={{ color: "#1565c0", marginBottom: 12, marginTop: 32 }}>Outcomes of Instant Loyalty</h3>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "18px",
                marginBottom: "24px"
            }}>
                {outcomes.map(outcome => (
                    <div key={outcome.title} style={{
                        background: "#fff",
                        borderRadius: "10px",
                        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                        padding: "16px",
                        fontSize: "1rem"
                    }}>
                        <strong style={{ color: "#0288d1" }}>{outcome.title}</strong>
                        <div style={{ color: "#333", marginTop: 6 }}>{outcome.desc}</div>
                    </div>
                ))}
            </div>

            <div style={{
                background: "#e3f2fd",
                borderRadius: "8px",
                padding: "24px",
                textAlign: "left",
                fontSize: "1.08rem",
                color: "#1565c0",
                marginBottom: "18px"
            }}>
                <h3 style={{ color: "#1565c0", marginBottom: "12px" }}>Who Benefits from Instant Loyalty?</h3>
                <ul style={{ paddingLeft: "1.2em", marginBottom: 0 }}>
                    <li>
                        <strong>Customers:</strong> See their reward the moment they pay, know their tier progress, and can spend coins on the next purchase without waiting.
                    </li>
                    <li>
                        <strong>Marketing and Loyalty Teams:</strong> Launch, adjust and end multiplier campaigns on demand, and react to real-time signals such as a slow day or excess inventory.
                    </li>
                    <li>
                        <strong>Store Associates and Customer Service:</strong> Answer "where are my points?" with a current balance and a clear history, and spend less time on reward disputes.
                    </li>
                    <li>
                        <strong>Finance and Audit:</strong> Rely on a balance that always matches a complete ledger of what was earned and spent.
                    </li>
                    <li>
                        <strong>Retail IT Teams:</strong> Retire overnight reconciliation jobs, shorten the path to new loyalty mechanics, and stop being the bottleneck for every promotion change.
                    </li>
                </ul>
            </div>

            <div style={{
                background: "#fff",
                borderRadius: "8px",
                padding: "18px",
                textAlign: "left",
                fontSize: "1.08rem",
                color: "#333",
                marginBottom: "18px"
            }}>
                <h4 style={{ color: "#0288d1", marginBottom: 8 }}>Why It Matters: Loyalty at Scale</h4>
                <div>
                    A well-run loyalty program can become a core revenue engine. Starbucks, for example, reports that Rewards members account for roughly 60% of spend at its U.S. company-operated stores, with around 35.8 million active members in the U.S. as of its latest investor reporting. It shows how much of a retailer's business can ride on its most engaged customers, which is why the quality of their experience matters.
                </div>
            </div>

            <div style={{
                background: "#fffde7",
                borderRadius: "8px",
                padding: "18px",
                textAlign: "center",
                fontSize: "1.08rem",
                color: "#f57c00"
            }}>
                <strong>Instant loyalty is a data problem, not a marketing problem.</strong><br />
                To credit a reward at checkout, a retailer must update the order, the customer's balance, their tier and a ledger entry together, apply the right promotion at that exact moment, and tell the app right away. The next tab shows how MongoDB makes that possible.
            </div>
        </div>
    );
};

export default LoyaltyValue;