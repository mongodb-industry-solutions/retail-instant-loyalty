export const TAX_RATE = 0.08;

export function roundCurrency(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function tierByKey(rewardDetails, tierKey) {
  // Customer records carry display-cased tiers ("Silver") while the loyalty
  // config keys them lowercase, so compare case-insensitively.
  const key = tierKey?.toLowerCase();
  return rewardDetails?.find((t) => t.tierKey.toLowerCase() === key);
}

// Dollars redeemed per coin. The loyalty config expresses this as
// currencyValueForDolar (coins per dollar), so invert it.
export function coinDollarValue(tier) {
  if (!tier) return 0;
  if (tier.currencyValue != null) return Number(tier.currencyValue);
  const coinsPerDollar = Number(tier.currencyValueForDollar);
  return coinsPerDollar > 0 ? 1 / coinsPerDollar : 0;
}

export function dollarsForCoins(coins, tierKey, rewardDetails) {
  return coins * coinDollarValue(tierByKey(rewardDetails, tierKey));
}

export function redeemCoverageValue(items, coinsToApply) {
  let remainingCoins = Math.max(0, coinsToApply);
  let coveredValue = 0;
  for (const item of items) {
    if (remainingCoins <= 0) break;
    const itemCoinTotal = item.coinPrice * item.qty;
    const coinsAppliedToItem = Math.min(remainingCoins, itemCoinTotal);
    coveredValue += (coinsAppliedToItem / item.coinPrice) * item.price;
    remainingCoins -= coinsAppliedToItem;
  }
  return roundCurrency(coveredValue);
}

export function tierIndexAt(spend, rewardDetails) {
  let idx = 0;
  for (let i = 0; i < rewardDetails.length; i++) {
    if (spend >= rewardDetails[i].threshold) idx = i;
  }
  return idx;
}
export function getTier(spend, rewardDetails) {
  return rewardDetails[tierIndexAt(spend, rewardDetails)];
}
export function getNextTier(spend, rewardDetails) {
  return rewardDetails[tierIndexAt(spend, rewardDetails) + 1] || null;
}

export function activeCampaignMultiplier(campaign) {
  const active = (campaign || []).find((c) => c.isActive);
  return active ? Number(active.multiplier || 1) : 1;
}

/* ---------- Redeem-from-receipt totals ---------- */
export function computeRedeemTotals(items, balance, tierKey, rewardDetails) {
  const coinTotal = items.reduce((s, i) => s + i.coinPrice * i.qty, 0);
  const merchandiseSubtotal = roundCurrency(
    items.reduce((s, i) => s + i.price * i.qty, 0),
  );
  const coinsUsed = Math.min(balance, coinTotal);
  const fullCoinCoverage = balance >= coinTotal;
  const coveredValue = fullCoinCoverage
    ? merchandiseSubtotal
    : redeemCoverageValue(items, coinsUsed);
  const cashSubtotal = fullCoinCoverage
    ? 0
    : roundCurrency(Math.max(0, merchandiseSubtotal - coveredValue));
  const tax = roundCurrency(cashSubtotal * TAX_RATE);
  const cashTotal = roundCurrency(cashSubtotal + tax);
  return {
    coinTotal,
    merchandiseSubtotal,
    coinsUsed,
    coveredValue,
    cashSubtotal,
    tax,
    cashTotal,
  };
}
