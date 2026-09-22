import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request) {
  const customerId = request.headers.get("x-customer-id");

  if (!BACKEND_URL) {
    return NextResponse.json(
      {
        error: {
          code: "BACKEND_UNAVAILABLE",
          message: "NEXT_PUBLIC_API_URL is not set",
        },
      },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/loyaltyHistory`, {
      headers: {
        method: "GET",
        "Content-Type": "application/json",
        "x-customer-id": customerId,
      },
      cache: "no-store",
    });

    return NextResponse.json(await res.json(), { status: res.status });
  } catch (err) {
    return NextResponse.json(
      {
        error: {
          code: "BACKEND_UNREACHABLE",
          message: String(err?.message ?? err),
        },
      },
      { status: 502 },
    );
  }
}
