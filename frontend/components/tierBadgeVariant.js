const VARIANTS = {
  new: "LightGray",
  bronze: "DarkGray",
  silver: "LightGray",
  gold: "Yellow",
  platinum: "Blue",
  diamond: "Purple",
};

export function tierBadgeVariant(key) {
  // Tiers arrive display-cased ("Silver") from customer records and lowercase
  // ("silver") from the loyalty config, so normalise before looking up.
  return VARIANTS[key?.toLowerCase()] || "primary";
}
