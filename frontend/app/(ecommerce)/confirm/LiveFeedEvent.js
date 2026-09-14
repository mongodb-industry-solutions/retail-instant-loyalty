import { formatPrice, roundCurrency } from "@/lib/helper";

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
  return [
    {
      icon: "🧾",
      title: "Order confirmed",
      body: `${order.orderId} was written to the order record and linked to ${persona.name}'s profile.`,
    },
    {
      icon: "🪙",
      title: "Loyalty balance updated",
      body:
        order.coinsUsed > 0
          ? `${order.loyalty.oldBalance.toLocaleString()} → ${order.loyalty.newBalance.toLocaleString()} coins after applying ${order.loyalty.coinsUsed.toLocaleString()} and earning ${order.coins.toLocaleString()}.`
          : `${order.loyalty.oldBalance.toLocaleString()} → ${order.loyalty.newBalance.toLocaleString()} coins after earning ${persona.loyaltyDetails.balance.toLocaleString()} from the purchase.`,
    },
    {
      icon: "🏷️",
      title: "Tier progress recalculated",
      body: order.loyalty.tierChanged
        ? `${order.loyalty.oldTier} → ${order.loyalty.newTier} after ${formatPrice(order.loyalty.qualifyingSpend)} in qualifying merchandise spend.`
        : `${order.loyalty.newTier} remains active because tiering is based on cumulative merchandise spend, not coin balance.`,
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
