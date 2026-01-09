export type CommissionTier = {
  min: number;
  max: number;
  rate: number; // percentage (e.g., 0.05 for 5%)
};

export const COMMISSION_TIERS: CommissionTier[] = [
  { min: 1, max: 3, rate: 0.05 },
  { min: 4, max: 6, rate: 0.07 },
  { min: 7, max: 10, rate: 0.10 },
  { min: 11, max: 15, rate: 0.14 },
  { min: 16, max: 20, rate: 0.16 },
  { min: 21, max: Infinity, rate: 0.20 },
];

export interface CommissionResult {
  salesCount: number;
  totalRevenue: number;
  commissionRate: number;
  commissionAmount: number;
  currentTier: CommissionTier | null;
  nextTier: CommissionTier | null;
  salesToNextTier: number;
}

export function calculateCommission(salesCount: number, totalRevenue: number): CommissionResult {
  // Find the highest tier that matches the sales count
  // Note: The logic implies if you sell 5 items, ALL items get 7% commission (standard tiered rate structure unless specified as marginal).
  // User prompt: "agar 4-6 ta sotsa 7% bersin" -> implies total commission is 7% of total sales.

  const currentTierIndex = COMMISSION_TIERS.findIndex(
    (tier) => salesCount >= tier.min && salesCount <= tier.max
  );

  // If 0 sales, currentTierIndex might be -1
  const currentTier = currentTierIndex !== -1 ? COMMISSION_TIERS[currentTierIndex] : null;
  
  // If sales > max defined tier (shouldn't happen with Infinity), or just fallback
  // Actually, if salesCount is 0, commission is 0.

  const commissionRate = currentTier ? currentTier.rate : 0;
  const commissionAmount = totalRevenue * commissionRate;

  // Calculate generic next tier info
  // If we are at the last tier (Infinity), there is no next tier.
  const nextTierIndex = currentTierIndex !== -1 ? currentTierIndex + 1 : 0; 
  // If count is 0, next tier is the first one (index 0)

  let nextTier = null;
  let salesToNextTier = 0;

  if (nextTierIndex < COMMISSION_TIERS.length) {
    nextTier = COMMISSION_TIERS[nextTierIndex];
    
    // If we currently have 0 sales, we need nextTier.min - currentSales
    // Valid for all cases
    if (salesCount < nextTier.min) {
        salesToNextTier = nextTier.min - salesCount;
    }
  }

  return {
    salesCount,
    totalRevenue,
    commissionRate,
    commissionAmount,
    currentTier,
    nextTier,
    salesToNextTier,
  };
}
