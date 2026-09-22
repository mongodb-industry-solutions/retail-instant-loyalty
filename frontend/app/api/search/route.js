import { NextResponse } from "next/server";
import { API_URL } from "@/lib/helper";

const BACKEND_URL = API_URL;

export async function POST(request) {
  const body = await request.json();
  const { query, facets } = body;

  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "API_URL is not set" },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, facets }),
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
