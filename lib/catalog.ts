import type { TCatalogProduct } from "@/types/catalog";

export function formatMoney(amount: number, symbol = "₽"): string {
  return `${new Intl.NumberFormat("ru-RU").format(amount)} ${symbol}`;
}

export function formatProductCount(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} товар`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} товара`;
  }

  return `${count} товаров`;
}

export function productHref(product: Pick<TCatalogProduct, "slug">): string {
  return `/product/${product.slug}`;
}

export function categoryHref(slug: string): string {
  return `/catalog/${slug}`;
}
