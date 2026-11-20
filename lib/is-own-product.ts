import type { TCatalogProduct } from "@/types/catalog";

/** True when the signed-in user owns this marketplace listing product. */
export function isOwnCatalogProduct(
  product: TCatalogProduct | null | undefined,
  userId: number | null | undefined,
): boolean {
  if (!product || userId == null) {
    return false;
  }

  const fromField = Number(product.sellerUserId);
  if (Number.isFinite(fromField) && fromField > 0) {
    return fromField === userId;
  }

  const attrs = product.attributes;
  if (attrs && typeof attrs === "object") {
    const fromAttrs = Number(
      attrs.ownerUserId ?? attrs.sellerUserId ?? attrs.ownerId,
    );
    if (Number.isFinite(fromAttrs) && fromAttrs > 0) {
      return fromAttrs === userId;
    }
  }

  return false;
}
