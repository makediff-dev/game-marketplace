import { formatPrice } from "./products";

export interface VariableUnitPricing {
  unitSize: number;
  unitName: string;
  pricePerUnit: number;
  minAmount: number;
  maxAmount: number;
  step?: number;
}

const VARIABLE_UNIT_CATEGORY_IDS = new Set([
  "currency",
  "gems",
  "robux",
  "uc",
  "gold",
  "голда",
  "diamonds",
  "алмазы",
  "coins",
  "монеты",
]);

const VARIABLE_UNIT_CATEGORY_LABELS = new Set([
  "игровая валюта",
  "гемы",
  "робуксы",
  "robux",
  "uc",
  "голда",
  "алмазы",
  "монеты",
  "coins",
  "пополнение",
]);

const defaultUnitNames: Record<string, string> = {
  currency: "ед.",
  gems: "гемов",
  robux: "Robux",
  uc: "UC",
  gold: "голды",
  голда: "голды",
  diamonds: "алмазов",
  алмазы: "алмазов",
  монеты: "монет",
  coins: "монет",
};

const VARIABLE_UNIT_LABEL_PATTERN =
  /валют|robux|робук|гем|голд|алмаз|монет|coin|gem|gold|star|звезд|звёзд|uc|пополн/i;

export function isVariableUnitCategory(
  categoryId?: string | null,
  categoryLabel?: string | null,
): boolean {
  const normalizedId = categoryId?.toLowerCase().trim();
  const normalizedLabel = categoryLabel?.toLowerCase().trim();

  if (normalizedId && VARIABLE_UNIT_CATEGORY_IDS.has(normalizedId)) {
    return true;
  }

  if (normalizedLabel && VARIABLE_UNIT_CATEGORY_LABELS.has(normalizedLabel)) {
    return true;
  }

  if (normalizedLabel && VARIABLE_UNIT_LABEL_PATTERN.test(normalizedLabel)) {
    return true;
  }

  if (normalizedId && VARIABLE_UNIT_LABEL_PATTERN.test(normalizedId)) {
    return true;
  }

  return false;
}

export function getDefaultUnitName(
  categoryId?: string | null,
  categoryLabel?: string | null,
): string {
  if (categoryId) {
    const fromId = defaultUnitNames[categoryId.toLowerCase()];
    if (fromId) {
      return fromId;
    }
  }

  if (categoryLabel) {
    const lower = categoryLabel.toLowerCase();
    const fromLabel = defaultUnitNames[lower];
    if (fromLabel) {
      return fromLabel;
    }

    return categoryLabel.toLowerCase();
  }

  return "ед.";
}

export function getDefaultVariableUnitPricing(
  categoryId?: string | null,
  categoryLabel?: string | null,
): VariableUnitPricing {
  const unitName = getDefaultUnitName(categoryId, categoryLabel);

  return {
    unitSize: 1000,
    unitName,
    pricePerUnit: 100,
    minAmount: 100000,
    maxAmount: 150000,
    step: 1000,
  };
}

export function hasVariableUnitPricing(
  product: { variablePricing?: VariableUnitPricing | null },
): product is { variablePricing: VariableUnitPricing } {
  return Boolean(product.variablePricing);
}

export function getVariableUnitStep(pricing: VariableUnitPricing): number {
  return pricing.step ?? pricing.unitSize;
}

export function clampVariableUnitAmount(
  amount: number,
  pricing: VariableUnitPricing,
): number {
  const step = getVariableUnitStep(pricing);
  const clamped = Math.min(pricing.maxAmount, Math.max(pricing.minAmount, amount));
  const stepsFromMin = Math.round((clamped - pricing.minAmount) / step);

  return pricing.minAmount + stepsFromMin * step;
}

export function calculateVariableUnitTotal(
  amount: number,
  pricing: VariableUnitPricing,
): number {
  const safeAmount = clampVariableUnitAmount(amount, pricing);
  return Math.round((safeAmount / pricing.unitSize) * pricing.pricePerUnit);
}

export function calculateVariableUnitAmountFromTotal(
  total: number,
  pricing: VariableUnitPricing,
): number {
  if (!pricing.pricePerUnit || !pricing.unitSize) {
    return pricing.minAmount;
  }

  const rawAmount = (total / pricing.pricePerUnit) * pricing.unitSize;
  return clampVariableUnitAmount(Math.round(rawAmount), pricing);
}

export function getVariableUnitRecipientLabel(gameId?: string): string {
  switch (gameId) {
    case "standoff":
    case "pubg":
      return "Player ID";
    case "brawl-stars":
      return "Player Tag";
    case "roblox":
      return "Username Roblox";
    default:
      return "Имя персонажа";
  }
}

export function formatVariableUnitAmount(amount: number, unitName: string): string {
  return `${formatPrice(amount)} ${unitName}`;
}

export function formatVariableUnitRate(pricing: VariableUnitPricing): string {
  return `${formatPrice(pricing.pricePerUnit)} ₽ / ${formatPrice(pricing.unitSize)} ${pricing.unitName}`;
}

export function formatVariableUnitRange(pricing: VariableUnitPricing): string {
  return `от ${formatPrice(pricing.minAmount)} до ${formatPrice(pricing.maxAmount)} ${pricing.unitName}`;
}

export function formatVariableUnitCardPrice(pricing: VariableUnitPricing): string {
  const minTotal = calculateVariableUnitTotal(pricing.minAmount, pricing);
  return `от ${formatPrice(minTotal)} ₽`;
}

export function getVariableUnitCardHint(pricing: VariableUnitPricing): string {
  return formatVariableUnitRate(pricing);
}

export function parseVariableUnitAmountInput(raw: string): number {
  return Number(raw.replace(/\s/g, "").replace(",", ".")) || 0;
}

export function validateVariableUnitAmount(
  amount: number,
  pricing: VariableUnitPricing,
): string | null {
  if (!amount) {
    return "Укажите количество";
  }

  if (amount < pricing.minAmount) {
    return `Минимум — ${formatVariableUnitAmount(pricing.minAmount, pricing.unitName)}`;
  }

  if (amount > pricing.maxAmount) {
    return `Максимум — ${formatVariableUnitAmount(pricing.maxAmount, pricing.unitName)}`;
  }

  const step = getVariableUnitStep(pricing);
  if ((amount - pricing.minAmount) % step !== 0) {
    return `Шаг — ${formatPrice(step)} ${pricing.unitName}`;
  }

  return null;
}
