import { products } from "@/lib/mock/products";

export const favoriteProductIds = ["cs2-1", "cs2-2", "cs2-3", "cs2-4", "cs2-5", "cs2-6"];

export function getFavoriteProducts() {
  return products.filter((product) => favoriteProductIds.includes(product.id));
}
