import type { TCatalogProduct } from "@/types/catalog";

const RECENT_KEY = "playnox-recent-products";

export function readRecentProducts(): TCatalogProduct[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as TCatalogProduct[]) : [];
  } catch {
    return [];
  }
}

export function writeRecentProducts(items: TCatalogProduct[]) {
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, 8)));
}

export function rememberProduct(product: TCatalogProduct) {
  const current = readRecentProducts().filter(
    (item) => item.slug !== product.slug,
  );
  writeRecentProducts([product, ...current]);
}

export function clearRecentProducts() {
  writeRecentProducts([]);
}
