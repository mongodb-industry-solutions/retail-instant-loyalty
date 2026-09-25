export const CAT_COLOR = {
  "Baby Care": { bg: "#E9F1FF" },
  "Cleaning & Household": { bg: "#EFEFEF" },
};

// The /sessions projection gives us a gender but no photo, so personas are
// illustrated from the fixed set in public/rsc/users. Only one of the four
// illustrations reads male, so two male personas in the same draw will share
// a picture.
const PERSONA_AVATARS = {
  female: [
    "/rsc/users/65a546ae4a8f64e8f88fb89e.png",
    "/rsc/users/671ff0081ec726b417352702.png",
  ],
  male: [
    "/rsc/users/671ff2451ec726b417352703.png",
    "/rsc/users/66fe219d625d93a100528224.png",
  ],
};

// `index` spreads personas of the same gender across the available
// illustrations instead of repeating the first one.
export function personaAvatar(gender, index = 0) {
  const pool =
    PERSONA_AVATARS[String(gender).toLowerCase()] ?? PERSONA_AVATARS.female;
  return pool[index % pool.length];
}

export const PROMO_HOLIDAYS = [
  {
    key: "back_to_school",
    label: "Back to School",
    defaultName: "Back to School Boost",
  },
  {
    key: "labour_day",
    label: "Labour Day",
    defaultName: "Labour Day Loyalty Event",
  },
  {
    key: "black_friday",
    label: "Black Friday",
    defaultName: "Black Friday Double Coins",
  },
  {
    key: "boxing_day",
    label: "Boxing Day",
    defaultName: "Boxing Day Bonus Event",
  },
  {
    key: "holiday",
    label: "Holiday Season",
    defaultName: "Holiday Shopping Boost",
  },
];

export const TIER_BENEFITS = {
  bronze: [
    "Earn loyalty coins on every order",
    "Access to member pricing drops",
    "Entry point into the loyalty program",
  ],
  silver: [
    "Higher coin redemption value",
    "Priority access to seasonal launches",
    "Faster progress toward premium rewards",
  ],
  gold: [
    "Enhanced coin value on redemption",
    "Free shipping on qualifying orders",
    "Early access to select product bundles",
  ],
  platinum: [
    "Top coin value before Diamond",
    "VIP merchandising and curated picks",
    "Premium support routing for account issues",
  ],
  diamond: [
    "Best coin redemption value",
    "First access to limited collections",
    "Top-tier VIP treatment and concierge-style support",
  ],
};

export const ORDER_STATUS_STAGES = [
  "authorizing",
  "placed",
  "processing",
  "shipped",
  "delivered",
];
