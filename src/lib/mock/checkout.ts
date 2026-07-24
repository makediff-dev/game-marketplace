import { mockOrders } from "./orders";
import { products, type Product } from "./products";
import type { ProductDetail } from "./product-details";

export const CHECKOUT_COMMENT_MAX_LENGTH = 500;

export interface CheckoutCartItem {
  id: string;
  productId: string;
  category: string;
  title: string;
  subtitle?: string;
  image: string;
  price: number;
  quantity: number;
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

function productToCartItem(product: Product, quantity = 1): CheckoutCartItem {
  const { title, subtitle } = splitProductTitle(product.title);

  return {
    id: `cart-${product.id}`,
    productId: product.id,
    category: product.category.toUpperCase(),
    title,
    subtitle,
    image: product.image,
    price: product.price,
    quantity,
  };
}

export function buildCheckoutCartItems(primaryProduct: ProductDetail): CheckoutCartItem[] {
  const { title, subtitle } = splitProductTitle(primaryProduct.title);
  const primaryItem: CheckoutCartItem = {
    id: `cart-${primaryProduct.id}`,
    productId: primaryProduct.id,
    category: primaryProduct.category.toUpperCase(),
    title,
    subtitle,
    image: primaryProduct.detailImage ?? primaryProduct.image,
    price: primaryProduct.price,
    quantity: 1,
  };

  const additionalItems = defaultCheckoutItemIds
    .filter((id) => id !== primaryProduct.id)
    .map((id) => products.find((item) => item.id === id))
    .filter((item): item is Product => Boolean(item))
    .map((item) => productToCartItem(item));

  return [primaryItem, ...additionalItems];
}

export function getCheckoutCartTotal(items: CheckoutCartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
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
