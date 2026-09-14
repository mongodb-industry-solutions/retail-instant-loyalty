import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

// TEMPORARY: seed data lives here until the backend serves it.
// Once BACKEND_URL is available, delete this and use the fetch below.
export const PLACEHOLDER_ORDERS = [
  {
    order: {
      orderId: "MS-118820",
      customerId: "CUST-10002",
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
    },
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");

  if (!BACKEND_URL) {
    const orders = customerId
      ? PLACEHOLDER_ORDERS.filter((o) => o.order.customerId === customerId)
      : PLACEHOLDER_ORDERS;
    return NextResponse.json(orders);
  }

  try {
    const query = customerId
      ? `?customerId=${encodeURIComponent(customerId)}`
      : "";
    const res = await fetch(`${BACKEND_URL}/orders${query}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Backend responded with ${res.status}` },
        { status: res.status },
      );
    }

    return NextResponse.json(await res.json());
  } catch (err) {
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 502 },
    );
  }
}

export async function POST(request) {
  const body = await request.json();

  if (!BACKEND_URL) {
    const envelope = {
      order: {
        orderId: `MS-${Date.now()}`,
        transactionId: `TXN-${Date.now()}`,
        statusHistory: [{ Status: "placed", lastUpdated: null }],
        createdAt: new Date().toISOString(),
        ...body.order,
      },
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
