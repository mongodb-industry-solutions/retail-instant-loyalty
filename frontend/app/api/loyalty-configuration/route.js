import { API_URL } from "@/lib/helper";
import { NextResponse } from "next/server";

const BACKEND_URL = API_URL;

const PATCHABLE_FIELDS = ["rewardUpdates", "campaignUpdate"];

export async function PATCH(request) {
  const body = await request.json();

  console.log("PATCH request body:", body);

  const patch = Object.fromEntries(
    PATCHABLE_FIELDS.filter((field) => body[field] !== undefined).map(
      (field) => [field, body[field]],
    ),
  );

  console.log("PATCH request patch:", patch);

  if (!Object.keys(patch).length) {
    return NextResponse.json(
      { error: `Provide at least one of: ${PATCHABLE_FIELDS.join(", ")}` },
      { status: 400 },
    );
  }

  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "Backend URL is not configured" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/loyalty-configuration/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-session-id": request.headers.get("x-session-id") ?? "",
      },
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Backend responded with ${res.status}` },
        { status: res.status },
      );
    }

    return NextResponse.json(await res.json(), { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 502 },
    );
  }
}

export async function GET(request) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "Backend URL is not configured" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/loyalty-configuration`, {
      headers: {
        "Content-Type": "application/json",
        "x-session-id": request.headers.get("x-session-id") ?? "",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return NextResponse.json(
        body ?? { error: `Backend responded with ${res.status}` },
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
