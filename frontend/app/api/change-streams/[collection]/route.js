import { NextResponse } from "next/server";
import { API_URL } from "@/lib/helper";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { collection } = await params;

  if (!API_URL) {
    return NextResponse.json(
      { error: { code: "BACKEND_UNAVAILABLE", message: "API_URL is not set" } },
      { status: 503 },
    );
  }

  const backendUrl = new URL(
    `/change-streams/${encodeURIComponent(collection)}`,
    API_URL,
  );
  backendUrl.search = request.nextUrl.search;

  try {
    const response = await fetch(backendUrl, {
      headers: { Accept: "text/event-stream" },
      cache: "no-store",
      signal: request.signal,
    });

    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type"),
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: {
          code: "BACKEND_UNREACHABLE",
          message: String(err?.message ?? err),
        },
      },
      { status: 502 },
    );
  }
}