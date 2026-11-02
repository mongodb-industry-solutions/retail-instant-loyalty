import { NextResponse } from "next/server";
import { API_URL } from "@/lib/helper";

const BACKEND_URL = API_URL;

// TODO(backend): this module is not registered in backend/src/server.js yet,
// so the seed data below is still the source of truth. Flip to true once it is.
const BACKEND_SERVES_THIS = true;

// TEMPORARY: seed data lives here until the backend serves it.
// Once BACKEND_URL is available, delete this and use the fetch below.

export async function GET() {
  if (!BACKEND_SERVES_THIS || !BACKEND_URL) {
    return NextResponse.json(
      { error: "Products backend is not configured" },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/products`, {
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
