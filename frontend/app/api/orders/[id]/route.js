import { NextResponse } from "next/server";
import { PLACEHOLDER_ORDERS } from "../route";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// TODO(backend): this module is not registered in backend/src/server.js yet,
// so the seed data below is still the source of truth. Flip to true once it is.
const BACKEND_SERVES_THIS = false;

// GET /api/orders/:customerId -> every order belonging to that customer.
export async function GET(request, { params }) {
  const { id: customerId } = await params;

  if (!BACKEND_SERVES_THIS || !BACKEND_URL) {
    return NextResponse.json(
      PLACEHOLDER_ORDERS.filter((o) => o.customerId === customerId),
    );
  }

  try {
    console.log(`Fetching orders for customerId: ${customerId}`);
    const res = await fetch(`${BACKEND_URL}/orders/${customerId}`, {
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
