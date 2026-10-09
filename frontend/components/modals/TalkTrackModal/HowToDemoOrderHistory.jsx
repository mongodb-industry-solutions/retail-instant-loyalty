import React from 'react';

const HowToDemoOrderHistory = () => {
    return (
        <div style={{
            background: "linear-gradient(90deg, #f8fafc 0%, #e0f7fa 100%)",
            padding: "32px",
        }}>
            <h2 style={{ color: "#1a237e", marginBottom: 18 }}>How to Demo the Order History Page</h2>
            <div style={{
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                padding: "20px",
                marginBottom: "24px"
            }}>
                <h3 style={{ color: "#0288d1", marginBottom: 8 }}>🔍 What to Highlight on This Page</h3>
                <ul style={{ paddingLeft: "1.2em", fontSize: "1.08rem" }}>
                    <li>
                        Order history and rewards live in the same customer journey: each order shows its commercial summary next to its loyalty effect.
                    </li>
                    <li>
                        Summary cards give a quick read on orders on file, completed orders and the member's current reward position.
                    </li>
                    <li>
                        Every order opens in a detail view with the full breakdown and the same <strong>Behind the scenes</strong> explanations as the confirmation page.
                    </li>
                </ul>
            </div>
            <div style={{
                background: "#e3f2fd",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "24px"
            }}>
                <h3 style={{ color: "#1565c0", marginBottom: 8 }}>👣 Steps to Demo This Page</h3>
                <ol style={{ paddingLeft: "1.2em", fontSize: "1.08rem" }}>
                    <li>
                        Point to the three summary cards: <strong>Orders on file</strong>, <strong>Completed</strong> and <strong>Reward position</strong>, which shows the coin balance and the member's tier rate.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-order-history-step2.png" alt="Order History Page step 2" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Scan the order list. Each row shows the order number, date, the channel, the delivery status and the loyalty effect, such as coins applied on a reward order or coins earned on a purchase.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-order-history-step3.png" alt="Order History Page step 3" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Click an order to open its detail. Show the items and the totals, including the coins applied and coins earned lines.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-order-history-step4.png" alt="Order History Page step 4" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Scroll inside the detail view to the <strong>Behind the scenes</strong> section and expand a step to reuse the explanations from the confirmation page.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-order-history-step5.png" alt="Order History Page step 5" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                </ol>
            </div>
            <div style={{
                background: "#fffde7",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "24px"
            }}>
                <h3 style={{ color: "#f57c00", marginBottom: 8 }}>📘 Extra Notes</h3>
                <ul style={{ paddingLeft: "1.2em", fontSize: "1.08rem" }}>
                    <li>
                        The detail view reminds the viewer that completed purchases update both the order history and the reward balance in the same customer journey.
                    </li>
                    <li>
                        The channel badge on each order shows where it was placed. The same member record is designed to serve every channel, which sets up the cross-channel conversation.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default HowToDemoOrderHistory;