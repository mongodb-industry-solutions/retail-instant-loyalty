import React from 'react';

const HowToDemoConfirmation = () => {
    return (
        <div style={{
            background: "linear-gradient(90deg, #f8fafc 0%, #e0f7fa 100%)",
            padding: "32px",
        }}>
            <h2 style={{ color: "#1a237e", marginBottom: 18 }}>How to Demo the Order Confirmation Page</h2>
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
                        The reward lands the moment the order is placed: coins earned, the updated tier progress and a plain-language summary of what was applied.
                    </li>
                    <li>
                        The itemized breakdown shows the commerce lines and the loyalty lines side by side: coins applied, coins earned and the spend that counts toward the tier.
                    </li>
                    <li>
                        The <strong>Behind the scenes</strong> panel walks through what MongoDB did for this order, step by step, with <strong>Learn more</strong> modals that show the real documents.
                    </li>
                    <li>
                        Right after earning, the member sees what they could redeem next, so the same screen can drive the following purchase.
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
                        After <strong>Place order</strong>, the <strong>Order Confirmed</strong> page shows the order number and a status tracker. For demo purposes the order moves through its stages on its own.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-confirmation-step1.png" alt="Order Confirmation Page step 1" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Point to the <strong>Loyalty rewards earned</strong> card: the coins earned, the active multiplier, the tier badge, the progress bar and the summary sentence describing what was applied and earned.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-confirmation-step2.png" alt="Order Confirmation Page step 2" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Scroll to <strong>Items ordered</strong> and highlight the loyalty lines in the breakdown: <strong>Coins applied at checkout</strong>, <strong>Coins earned</strong> and <strong>Tier qualifying spend</strong>.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-confirmation-step3.png" alt="Order Confirmation Page step 3" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Walk down the <strong>Behind the scenes</strong> panel. The <span variant="blue">MongoDB transaction</span> badges mark the two writes, the loyalty history and the customer update, that succeed or fail together.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-confirmation-step4.png" alt="Order Confirmation Page step 4" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Click <strong>Learn more</strong> on a step to open its modal. Use the tabs, such as <strong>Loyalty as data</strong> and <strong>Document Model</strong>, to show the loyalty configuration and the payment record as real MongoDB documents.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-confirmation-step5.png" alt="Order Confirmation Page step 5" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Scroll to <strong>“Treat yourself with the coins you’ve earned.”</strong> Each suggestion is tagged <span style={{ backgroundColor: "lightgreen", padding: "2px 4px", borderRadius: "4px" }}>Coins only</span> or <span style={{ backgroundColor: "yellow", padding: "2px 4px", borderRadius: "4px" }}>Hybrid</span>, depending on whether the balance covers it fully or needs some cash.
                        Click 'Redeem now' and 'Confirm redemption' to complete it if you wish to redeem inmediatly your freshly earned awards. If not you can move to the Orders History or any other page from the Navbar.

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
                        In the <strong>Calculate loyalty impact</strong> modal, the configuration shown is the current one. A notice reminds the viewer that it may differ from the configuration that was active at the time of purchase.
                    </li>
                    <li>
                        The last step in the panel, <strong>Refresh the customer profile across channels</strong>, is the change stream story: updates are pushed to the application when loyalty data changes, with no polling and no separate message broker.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default HowToDemoConfirmation;