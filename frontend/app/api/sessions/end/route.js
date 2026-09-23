import { NextResponse } from "next/server";
import { API_URL } from "@/lib/helper";

const BACKEND_URL = API_URL;

// Releases the persona this session claimed. The session id is the only handle
// the backend needs — it finds the customer by sessionId.
export async function POST(request) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "API_URL is not set" },
      { status: 503 },
    );
  }

  try {
    // No Content-Type: there is no body, and declaring JSON makes Fastify
    // reject the request before the route handler runs.
    const res = await fetch(`${BACKEND_URL}/sessions/end`, {
      method: "POST",
      headers: { "x-session-id": request.headers.get("x-session-id") ?? "" },
    });

    return NextResponse.json(await res.json(), { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 502 },
    );
  }
}
