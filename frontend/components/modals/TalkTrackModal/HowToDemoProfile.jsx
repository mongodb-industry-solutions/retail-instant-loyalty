import React from 'react';

const HowToDemoProfile = () => {
    return (
        <div style={{
            background: "linear-gradient(90deg, #f8fafc 0%, #e0f7fa 100%)",
            padding: "32px",
        }}>
            <h2 style={{ color: "#1a237e", marginBottom: 18 }}>How to Demo the Profile Page</h2>
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
                        One page brings together the member's personal details, default payment method, delivery address and loyalty standing.
                    </li>
                    <li>
                        The <strong>Tier benefits</strong> section lays out what each tier offers and marks the member's current tier.
                    </li>
                    <li>
                        <strong>See schema</strong> reveals the actual MongoDB document behind the page, where profile data and loyalty data live together.
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
                        Open the avatar menu in the header and select <strong>Profile</strong>.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-profile-step1.png" alt="Profile Page step 1" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        At the top, point to the member's tier and the progress toward the next tier, then to <strong>Personal details</strong>, <strong>Payment method</strong> and <strong>Delivery address</strong>.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-profile-step2.png" alt="Profile Page step 2" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Scroll to <strong>Tier benefits</strong>. Walk through the tiers from the first to the highest and show how the member's current tier is marked.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-profile-step3.png" alt="Profile Page step 3" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        Scroll to <strong>Your data</strong> and click <strong>See schema</strong>.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-profile-step4.png" alt="Profile Page step 4" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>
                    <li>
                        In the <strong>User Schema</strong> modal, scroll to the <strong>loyaltyDetails</strong> section and show the active tier, next tier, coin balance and cumulative spend, all inside the same document as the profile and addresses.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-profile-step5.png" alt="Profile Page step 5" style={{ maxWidth: "100%", maxHeight: "600px" }} />
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
                        This is the best closing moment for the flexible document model: the member's identity, preferences and loyalty state are one document, with no separate loyalty table and no join.
                    </li>
                    <li>
                        Because every screen in the demo reads from this same customer document, a change made at checkout shows up here without any extra synchronization.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default HowToDemoProfile;