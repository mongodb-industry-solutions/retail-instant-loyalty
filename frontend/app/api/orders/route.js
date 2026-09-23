import { NextResponse } from "next/server";
import { API_URL } from "@/lib/helper";

const BACKEND_URL = API_URL;

function missingBackend() {
  return NextResponse.json(
    { error: "API_URL is not set" },
    { status: 503 },
  );
}

function unreachable(err) {
  return NextResponse.json(
    { error: String(err?.message ?? err) },
    { status: 502 },
  );
}

export async function GET(request) {
  if (!BACKEND_URL) return missingBackend();

  const { searchParams } = new URL(request.url);
  const query = searchParams.size ? `?${searchParams}` : "";

  try {
    const res = await fetch(`${BACKEND_URL}/orders${query}`, {
      headers: {
        "Content-Type": "application/json",
        "x-customer-id": request.headers.get("x-customer-id") ?? "",
      },
      cache: "no-store",
    });

    return NextResponse.json(await res.json(), { status: res.status });
  } catch (err) {
    return unreachable(err);
  }
}

// Commits the order previewed by /orders/overview.
export async function POST(request) {
  if (!BACKEND_URL) return missingBackend();

  const body = await request.json();

  try {
    const res = await fetch(`${BACKEND_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": request.headers.get("x-session-id") ?? "",
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(await res.json(), { status: res.status });
  } catch (err) {
    return unreachable(err);
  }
}
