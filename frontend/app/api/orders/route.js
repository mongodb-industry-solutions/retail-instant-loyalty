import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// TODO(backend): this module is not registered in backend/src/server.js yet,
// so the seed data below is still the source of truth. Flip to true once it is.
const BACKEND_SERVES_THIS = false;

// TEMPORARY: seed data lives here until the backend serves it.
// Once BACKEND_URL is available, delete this and use the fetch below.
export const PLACEHOLDER_ORDERS = [
  {
    orderId: "MS-118820",
    customerId: "CUST-10005",
    items: [
      {
        productId: "PROD-1001",
        name: "Trail Runner Jacket",
        price: 99.98,
        quantity: 1,
      },
    ],
    amountSummary: {
      subtotal: 99.98,
      shipping: 0,
      tax: 8.5,
      total: 108.48,
    },
    transactionId: "TXN-99213",
    rewardsEarned: 99,
    statusHistory: [{ Status: "placed", lastUpdated: null }],
    createdAt: "2026-09-03T15:12:00.000Z",
    loyalty: {
      oldBalance: 3240,
      newBalance: 3739,
      oldTier: "gold",
      newTier: "gold",
      tierChanged: false,
      qualifyingSpend: 99.98,
      coinsUsed: 0,
    },
  },
];

export async function POST(request) {
  const body = await request.json();

  if (!BACKEND_SERVES_THIS || !BACKEND_URL) {
    const envelope = {
      orderId: `MS-${Date.now()}`,
      transactionId: `TXN-${Date.now()}`,
      statusHistory: [{ Status: "placed", lastUpdated: null }],
      createdAt: new Date().toISOString(),
      ...body.order,
      loyalty: { ...body.loyalty },
    };
    PLACEHOLDER_ORDERS.push(envelope);
    return NextResponse.json(envelope, { status: 201 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Backend responded with ${res.status}` },
        { status: res.status },
      );
    }

    return NextResponse.json(await res.json(), { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 502 },
    );
  }
}
