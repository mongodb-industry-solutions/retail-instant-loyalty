export const TAX_RATE = 0.08;

export function roundCurrency(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function tierByKey(rewardDetails, tierKey) {
  const key = tierKey?.toLowerCase();
  return rewardDetails?.find((t) => t.tierKey.toLowerCase() === key);
}

export function coinDollarValue(tier) {
  if (!tier) return 0;
  if (tier.currencyValue != null) return Number(tier.currencyValue);
  const coinsPerDollar = Number(tier.currencyValueForDollar);
  return coinsPerDollar > 0 ? 1 / coinsPerDollar : 0;
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
