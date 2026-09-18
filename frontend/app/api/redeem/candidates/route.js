import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /redeem/candidates is session-scoped and POST-only — the backend
// derives the customer from x-session-id and returns whichever redeem-eligible
// products it picks. Pure passthrough: body is forwarded as-is
// ({ excludeProducts, limit }), response is { data: { products, maxAmountOfCash } }.
export async function POST(request) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_URL is not set" },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/redeem/candidates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": request.headers.get("x-session-id") ?? "",
      },
      body: await request.text(),
    });

    return NextResponse.json(await res.json(), { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to reach backend: ${err.message}` },
      { status: 502 },
    );
  }
}
