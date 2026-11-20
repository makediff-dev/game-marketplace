import {
  categoryHref,
  formatMoney,
  formatProductCount,
  productHref,
} from "@/lib/catalog";

describe("formatMoney", () => {
  it("groups thousands the Russian way and appends the ruble sign", () => {
    expect(formatMoney(1490)).toBe("1 490 ₽");
    expect(formatMoney(0)).toBe("0 ₽");
  });

  it("uses a custom currency symbol", () => {
    expect(formatMoney(25, "$")).toBe("25 $");
  });
});

describe("formatProductCount", () => {
  it.each([
    [1, "1 товар"],
    [21, "21 товар"],
    [2, "2 товара"],
    [4, "4 товара"],
    [22, "22 товара"],
    [5, "5 товаров"],
    [0, "0 товаров"],
    [11, "11 товаров"],
    [12, "12 товаров"],
    [14, "14 товаров"],
    [111, "111 товаров"],
    [112, "112 товаров"],
  ])("%i -> %s", (count, label) => {
    expect(formatProductCount(count)).toBe(label);
  });
});

describe("links", () => {
  it("builds product and category hrefs", () => {
    expect(productHref({ slug: "cs2-prime" })).toBe("/product/cs2-prime");
    expect(categoryHref("steam")).toBe("/catalog/steam");
  });
});
