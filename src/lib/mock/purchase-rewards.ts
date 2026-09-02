import { formatPrice } from "@/lib/mock/products";

export interface PurchaseRewardTier {
  minAmount: number;
  cashbackPercent: number;
}

export const purchaseRewardTiers: PurchaseRewardTier[] = [
  { minAmount: 0, cashbackPercent: 1 },
  { minAmount: 5000, cashbackPercent: 2 },
  { minAmount: 15000, cashbackPercent: 3 },
  { minAmount: 30000, cashbackPercent: 5 },
];

export const mockPurchaseTotal = 12890;

export interface PurchaseRewardProgress {
  totalPurchases: number;
  currentPercent: number;
  nextPercent: number | null;
  nextGoalAmount: number | null;
  progressPercent: number;
  remainingAmount: number;
}

function getCurrentTier(total: number): PurchaseRewardTier {
  let current = purchaseRewardTiers[0];

  for (const tier of purchaseRewardTiers) {
    if (total >= tier.minAmount) {
      current = tier;
    }
  }

  return current;
}

function getNextTier(total: number): PurchaseRewardTier | null {
  return purchaseRewardTiers.find((tier) => tier.minAmount > total) ?? null;
}

export function getPurchaseRewardProgress(
  totalPurchases = mockPurchaseTotal,
): PurchaseRewardProgress {
  const currentTier = getCurrentTier(totalPurchases);
  const nextTier = getNextTier(totalPurchases);

  if (!nextTier) {
    return {
      totalPurchases,
      currentPercent: currentTier.cashbackPercent,
      nextPercent: null,
      nextGoalAmount: null,
      progressPercent: 100,
      remainingAmount: 0,
    };
  }

  const rangeStart = currentTier.minAmount;
  const rangeEnd = nextTier.minAmount;
  const progressPercent = Math.min(
    100,
    Math.round(((totalPurchases - rangeStart) / (rangeEnd - rangeStart)) * 100),
  );

  return {
    totalPurchases,
    currentPercent: currentTier.cashbackPercent,
    nextPercent: nextTier.cashbackPercent,
    nextGoalAmount: nextTier.minAmount,
    progressPercent,
    remainingAmount: Math.max(0, nextTier.minAmount - totalPurchases),
  };
}

export function formatPurchaseAmount(amount: number): string {
  return `${formatPrice(amount)} ₽`;
}

export function formatPurchaseAmountCompact(amount: number): string {
  if (amount === 0) {
    return "0 ₽";
  }

  if (amount >= 1000) {
    return `${Math.round(amount / 1000)}k ₽`;
  }

  return `${formatPrice(amount)} ₽`;
}

export interface PurchaseRewardStage {
  percent: number;
  amount: number;
  fillPercent: number;
}

export function getPurchaseRewardStages(
  totalPurchases = mockPurchaseTotal,
): PurchaseRewardStage[] {
  return purchaseRewardTiers.map((tier, index) => {
    const nextTier = purchaseRewardTiers[index + 1];
    const rangeStart = tier.minAmount;
    const rangeEnd = nextTier?.minAmount ?? tier.minAmount;

    let fillPercent = 100;

    if (nextTier) {
      if (totalPurchases <= rangeStart) {
        fillPercent = 0;
      } else if (totalPurchases >= rangeEnd) {
        fillPercent = 100;
      } else {
        fillPercent = ((totalPurchases - rangeStart) / (rangeEnd - rangeStart)) * 100;
      }
    } else if (totalPurchases < rangeStart) {
      fillPercent = 0;
    }

    return {
      percent: tier.cashbackPercent,
      amount: tier.minAmount,
      fillPercent,
    };
  });
}
