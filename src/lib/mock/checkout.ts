import { mockOrders } from "./orders";
import { formatPrice, products, type Product } from "./products";
import type { ProductDetail } from "./product-details";
import {
  calculateVariableUnitTotal,
  clampVariableUnitAmount,
  formatVariableUnitCardPrice,
  formatVariableUnitRate,
  hasVariableUnitPricing,
  validateVariableUnitAmount,
  type VariableUnitPricing,
} from "./variable-pricing";

export type { VariableUnitPricing };

export const CHECKOUT_COMMENT_MAX_LENGTH = 500;

export type CheckoutOfferType = "service" | "unit" | "variable-unit";

export const checkoutOfferTypeLabels: Record<CheckoutOfferType, string> = {
  service: "Услуга",
  unit: "Единица товара",
  "variable-unit": "Игровая валюта",
};

const SERVICE_CATEGORIES = new Set(["Услуги", "Буст", "Дизайн", "Аренда"]);

function normalizeCategory(category: string): string {
  if (SERVICE_CATEGORIES.has(category)) {
    return category;
  }

  const lower = category.toLowerCase();

  for (const serviceCategory of SERVICE_CATEGORIES) {
    if (serviceCategory.toLowerCase() === lower) {
      return serviceCategory;
    }
  }

  return category;
}

export function resolveCheckoutOfferType(
  category: string,
  product?: Pick<Product, "variablePricing">,
): CheckoutOfferType {
  if (product && hasVariableUnitPricing(product)) {
    return "variable-unit";
  }

  return SERVICE_CATEGORIES.has(normalizeCategory(category)) ? "service" : "unit";
}

export function resolveProductOfferType(
  product: Pick<Product, "category" | "variablePricing"> & { offerType?: CheckoutOfferType },
): CheckoutOfferType {
  if (product.offerType === "variable-unit" || hasVariableUnitPricing(product)) {
    return "variable-unit";
  }

  return product.offerType ?? resolveCheckoutOfferType(product.category, product);
}

const productUnitLabelsByCategory: Partial<Record<string, string>> = {
  Скины: "скин",
  "Prime Status": "активацию",
  Пропуск: "пропуск",
  Другое: "единицу",
};

export function getProductUnitLabel(
  product: Pick<Product, "category" | "unitLabel">,
): string | undefined {
  if (product.unitLabel) {
    return product.unitLabel;
  }

  return productUnitLabelsByCategory[product.category];
}

export function getProductCardPriceParts(
  product: Pick<Product, "category" | "price" | "unitLabel" | "variablePricing"> & {
    offerType?: CheckoutOfferType;
  },
): { price: string; unitHint?: string } {
  const offerType = resolveProductOfferType(product);

  if (offerType === "variable-unit" && product.variablePricing) {
    return {
      price: formatVariableUnitCardPrice(product.variablePricing),
      unitHint: formatVariableUnitRate(product.variablePricing),
    };
  }

  const price = `${formatPrice(product.price)} ₽`;

  if (offerType === "service") {
    return { price };
  }

  const unitLabel = getProductUnitLabel(product);

  if (!unitLabel) {
    return { price };
  }

  return {
    price,
    unitHint: `за 1 ${unitLabel}`,
  };
}

export function formatProductPrice(price: number, offerType: CheckoutOfferType): string {
  const formatted = formatPrice(price);

  if (offerType === "variable-unit") {
    return `${formatted} ₽`;
  }

  return offerType === "unit" ? `${formatted} ₽ / шт.` : `${formatted} ₽`;
}

export function formatProductPriceFromProduct(
  product: Pick<Product, "category" | "price"> & { offerType?: CheckoutOfferType },
): string {
  return formatProductPrice(product.price, resolveProductOfferType(product));
}

export function getPrimaryCheckoutItemId(productId: string): string {
  return `cart-${productId}`;
}

export interface CheckoutCartItem {
  id: string;
  productId: string;
  category: string;
  categoryLabel: string;
  offerType: CheckoutOfferType;
  title: string;
  subtitle?: string;
  image: string;
  price: number;
  quantity: number;
  purchaseAmount?: number;
  variablePricing?: VariableUnitPricing;
}

const defaultCheckoutItemIds = ["cs2-2", "cs2-3", "cs2-5"];

function splitProductTitle(title: string): { title: string; subtitle?: string } {
  const parts = title.split(" + ");

  if (parts.length > 1) {
    return {
      title: parts[0],
      subtitle: `+ ${parts.slice(1).join(" + ")}`,
    };
  }

  return { title };
}

function resolveCartItemOfferType(
  product:
    | Pick<ProductDetail, "category" | "offerType" | "variablePricing">
    | Pick<Product, "category" | "variablePricing"> & { offerType?: CheckoutOfferType },
): CheckoutOfferType {
  return resolveProductOfferType(product);
}

