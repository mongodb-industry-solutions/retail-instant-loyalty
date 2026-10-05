import { NextResponse } from "next/server";
import { API_URL } from "@/lib/helper";

const BACKEND_URL = API_URL;

// GET /api/orders/:orderId -> one order, scoped to the current session.
export async function GET(request, { params }) {
  const { id: orderId } = await params;

  if (!BACKEND_URL) {
    return NextResponse.json({ error: "API_URL is not set" }, { status: 503 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/orders/${orderId}`, {
      headers: {
        "Content-Type": "application/json",
        "x-customer-id": request.headers.get("x-customer-id") ?? "",
      },
      cache: "no-store",
    });

    return NextResponse.json(await res.json(), { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 502 },
    );
  }
}
