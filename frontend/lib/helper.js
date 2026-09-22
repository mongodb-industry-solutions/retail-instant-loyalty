import {
  TAX_RATE,
  roundCurrency,
  tierByKey,
  coinDollarValue,
  dollarsForCoins,
  getTier,
  activeCampaignMultiplier,
  computeRedeemTotals,
} from "@/shared/pricing";
export { TAX_RATE, roundCurrency, getTier };
export { getNextTier } from "@/shared/pricing";

export const API_URL="http://localhost:8000"

export function formatPrice(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return "—";
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

export function promoDateWindow(campaignEntry) {
  return `${formatPromoDate(campaignEntry.startDate)} – ${formatPromoDate(campaignEntry.endDate)}`;
}
export function formatPromoDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function tierProgressValue(personaObj) {
  return roundCurrency(personaObj?.loyaltyDetails.cumulativeSpendDollars || 0);
}
export function currentTierFor(personaObj, rewardDetails) {
  return getTier(tierProgressValue(personaObj), rewardDetails);
}

// Carts

export function cartItemList(cart, products) {
  return Object.entries(cart).map(([productId, quantity]) => {
    const product = products.find((p) => p.productId === productId);
    return {
      ...product,
      cartQuantity: quantity,
    };
  });
}

export function findTierDetails(rewardDetails, tierKey) {
  // config keys them lowercase, so compare case-insensitively.
  const key = tierKey?.toLowerCase();
  return rewardDetails?.find((t) => t.tierKey.toLowerCase() === key);
}

export function formatCoinValue(tierKey, rewardDetails) {
  const tier = tierByKey(rewardDetails, tierKey);
  if (!tier) return "—";

  const cents = roundCurrency(coinDollarValue(tier) * 100);
  const label = Number.isInteger(cents)
    ? cents.toFixed(0)
    : cents.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return `${label}¢`;
}

/* ---------- Document viewer helpers ---------- */
export function docToJSON(doc) {
  let json = JSON.stringify(doc, null, 2);
  return json.replace(/"(ObjectId|ISODate)\(\\"(.*?)\\"\)"/g, '$1("$2")');
}
export function productDocFor(pr) {
  return {
    _id: `ObjectId("64f1a2${pr.id}0000000001")`,
    name: pr.name,
    category: pr.cat,
    price: pr.price,
    ...(pr.was ? { compareAtPrice: pr.was } : {}),
    rating: pr.rating,
    reviews: pr.reviews,
    ...(pr.badge ? { badge: pr.badge } : {}),
  };
}
export function personaFullName(persona) {
  return `${persona.profile?.firstName ?? ""} ${persona.profile?.lastName ?? ""}`.trim();
}

function personaTier(persona, rewardDetails) {
  return persona.isAlwaysNewUser
    ? null
    : currentTierFor(persona, rewardDetails);
}

export function userLoyaltyDocFor(persona, rewardDetails) {
  const tier = personaTier(persona, rewardDetails);
  const address = persona.addresses?.[0];
  const loyalty = persona.loyaltyDetails ?? {};
  return {
    _id: `ObjectId("${persona.customerId}")`,
    name: personaFullName(persona),
    email: persona.profile?.email,
    shipping_address: address ? `${address.line1}, ${address.city}` : null,
    loyalty: {
      tier: tier ? tier.tierKey : "none",
      tier_progress_spend: loyalty.cumulativeSpendDollars || 0,
      coins: loyalty.coinBalance,
      coin_value_cents: tier ? Math.round(coinDollarValue(tier) * 100) : null,
      recent_transactions: (loyalty.loyaltyHistory || [])
        .slice(-2)
        .map((t) => ({
          type: t.type,
          delta: t.delta,
          order_id: t.orderId,
          channel: "online",
        })),
    },
  };
}
export function loyaltySyncDocFor(persona, rewardDetails) {
  const tier = personaTier(persona, rewardDetails);
  const loyalty = persona.loyaltyDetails ?? {};
  return {
    _id: `ObjectId("${persona.customerId}")`,
    name: personaFullName(persona),
    loyalty: {
      tier: tier ? tier.tierKey : "none",
      tier_progress_spend: loyalty.cumulativeSpendDollars || 0,
      coins: loyalty.coinBalance,
      updated_at: `ISODate("${new Date().toISOString()}")`,
    },
  };
}

export function seededStock(seedStr) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++)
    h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  return h % 40;
}
