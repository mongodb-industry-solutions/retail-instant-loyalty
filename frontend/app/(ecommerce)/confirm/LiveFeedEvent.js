import { formatPrice, roundCurrency } from "@/lib/helper";

export const PLACEMENT_MS = 1800;
export const FEED_INTERVAL_MS = 300;

export const placementDelay = (index, count) =>
  ((index + 1) * PLACEMENT_MS) / count;
export const feedDelay = (index) => PLACEMENT_MS + index * FEED_INTERVAL_MS;

export function liveFeedEventsForOrder(order, persona) {
  if (!order || !persona) return [];
  if (order.type === "redeem") {
    const cashDue = roundCurrency(order.cashDue || 0);
    const rewardCount = order.items.length;
    return [
      {
        icon: "🎁",
        title: "Reward order confirmed",
        body: `${order.id} was created for ${rewardCount} reward item${rewardCount === 1 ? "" : "s"} in the same confirmation flow.`,
      },
      {
        icon: "🪙",
        title: "Loyalty balance updated",
        body: `${order.balanceBefore.toLocaleString()} → ${order.balanceAfter.toLocaleString()} coins after redeeming ${order.coinsUsed.toLocaleString()} coins.`,
      },
      {
        icon: "💳",
        title: "Payment settled",
        body:
          cashDue > 0
            ? `${order.coinsUsed.toLocaleString()} coins were applied first, and the remaining ${formatPrice(cashDue)} was charged to the saved card.`
            : "No card charge was needed because the redemption was fully covered with loyalty coins.",
      },
      {
        icon: "📦",
        title: "Fulfillment prepared",
        body: `The reward order now shows ${order.shipBy.toLowerCase()} with tracking ${order.tracking}.`,
      },
      {
        icon: "🔄",
        title: "Customer view refreshed",
        body: "Order history, loyalty balance, and eligible reward offers now reflect the confirmed redemption.",
      },
    ];
  }
  const loyalty = order.loyalty ?? {};
  const oldBalance = (loyalty.oldBalance ?? 0).toLocaleString();
  const newBalance = (loyalty.newBalance ?? 0).toLocaleString();
  const fullName =
    `${persona.profile?.firstName ?? ""} ${persona.profile?.lastName ?? ""}`.trim();

  return [
    {
      icon: "🧾",
      title: "Order confirmed",
      body: `${order.orderId} was written to the order record and linked to ${fullName}'s profile.`,
    },
    {
      icon: "🪙",
      title: "Loyalty balance updated",
      body:
        order.coinsApplied > 0
          ? `${oldBalance} → ${newBalance} coins after applying ${order.coinsApplied.toLocaleString()} and earning ${(order.coinsEarned ?? 0).toLocaleString()}.`
          : `${oldBalance} → ${newBalance} coins after earning ${(order.coinsEarned ?? 0).toLocaleString()} from the purchase.`,
    },
    {
      icon: "🏷️",
      title: "Tier progress recalculated",
      body:
        loyalty.newTier !== loyalty.oldTier
          ? `${loyalty.oldTier} → ${loyalty.newTier} after ${formatPrice(loyalty.qualifyingSpend)} in qualifying merchandise spend.`
          : `${loyalty.newTier} remains active because tiering is based on cumulative merchandise spend, not coin balance.`,
    },
    {
      icon: "📚",
      title: "Order history refreshed",
      body: "The new order is immediately available in My Orders and the customer profile.",
    },
    {
      icon: "🔄",
      title: "Customer view refreshed",
      body: "Recommendations, loyalty surfaces, and the receipt now reflect the latest order and loyalty state.",
    },
  ];
}
