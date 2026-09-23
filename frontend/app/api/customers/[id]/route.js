import { NextResponse } from "next/server";
import { API_URL } from "@/lib/helper";

const BACKEND_URL = API_URL;

export async function GET(request, { params }) {
  const { id } = await params;

  if (!BACKEND_URL) {
    return NextResponse.json(
      {
        error: {
          code: "BACKEND_UNAVAILABLE",
          message: "API_URL is not set",
        },
      },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/customers/${id}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    return NextResponse.json(await res.json(), { status: res.status });
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
