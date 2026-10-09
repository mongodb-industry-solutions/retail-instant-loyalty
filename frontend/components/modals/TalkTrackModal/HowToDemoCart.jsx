import React from 'react';

const HowToDemoCart = () => {
    return (
        <div style={{
            background: "linear-gradient(90deg, #f8fafc 0%, #e0f7fa 100%)",
            padding: "32px",
        }}>
            <h2 style={{ color: "#1a237e", marginBottom: 18 }}>How to Demo the Cart Page</h2>
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
                        A familiar cart experience with quantity controls, item removal and an order summary showing subtotal, shipping, tax and total.
                    </li>
                    <li>
                        The cart is loyalty-aware: a highlighted message tells the shopper how many coins this order will earn at the active multiplier, before they commit to anything.
                    </li>
                    <li>
                        The estimate recalculates as the cart changes, using the same loyalty rules that are applied when the order is actually placed.
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
                        Review the items in <strong>My Cart</strong> and the <strong>Order Summary</strong> on the right.
                    </li>
                    <li>
                        Point to the yellow message under the totals. It tells the shopper how many loyalty coins they will earn and mentions the active campaign multiplier.
                        <strong>The customer earns points ONLY on the SUBTOTAL payable part, not on taxes or shipping</strong>
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-cart-step2.png" alt="Cart Page step 2" style={{ maxWidth: "100%", maxHeight: "600px" }} />
                        </div>
                    </li>

                    <li>
                        Click <strong>“Proceed to checkout”</strong> to continue.
                        <div style={{
                            background: "#f5f5f5",
                            borderRadius: "6px",
                            padding: "10px",
                            margin: "10px 0",
                            textAlign: "center",
                            color: "#888"
                        }}>
                            <img src="/rsc/talkTrack/loyalty-cart-step5.png" alt="Cart Page step 5" style={{ maxWidth: "100%", maxHeight: "600px" }} />
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
                        The coin estimate is a preview. Nothing is recorded in MongoDB until the shopper places the order.
                    </li>
                    <li>
                        Because the multiplier comes from the active campaign configuration, switching the campaign in Admin changes the estimate the next time the cart is calculated.
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default HowToDemoCart;