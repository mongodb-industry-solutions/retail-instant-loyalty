import { NextResponse } from "next/server";
import { API_URL } from "@/lib/helper";

const BACKEND_URL = API_URL;
const BACKEND_SERVES_THIS = true;

export async function GET(request) {
  if (!BACKEND_SERVES_THIS || !BACKEND_URL) {
    return NextResponse.json(PLACEHOLDER_PRODUCTS);
  }

  try {
    const res = await fetch(`${BACKEND_URL}/products/recommendations`, {
      headers: {
        method: "GET",
        "Content-Type": "application/json",
        "x-customer-id": request.headers.get("x-customer-id") ?? "",
      },
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
