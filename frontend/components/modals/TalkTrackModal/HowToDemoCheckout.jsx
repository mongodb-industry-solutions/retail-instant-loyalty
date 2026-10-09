import React from 'react';

const HowToDemoCheckout = () => {
    return (
        <div style={{
            background: "linear-gradient(90deg, #f8fafc 0%, #e0f7fa 100%)",
            padding: "32px",
        }}>
            <h2 style={{ color: "#1a237e", marginBottom: 18 }}>How to Demo the Checkout Page</h2>
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
                        Shipping and payment details are prefilled from the customer record, so checkout is quick for a returning member.
                    </li>
                    <li>
                        Coins work as a payment method. The shopper can apply some or all of their balance toward the merchandise, and each tier gives coins a different redemption value.
                    </li>
                    <li>
                        Two live messages explain the loyalty impact before the order is placed: the coins the order will earn, and how far it moves the member toward the next tier.
                    </li>
                    <li>
                        Hybrid payment is supported: coins for part of the order and the card for the remainder.
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
                        Review the prefilled <strong>Shipping information</strong> and <strong>Payment details</strong>, then expand the items in the <strong>Order Summary</strong>.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-checkout-step1.png" alt="Checkout Page step 1" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Before applying any coins, read the two yellow messages near the <strong>Place order</strong> button. One explains the coins this order earns, the other the progress it adds toward the next tier.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-checkout-step2.png" alt="Checkout Page step 2" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        In the <strong>“Use loyalty coins at checkout”</strong> box, click <strong>Use points</strong> and drag the slider. A <strong>Coins applied</strong> line appears in the summary and the total drops, because the coins give a discount on the merchandise subtotal.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-checkout-step3.png" alt="Checkout Page step 3" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Watch the two yellow messages update. Coins are earned on the portion of the merchandise paid in cash, so using coins changes what the order earns and what it adds toward tier progress.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-checkout-step4.png" alt="Checkout Page step 4" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Optional: open <strong>Admin</strong> to show the <strong>Loyalty Settings</strong> backoffice view. Walk through the <strong>Reward value</strong>, <strong>Tier thresholds</strong> and <strong>Promo campaign</strong> tabs to show that the rules behind these numbers are data an admin can edit.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-checkout-step5.png" alt="Checkout Page step 5" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Optional: click <strong>“Use invalid card”</strong> to simulate a declined payment. A failed payment is recorded but does not award or redeem any coins.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-checkout-step6.png" alt="Checkout Page step 6" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Switch back to a valid card and click <strong>Place order</strong>.
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
                        To explain the numbers without doing the math live: <em>coins applied</em> reduce the subtotal, and the multiplier is applied to what is left to pay in cash.
                    </li>
                    <li>
                        Higher tiers make each coin worth more at redemption. That is why the reward value is defined per tier in the Admin settings.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default HowToDemoCheckout;