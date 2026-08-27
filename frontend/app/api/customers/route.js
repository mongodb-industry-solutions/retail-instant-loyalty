import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

// TEMPORARY: seed data lives here until the backend serves it.
// Once BACKEND_URL is available, delete this and use the fetch below.
const PLACEHOLDER_CUSTOMERS = [
  {
    id: "mike",
    name: "Mike",
    initial: "M",
    avatarBg: "#DCEBFF",
    avatarColor: "#2955A8",
    photo: "/rsc/users/66fe219d625d93a100528224.png",
    role: "Software engineer & gear enthusiast",
    tags: ["Electronics", "Gaming", "Productivity"],
    returning: true,
    coins: 3240,
    tierSpend: 2800,
    orders: 3,
    interests: ["Electronics"],
    ship: {
      first: "Mike",
      last: "Chen",
      email: "mike.chen@email.com",
      address: "214 Harbor View Dr, Apt 5",
      city: "Austin, TX 73301",
    },
    card: "4471",
    exp: "11/28",
    transactions: [
      { type: "earned", orderId: "MS-118820", label: "Order MS-118820", delta: 1200, balanceAfter: 1200 },
      { type: "earned", orderId: "MS-225143", label: "Order MS-225143", delta: 980, balanceAfter: 2180 },
      { type: "earned", orderId: "MS-309981", label: "Order MS-309981", delta: 1060, balanceAfter: 3240 },
    ],
    orderHistory: [
      { id: "MS-118820", type: "purchase", itemRefs: [{ id: "kb", qty: 1 }, { id: "dock", qty: 1 }], coins: 1200, subtotal: 268, status: "Delivered" },
      { id: "MS-225143", type: "purchase", itemRefs: [{ id: "hp", qty: 1 }], coins: 980, subtotal: 299, status: "Delivered" },
      { id: "MS-309981", type: "purchase", itemRefs: [{ id: "mon", qty: 1 }, { id: "watch", qty: 1 }], coins: 1060, subtotal: 848, status: "Delivered" },
    ],
  },
  {
    id: "lily",
    name: "Lily",
    photo: "/rsc/users/65a546ae4a8f64e8f88fb89e.png",
    role: "Fitness coach & wellness advocate",
    tags: ["Sports", "Health", "Outdoor"],
    returning: false,
  },
  {
    id: "jane",
    name: "Jane",
    initial: "J",
    avatarBg: "#EAE1FC",
    avatarColor: "#6B3AB3",
    photo: "/rsc/users/671ff0081ec726b417352702.png",
  },
  {
    id: "claude",
    name: "Claude",
    initial: "C",
    avatarBg: "#FCF0D2",
    avatarColor: "#9A7A1D",
    photo: "/rsc/users/671ff2451ec726b417352703.png",
  },
];

export async function GET() {
  if (!BACKEND_URL) {
    return NextResponse.json(PLACEHOLDER_CUSTOMERS);
  }

  try {
    const res = await fetch(`${BACKEND_URL}/customers`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Backend responded with ${res.status}` },
        { status: res.status }
      );
    }

    return NextResponse.json(await res.json());
  } catch (err) {
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 502 }
    );
  }
}
