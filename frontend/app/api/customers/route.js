import { API_URL } from "@/lib/helper";
import { NextResponse } from "next/server";

const BACKEND_URL = API_URL;

export async function GET() {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "API_URL is not set" },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/customers`, {
      headers: { "Content-Type": "application/json" },
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
