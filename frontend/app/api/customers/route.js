import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

// TEMPORARY: seed data lives here until the backend serves it.
// Once BACKEND_URL is available, delete this and use the fetch below.
export const PLACEHOLDER_CUSTOMERS = [
  {
    _id: {
      $oid: "6a8b7dae2a2acd3c667c0739",
    },
    CustomerID: "CUST-10002",
    photo: "/rsc/users/66fe219d625d93a100528224.png",
    profile: {
      gender: "Male",
      firstName: "Liam",
      lastName: "Chen",
      email: "liam.chen@example.com",
      phoneNumber: "+1-604-555-0102",
      returning: false,
      dateOfBirth: {
        $date: "1987-08-22T00:00:00.000Z",
      },
      "field-2": "Vancouver",
      "field-3": "Frequent buyer",
    },
    addresses: [
      {
        type: "home",
        line1: "880 West Pender Street",
        city: "Vancouver",
        state: "BC",
        postalCode: "V6C 3B6",
        country: "Canada",
        isDefault: true,
      },
    ],
    loyaltyDetails: {
      balance: 420,
      totalAmountSpent: 1500,
      lifetimeCoins: 3980,
      activeTier: "Silver",
      nextTier: "Gold",
      tierActivatedAt: "2026-01-09T10:15:00.000Z",
      rewardsExpiry: {
        $date: "2026-10-15T23:59:59.000Z",
      },
      loyaltyHistory: [
        {
          date: {
            $date: "2026-08-01T20:10:00.000Z",
          },
          type: "earn",
          points: 120,
          description: "Home goods purchase",
        },
      ],
    },
    paymentDetails: {
      preferredMethod: "Credit Card",
      cardType: "Visa",
      cardLast4: "1234",
      cardExpiry: "12/25",
    },
    preferences: {
      isActive: true,
      communication: {
        email: true,
        text: false,
      },

      marketing: {
        isNewsletterSubscribed: true,
        notifyPromotions: false,
      },
    },
    createdAt: {
      $date: "2025-01-18T15:45:00.000Z",
    },
    sessionId: "sess_cust10002_b2k9",
  },
  {
    _id: {
      $oid: "6a8b7dae2a2acd3c667c073c",
    },
    photo: "/rsc/users/65a546ae4a8f64e8f88fb89e.png",
    CustomerID: "CUST-10005",
    profile: {
      firstName: "Mia",
      lastName: "Thompson",
      gender: "Female",
      interests: ["Baby Care", "Cleaning & Household"],
      email: "mia.thompson@example.com",
      phoneNumber: "+1-613-555-0105",
      returning: true,
      dateOfBirth: {
        $date: "1999-01-17T00:00:00.000Z",
      },
      "field-2": "Ottawa",
      "field-3": "Value seeker",
    },
    addresses: [
      {
        type: "home",
        line1: "75 Elgin Street",
        city: "Ottawa",
        state: "ON",
        postalCode: "K1P 5W1",
        country: "Canada",
        isDefault: true,
      },
    ],
    loyaltyDetails: {
      balance: 1260,
      lifetimeCoins: 7450,
      totalAmountSpent: 2800,
      activeTier: "Gold",
      nextTier: "Diamond",
      tierActivatedAt: "2025-12-19T16:45:00.000Z",
      rewardsExpiry: {
        $date: "2026-11-30T23:59:59.000Z",
      },
      loyaltyHistory: [
        {
          date: {
            $date: "2026-08-13T14:00:00.000Z",
          },
          type: "earn",
          points: 315,
          description: "Beauty and personal care purchase",
        },
        {
          date: {
            $date: "2026-03-08T13:30:00.000Z",
          },
          type: "earn",
          points: 180,
          description: "Spring promotion bonus",
        },
      ],
    },
    paymentDetails: {
      preferredMethod: "Credit Card",
      cardType: "Visa",
      cardLast4: "1234",
      cardExpiry: "12/25",
    },

    preferences: {
      isActive: true,
      communication: {
        email: true,
        text: true,
      },
      marketing: {
        isNewsletterSubscribed: true,
        notifyPromotions: true,
      },
    },
    createdAt: {
      $date: "2024-11-25T18:10:00.000Z",
    },
    sessionId: "sess_cust10005_e3r7",
  },
  {
    _id: {
      $oid: "6a8b7dae2a2acd3c667c0741",
    },
    CustomerID: "CUST-10010",
    photo: "/rsc/users/671ff0081ec726b417352702.png",
    profile: {
      firstName: "Lucas",
      lastName: "Wilson",
      gender: "Male",
      interests: ["Electronics"],
      email: "lucas.wilson@example.com",
      phoneNumber: "+1-416-555-0110",
      returning: true,
      dateOfBirth: {
        $date: "1989-02-18T00:00:00.000Z",
      },
      "field-2": "Toronto",
      "field-3": "Premium member",
    },
    addresses: [
      {
        type: "home",
        line1: "410 Bloor Street East",
        city: "Toronto",
        state: "ON",
        postalCode: "M4W 3T3",
        country: "Canada",
        isDefault: true,
      },
    ],
    loyaltyDetails: {
      balance: 10950,
      lifetimeCoins: 45600,
      totalAmountSpent: 2500,
      activeTier: "Diamond",
      nextTier: "Diamond",
      tierActivatedAt: "2024-10-01T08:45:00.000Z",
      rewardsExpiry: {
        $date: "2027-03-31T23:59:59.000Z",
      },
      loyaltyHistory: [
        {
          date: {
            $date: "2026-08-20T18:50:00.000Z",
          },
          type: "earn",
          points: 1250,
          description: "Premium customer purchase",
        },
        {
          date: {
            $date: "2026-04-22T15:00:00.000Z",
          },
          type: "redeem",
          points: -2000,
          description: "Redeemed premium reward",
        },
      ],
    },
    paymentDetails: {
      preferredMethod: "Credit Card",
      cardType: "Visa",
      cardLast4: "1234",
      cardExpiry: "12/25",
    },
    preferences: {
      isActive: true,
      communication: {
        email: true,
        text: true,
      },
      marketing: {
        isNewsletterSubscribed: true,
        notifyPromotions: false,
      },
    },
    createdAt: {
      $date: "2022-07-19T13:35:00.000Z",
    },
    sessionId: "sess_cust10010_k4z7",
  },
  {
    _id: {
      $oid: "6a8b7dae2a2acd3c667c0738",
    },
    CustomerID: "CUST-10001",
    photo: "/rsc/users/671ff2451ec726b417352703.png",
    profile: {
      firstName: "Ava",
      lastName: "Smith",
      gender: "Female",
      interests: ["Electronics"],
      email: "ava.smith@example.com",
      phoneNumber: "+1-416-555-0101",
      returning: true,
      dateOfBirth: {
        $date: "1992-03-14T00:00:00.000Z",
      },
      "field-2": "Toronto",
      "field-3": "Retail shopper",
    },
    addresses: [
      {
        type: "home",
        line1: "125 King Street West",
        city: "Toronto",
        state: "ON",
        postalCode: "M5X 1A9",
        country: "Canada",
        isDefault: true,
      },
    ],
    loyaltyDetails: {
      balance: 1840,
      lifetimeCoins: 12650,
      totalAmountSpent: 3200,
      activeTier: "Gold",
      nextTier: "Platinum",
      tierActivatedAt: "2025-11-02T14:30:00.000Z",
      rewardsExpiry: {
        $date: "2026-12-31T23:59:59.000Z",
      },
      loyaltyHistory: [
        {
          date: {
            $date: "2026-07-18T16:20:00.000Z",
          },
          type: "earn",
          points: 240,
          description: "Summer apparel purchase",
        },
        {
          date: {
            $date: "2026-05-03T18:05:00.000Z",
          },
          type: "redeem",
          points: -500,
          description: "Redeemed digital reward",
        },
      ],
    },
    paymentDetails: {
      preferredMethod: "Credit Card",
      cardType: "Visa",
      cardLast4: "1234",
      cardExpiry: "12/25",
    },
    preferences: {
      isActive: true,
      communication: {
        email: true,
        text: true,
      },
      marketing: {
        isNewsletterSubscribed: true,
        notifyPromotions: true,
      },
    },
    createdAt: {
      $date: "2024-02-11T13:15:00.000Z",
    },
    sessionId: "sess_cust10001_a7f3",
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
