import { isOwnCatalogProduct } from "@/lib/is-own-product";
import type { TCatalogProduct } from "@/types/catalog";

const product = (patch: Partial<TCatalogProduct>) =>
  ({ id: 1, slug: "item", ...patch }) as TCatalogProduct;

describe("isOwnCatalogProduct", () => {
  it("is false without a product or a user", () => {
    expect(isOwnCatalogProduct(null, 7)).toBe(false);
    expect(isOwnCatalogProduct(product({ sellerUserId: 7 }), null)).toBe(false);
    expect(isOwnCatalogProduct(product({ sellerUserId: 7 }), undefined)).toBe(
      false,
    );
  });

  it("compares sellerUserId first", () => {
    expect(isOwnCatalogProduct(product({ sellerUserId: 7 }), 7)).toBe(true);
    expect(isOwnCatalogProduct(product({ sellerUserId: 8 }), 7)).toBe(false);
  });

  it("does not let attributes override an explicit sellerUserId", () => {
    const item = product({ sellerUserId: 8, attributes: { ownerUserId: 7 } });

    expect(isOwnCatalogProduct(item, 7)).toBe(false);
  });

  it.each(["ownerUserId", "sellerUserId", "ownerId"])(
    "falls back to attributes.%s",
    (key) => {
      expect(
        isOwnCatalogProduct(product({ attributes: { [key]: "7" } }), 7),
      ).toBe(true);
    },
  );

  it("ignores non-positive or junk ids", () => {
    expect(isOwnCatalogProduct(product({ sellerUserId: 0 }), 0)).toBe(false);
    expect(
      isOwnCatalogProduct(product({ attributes: { ownerUserId: "abc" } }), 7),
    ).toBe(false);
  });
});
