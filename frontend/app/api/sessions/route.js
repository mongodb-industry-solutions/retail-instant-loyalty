import { NextResponse } from "next/server";
import { API_URL } from "@/lib/helper";

const BACKEND_URL = API_URL;

// Step 1: the personas available to pick from. No session exists yet — one is
// created when the user selects one (POST /api/sessions/start).
export async function GET() {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "API_URL is not set" },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/sessions`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    // The backend's own error envelope is passed through so callers keep the
    // error code, not just the status.
    return NextResponse.json(await res.json(), { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 502 },
    );
  }
}
