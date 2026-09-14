import { NextResponse } from "next/server";
import { PLACEHOLDER_ORDERS } from "../route";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(request, { params }) {
  const { id } = await params;

  if (!BACKEND_URL) {
    const order = PLACEHOLDER_ORDERS.find((o) => o.order.orderId === id);

    if (!order) {
      return NextResponse.json(
        { error: `Order ${id} not found` },
        { status: 404 },
      );
    }

    return NextResponse.json(order);
  }

  try {
    const res = await fetch(`${BACKEND_URL}/orders/${id}`, {
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