function productToCartItem(product: Product, quantity = 1): CheckoutCartItem {
  const { title, subtitle } = splitProductTitle(product.title);

  return {
    id: `cart-${product.id}`,
    productId: product.id,
    category: product.category,
    categoryLabel: product.category.toUpperCase(),
    offerType: resolveCartItemOfferType(product),
    title,
    subtitle,
    image: product.image,
    price: product.price,
    quantity,
  };
}

export function getCheckoutItemLineTotal(item: CheckoutCartItem): number {
  if (item.offerType === "variable-unit" && item.variablePricing && item.purchaseAmount) {
    return calculateVariableUnitTotal(item.purchaseAmount, item.variablePricing);
  }

  return item.price * item.quantity;
}

export function buildCheckoutCartItems(
  primaryProduct: ProductDetail,
  options?: { primaryPurchaseAmount?: number },
): CheckoutCartItem[] {
  const offerType = resolveCartItemOfferType(primaryProduct);
  const { title, subtitle } = splitProductTitle(primaryProduct.title);
  const variablePricing = primaryProduct.variablePricing;
  const purchaseAmount =
    offerType === "variable-unit" && variablePricing
      ? clampVariableUnitAmount(
          options?.primaryPurchaseAmount ?? variablePricing.minAmount,
          variablePricing,
        )
      : undefined;
  const primaryPrice =
    offerType === "variable-unit" && variablePricing && purchaseAmount
      ? calculateVariableUnitTotal(purchaseAmount, variablePricing)
      : primaryProduct.price;

  const primaryItem: CheckoutCartItem = {
    id: `cart-${primaryProduct.id}`,
    productId: primaryProduct.id,
    category: primaryProduct.category,
    categoryLabel: primaryProduct.category.toUpperCase(),
    offerType,
    title,
    subtitle,
    image: primaryProduct.detailImage ?? primaryProduct.image,
    price: primaryPrice,
    quantity: 1,
    purchaseAmount,
    variablePricing,
  };

  const additionalItems = defaultCheckoutItemIds
    .filter((id) => id !== primaryProduct.id)
    .map((id) => products.find((item) => item.id === id))
    .filter((item): item is Product => Boolean(item))
    .filter((item) => !hasVariableUnitPricing(item))
    .map((item) => productToCartItem(item));

  return [primaryItem, ...additionalItems];
}

export function getCheckoutCartTotal(items: CheckoutCartItem[]): number {
  return items.reduce((total, item) => total + getCheckoutItemLineTotal(item), 0);
}

export function updateCheckoutVariableAmount(
  items: CheckoutCartItem[],
  itemId: string,
  purchaseAmount: number,
): CheckoutCartItem[] {
  return items.map((item) => {
    if (item.id !== itemId || item.offerType !== "variable-unit" || !item.variablePricing) {
      return item;
    }

    const nextAmount = clampVariableUnitAmount(purchaseAmount, item.variablePricing);
    const nextPrice = calculateVariableUnitTotal(nextAmount, item.variablePricing);

    return {
      ...item,
      purchaseAmount: nextAmount,
      price: nextPrice,
    };
  });
}

export function validateCheckoutVariableItems(items: CheckoutCartItem[]): string | null {
  for (const item of items) {
    if (item.offerType !== "variable-unit" || !item.variablePricing || !item.purchaseAmount) {
      continue;
    }

    const error = validateVariableUnitAmount(item.purchaseAmount, item.variablePricing);
    if (error) {
      return error;
    }
  }

  return null;
}

export const checkoutPaymentMethods = [
  { id: "card-ru", label: "Банковская карта", shortLabel: "Карта РФ", icon: "/assets/card-ru.svg" },
  { id: "sbp", label: "СБП", shortLabel: "СБП", icon: "/assets/sbp.svg" },
  { id: "visa", label: "Visa", shortLabel: "Visa", icon: "/assets/visa.svg" },
  { id: "mastercard", label: "Mastercard", shortLabel: "Mastercard", icon: "/assets/mastercard.svg" },
  { id: "mir", label: "Mir", shortLabel: "Mir", icon: "/assets/mir.svg" },
  { id: "balance", label: "Баланс Playnox", shortLabel: "Баланс", icon: "/assets/icon-wallet.svg" },
];

export function getCheckoutPaymentLabel(methodId: string) {
  return checkoutPaymentMethods.find((method) => method.id === methodId)?.label ?? "Банковская карта";
}

export function getCheckoutPaymentShortLabel(methodId: string) {
  return checkoutPaymentMethods.find((method) => method.id === methodId)?.shortLabel ?? "Карта РФ";
}

const checkoutOrderByProductId: Record<string, string> = {
  "cs2-7": "buy-4",
};

export function getCheckoutOrderId(productId: string, productTitle?: string): string {
  const mappedOrderId = checkoutOrderByProductId[productId];
  if (mappedOrderId) {
    return mappedOrderId;
  }

  if (productTitle) {
    const matchedOrder = mockOrders.find(
      (order) => order.tab === "purchases" && order.title === productTitle,
    );
    if (matchedOrder) {
      return matchedOrder.id;
    }
  }

  return "buy-1";
}
