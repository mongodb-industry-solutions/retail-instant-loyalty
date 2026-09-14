import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

// TEMPORARY: seed data lives here until the backend serves it.
// Once BACKEND_URL is available, delete this and use the fetch below.
const PLACEHOLDER_REDEEM_CANDIDATES = [
  {
    productId: "40131171",
    name: "Premium Care Diaper Pants - Extra Large, 12-17 kg, Lotion with Aloe Vera",
    brand: "Pampers",
    category: "Baby Care",
    price: 26.63,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e161468f.png",
    coinPrice: 13315,
    cashSubtotal: 0,
  },
  {
    productId: "100316308",
    name: "Baby Lotion",
    brand: "Himalaya",
    category: "Baby Care",
    price: 8.42,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e161468f.png",
    coinPrice: 4210,
    cashSubtotal: 0,
  },
  {
    productId: "40045678",
    name: "Trail Runner Jacket",
    brand: "Leafy Outdoors",
    category: "Apparel",
    price: 99.98,
    currency: "USD",
    imageURL:
      "https://d1n5xguust3bkl.cloudfront.net/products/685bfe2b3d832cf7e161468f.png",
    coinPrice: 49990,
    cashSubtotal: 24.99,
  },
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  const exclude = (searchParams.get("exclude") ?? "")
    .split(",")
    .filter(Boolean);

  if (!BACKEND_URL) {
    const candidates = PLACEHOLDER_REDEEM_CANDIDATES.filter(
      (candidate) => !exclude.includes(candidate.productId),
    );
    return NextResponse.json({
      show: candidates.length > 0,
      tier: { tierKey: "gold", tierName: "Gold", coinValueLabel: "0.4¢" },
      candidates,
    });
  }

  try {
    const qs = new URLSearchParams();
    if (customerId) qs.set("customerId", customerId);
    if (exclude.length) qs.set("exclude", exclude.join(","));
    const query = qs.size ? `?${qs}` : "";

    const res = await fetch(`${BACKEND_URL}/redeem/candidates${query}`, {
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
