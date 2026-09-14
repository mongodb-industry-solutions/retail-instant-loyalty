import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(request) {
  console.log("Received redeem request");
  console.log("Request body:", await request.clone().json());

  const body = await request.json();

  // TEMPORARY: echo a synthetic confirmation until the backend serves it.
  // Once BACKEND_URL is available, delete this and use the fetch below.
  if (!BACKEND_URL) {
    const coinsUsed = body.coinsUsed ?? 0;
    return NextResponse.json(
      {
        redemptionId: `RDM-${Date.now()}`,
        customerId: body.customerId ?? null,
        items: body.items ?? [],
        coinsUsed,
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/redeem`, {
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
