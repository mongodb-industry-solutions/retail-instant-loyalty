import React from 'react';

const HowToDemoLoyaltyHistory = () => {
    return (
        <div style={{
            background: "linear-gradient(90deg, #f8fafc 0%, #e0f7fa 100%)",
            padding: "32px",
        }}>
            <h2 style={{ color: "#1a237e", marginBottom: 18 }}>How to Demo the Loyalty History Page</h2>
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
                        A complete, readable ledger of every coin the member has earned or spent, tied back to the order that caused it.
                    </li>
                    <li>
                        Each entry shows the type, the order reference, the date, the amount and the balance after that event, so the balance can always be explained.
                    </li>
                    <li>
                        Tier changes appear in the same timeline, so the member sees exactly when they moved up a tier.
                    </li>
                    <li>
                        The page already includes the order from the previous step. No manual refresh or batch job is needed.
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
                        Point to the header card: the member's name, tier, the coin value at that tier, the current <strong>coin balance</strong> and the progress bar toward the next tier.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-loyalty-history-step2.png" alt="Loyalty History Page step 2" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Scroll to <strong>Transaction history</strong>. The newest events are at the top: the <span style={{ backgroundColor: "yellow", padding: "2px 4px", borderRadius: "4px" }}>Redeemed</span> and <span style={{ backgroundColor: "green", padding: "2px 4px", borderRadius: "4px", color: "#fff" }}>Earned</span> entries from the order just placed.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-loyalty-history-step3.png" alt="Loyalty History Page step 3" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Pick one entry and show its order reference, date, amount and <strong>Balance after</strong>. Explain that each balance is the result of the entry before it.
                    </li>
                    <li>
                        Scroll down to the older history to find the <strong>Tier upgraded</strong> entry that shows a tier change.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-loyalty-history-step5.png" alt="Loyalty History Page step 5" style={{ maxWidth: "100%", maxHeight: "600px" }} />
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
                        This ledger is the same data written by the transaction on the confirmation page, which is why the balance on the customer record always matches this history.
                    </li>
                    <li>
                        For support teams, this is the screen that answers “where are my coins?” with a clear, ordered record.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default HowToDemoLoyaltyHistory;