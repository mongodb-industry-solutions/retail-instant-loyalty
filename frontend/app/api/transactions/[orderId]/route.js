import { NextResponse } from "next/server";
import { API_URL } from "@/lib/helper";

export async function GET(request, { params }) {
  const { orderId } = await params;

  if (!API_URL) {
    return NextResponse.json(
      { error: "API_URL is not set" },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(
      `${API_URL}/transactions/${encodeURIComponent(orderId)}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-customer-id": request.headers.get("x-customer-id") ?? "",
        },
        cache: "no-store",
      },
    );

    return NextResponse.json(await res.json(), { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 502 },
    );
  }
}