import React from 'react';

const HowToDemoLanding = () => {
    return (
        <div style={{
            background: "linear-gradient(90deg, #f8fafc 0%, #e0f7fa 100%)",
            padding: "32px",
        }}>
            <h2 style={{ color: "#1a237e", marginBottom: 18 }}>How to Demo the Landing Page</h2>
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
                        The store greets a returning member with a live loyalty snapshot: orders placed, current tier, coin balance and progress toward the next tier, all read from the member's customer record.
                    </li>
                    <li>
                        The promotion banner at the top shows the campaign that is active right now. Campaigns are configuration data that admins manage, not code that needs a release.
                    </li>
                    <li>
                        The catalog is browsable by category, and every product opens a detail view with nearby availability and the underlying MongoDB product document.
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
                        Start on the landing page as the demo member. Point out the welcome card with <strong>orders</strong>, <strong>tier</strong> and <strong>coins</strong>, and the progress bar that shows how much more cumulative spend is needed to reach the next tier.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-landing-step1.png" alt="Landing Page step 1" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Call out the <strong>promotion banner</strong> at the top. It reflects the active campaign, and the multiplier behind it is what will be applied to the coins earned at checkout.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-landing-step2.png" alt="Landing Page step 2" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Scroll to <strong>“More to explore”</strong> and use the category pills to filter the catalog.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-landing-step3.png" alt="Landing Page step 3" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Click any product to open <strong>Product details</strong>. Show the store availability list, then expand <strong>Product document</strong> to reveal the full MongoDB document behind the page.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-landing-step4.png" alt="Landing Page step 4" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Click <strong>+ Add</strong> to add some products to your cart. The cart icon in the header updates. Then open the cart to move to the next page.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-landing-step5.png" alt="Landing Page step 5" style={{ maxWidth: "100%", maxHeight: "600px" }} />
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
                        The <strong>Talk track</strong> link in the header opens this presenter material. The <strong>Admin</strong> link opens the backoffice view of the loyalty settings (reward value, tier thresholds and promo campaigns), which is covered in the Checkout tab.
                    </li>
                    <li>
                        The product document is a good moment to mention the flexible document model: each product can carry its own mix of attributes without forcing every item into one rigid schema.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default HowToDemoLanding;