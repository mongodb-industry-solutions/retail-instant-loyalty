import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// TODO(backend): this module is not registered in backend/src/server.js yet,
// so the seed data below is still the source of truth. Flip to true once it is.
const BACKEND_SERVES_THIS = false;

// TEMPORARY: seed data lives here until the backend serves it.
// Once BACKEND_URL is available, delete this and use the fetch below.
const PLACEHOLDER_LOYALTY_CONFIG = {
  rewardDetails: [
    {
      tierKey: "bronze",
      tierName: "Bronze",
      threshold: 1000,
      currencyValueForDolar: 1000,
    },
    {
      tierKey: "silver",
      tierName: "Silver",
      threshold: 2500,
      currencyValueForDolar: 500,
    },
    {
      tierKey: "gold",
      tierName: "Gold",
      threshold: 5000,
      currencyValueForDolar: 250,
    },
    {
      tierKey: "diamond",
      tierName: "Diamond",
      threshold: 10000,
      currencyValueForDolar: 100,
    },
  ],

  campaign: [
    {
      promoID: "PROMO-SUMMER-2026",
      promoName: "Summer Rewards Bonus",
      banner: "Earn double points on all summer purchases",
      isActive: true,
    },
    {
      promoID: "PROMO-WELCOME-2026",
      promoName: "Welcome Bonus",
      banner: "Get 500 bonus points when you join",
      isActive: false,
    },
  ],
};

const PATCHABLE_FIELDS = ["rewardDetails", "campaign"];

export async function PATCH(request) {
  const body = await request.json();
  const patch = Object.fromEntries(
    PATCHABLE_FIELDS.filter((field) => body[field] !== undefined).map(
      (field) => [field, body[field]],
    ),
  );

  if (!Object.keys(patch).length) {
    return NextResponse.json(
      { error: `Provide at least one of: ${PATCHABLE_FIELDS.join(", ")}` },
      { status: 400 },
    );
  }

  if (!BACKEND_SERVES_THIS || !BACKEND_URL) {
    Object.assign(PLACEHOLDER_LOYALTY_CONFIG, patch);
    return NextResponse.json(PLACEHOLDER_LOYALTY_CONFIG);
  }

  try {
    const res = await fetch(`${BACKEND_URL}/loyalty-config`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
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

export async function GET() {
  if (!BACKEND_SERVES_THIS || !BACKEND_URL) {
    return NextResponse.json(PLACEHOLDER_LOYALTY_CONFIG);
  }

  try {
    const res = await fetch(`${BACKEND_URL}/loyalty-config`, {
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
