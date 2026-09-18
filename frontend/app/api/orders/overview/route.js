import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// Dry run of POST /orders: same pricing engine, no writes. The server resolves
// live prices, balance and tier from the session, so the client only sends
// product ids, quantities and how many coins to apply.
export async function POST(request) {
  const body = await request.json();

  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_URL is not set" },
      { status: 503 },
    );
  }

  try {
    console.log("the session id is", request.headers.get("x-session-id"));
    const res = await fetch(`${BACKEND_URL}/orders/overview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": request.headers.get("x-session-id") ?? "",
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(await res.json(), { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 502 },
    );
  }
}
