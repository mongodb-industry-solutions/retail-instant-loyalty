import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// Same request/response contract as POST /orders — session-scoped and
// requires x-session-id.
export async function POST(request) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_URL is not set" },
      { status: 503 },
    );
  }

  const body = await request.json();

  try {
    const res = await fetch(`${BACKEND_URL}/redeem`, {
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
