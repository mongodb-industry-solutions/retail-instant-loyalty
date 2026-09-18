import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

function missingBackend() {
  return NextResponse.json(
    { error: "NEXT_PUBLIC_API_URL is not set" },
    { status: 503 },
  );
}

function unreachable(err) {
  return NextResponse.json(
    { error: String(err?.message ?? err) },
    { status: 502 },
  );
}

// Order history for the current session. The backend derives the customer
// from x-session-id, so no id is passed.
export async function GET(request) {
  console.log("This is being called: ", request.url);
  console.log("x-session-id:", request.headers.get("x-session-id") ?? "");
  if (!BACKEND_URL) return missingBackend();

  const { searchParams } = new URL(request.url);
  const query = searchParams.size ? `?${searchParams}` : "";

  try {
    const res = await fetch(`${BACKEND_URL}/orders${query}`, {
      headers: {
        "Content-Type": "application/json",
        "x-session-id": request.headers.get("x-session-id") ?? "",
      },
      cache: "no-store",
    });

    console.log("The orders are ", await res.clone().json());

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
