import {
  PRODUCT_GENRES,
  PRODUCT_REGIONS,
  ROBLOX_SERVERS,
  SELL_WIZARD_APPS,
  calcIncome,
  catalogCategoryToSellApp,
  formatPrice,
  deliverySummary,
  fulfillmentFormatsToDeliveryMethods,
  getCategoryTerms,
  getDeliveryTerms,
  getGameById,
  getSellCategories,
  offerTypesToSellCategories,
  readListingTermsAccepted,
  readSellerTermsAccepted,
  sellCharacteristicGroups,
  writeListingTermsAccepted,
  writeSellerTermsAccepted,
} from "@/lib/sell-wizard";
import { formatsForOfferType } from "@/types/fulfillment";

describe("money", () => {
  it("keeps 90% of the price for the seller", () => {
    expect(calcIncome(1000)).toBe(900);
    expect(calcIncome(999)).toBe(899);
    expect(calcIncome(-10)).toBe(0);
    expect(calcIncome(1000, 5)).toBe(950);
  });

  it("formats prices as non-negative integers", () => {
    expect(formatPrice(12345.6)).toBe("12 346");
    expect(formatPrice(-5)).toBe("0");
  });
});

describe("games and categories", () => {
  it("finds a game by id or gameId", () => {
    expect(getGameById("cs2")?.name).toBe("Counter-Strike 2");
    expect(getGameById("nope")).toBeUndefined();
  });

  it("has unique app ids", () => {
    const ids = SELL_WIZARD_APPS.map((app) => app.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("maps a catalog category into a wizard card", () => {
    expect(
      catalogCategoryToSellApp({
        slug: "roblox",
        name: "Roblox",
        icon: "/r.png",
        segmentSlug: "mobile",
        badge: "Новое",
      }),
    ).toEqual({
      id: "roblox",
      gameId: "roblox",
      name: "Roblox",
      image: "/r.png",
      group: "mobile",
      badge: "Новое",
    });
    expect(
      catalogCategoryToSellApp({ slug: "x", name: "X", icon: "", segmentSlug: "??" })
        .group,
    ).toBe("games");
  });

  it("falls back to default categories", () => {
    expect(getSellCategories("unknown-game").length).toBeGreaterThan(0);
    expect(offerTypesToSellCategories([])).toEqual(getSellCategories("unknown-game"));
    expect(
      offerTypesToSellCategories([{ slug: "accounts", name: "Аккаунты" }]),
    ).toEqual([{ id: "accounts", label: "Аккаунты" }]);
  });
});

describe("terms and delivery", () => {
  it("shows the prohibited list only for Roblox items", () => {
    expect(getCategoryTerms("roblox", "items").variant).toBe("prohibited");
    expect(getCategoryTerms("roblox", "accounts").variant).toBe("requirements");
    expect(getCategoryTerms("cs2", "items").variant).toBe("requirements");
  });

  it("uses trade requirements for Roblox item trades", () => {
    const trade = getDeliveryTerms("roblox", "items", "trade").items;
    const plain = getDeliveryTerms("roblox", "items", "chat").items;

    expect(getDeliveryTerms("roblox", "items", "roblox-trade").items).toBe(trade);
    expect(trade).not.toBe(plain);
  });

  it("maps fulfillment formats with what each one asks for", () => {
    expect(fulfillmentFormatsToDeliveryMethods([])).toEqual([]);
    expect(
      fulfillmentFormatsToDeliveryMethods([
        { slug: "chat", name: "В чате", description: "  Пишем  " },
        { slug: "auto", name: "Авто", description: null },
      ]),
    ).toEqual([
      { id: "chat", label: "В чате", description: "Пишем · Покупатель ничего не вводит" },
      { id: "auto", label: "Авто", description: "Покупатель ничего не вводит" },
    ]);
  });

  it("tells the seller what the buyer gives and what they give back", () => {
    const field = (label: string, filledBy: "buyer" | "seller") => ({
      key: label,
      label,
      filledBy,
      inputType: "text" as const,
      validation: "none" as const,
      options: [],
      required: true,
      sensitive: false,
      sortOrder: 0,
    });

    expect(
      deliverySummary({
        slug: "topup",
        name: "Пополнение",
        kind: "topup",
        deadlineHours: 24,
        fields: [field("ID игрока", "buyer"), field("Сервер", "buyer"), field("Чек", "seller")],
      }),
    ).toBe("Покупатель укажет: ID игрока, Сервер · Вы передадите: Чек · Срок: 24 ч");
    expect(
      deliverySummary({ slug: "stock", name: "Склад", kind: "stock", deadlineHours: 5, fields: [field("Логин", "seller")] }),
    ).toBe("Покупатель ничего не вводит · Выдача сразу после оплаты из вашего склада: Логин");
  });

  it("offers only the formats of the chosen section", () => {
    const formats = [
      { slug: "steam-trade", offerTypeSlugs: ["skins"] },
      { slug: "account", offerTypeSlugs: ["accounts", "faceit"] },
      { slug: "gift", offerTypeSlugs: [] },
      { slug: "old" },
    ];

    expect(formatsForOfferType(formats, "skins").map((f) => f.slug)).toEqual(["steam-trade", "gift", "old"]);
    expect(formatsForOfferType(formats, "accounts").map((f) => f.slug)).toEqual(["account", "gift", "old"]);
    expect(formatsForOfferType(formats, null).map((f) => f.slug)).toEqual(["gift", "old"]);
  });
});

describe("sellCharacteristicGroups", () => {
  const field = (key: string, patch = {}) => ({
    key,
    label: key,
    fieldType: "radio",
    sortOrder: 1,
    config: { options: [{ value: "v", label: "L" }] },
    ...patch,
  });

  it("uses Strapi fields for genre, region and server only", () => {
    const groups = sellCharacteristicGroups({
      filters: [
        field("region", { sortOrder: 2 }),
        field("genre", { sortOrder: 1 }),
        field("price"),
        field("server", { config: { options: [] } }),
      ],
    });

    expect(groups).toEqual([
      { key: "genre", label: "genre", options: ["L"] },
      { key: "region", label: "region", options: ["L"] },
    ]);
  });

  it("filters fields by offer type", () => {
    const groups = sellCharacteristicGroups({
      filters: [field("genre", { offerTypeSlug: "keys" }), field("region")],
      offerTypeSlug: "accounts",
    });

    expect(groups.map((group) => group.key)).toEqual(["region"]);
  });

  it("falls back to local lists, with servers on request", () => {
    expect(sellCharacteristicGroups({})).toEqual([
      { key: "genre", label: "Жанр", options: PRODUCT_GENRES },
      { key: "region", label: "Регион", options: PRODUCT_REGIONS },
    ]);
    expect(
      sellCharacteristicGroups({ includeServerFallback: true })[0],
    ).toEqual({ key: "server", label: "Сервер", options: ROBLOX_SERVERS });
  });
});

describe("accepted terms", () => {
  it("remembers seller and listing terms separately", () => {
    expect(readSellerTermsAccepted()).toBe(false);
    expect(readListingTermsAccepted()).toBe(false);

    writeSellerTermsAccepted();
    expect(readSellerTermsAccepted()).toBe(true);
    expect(readListingTermsAccepted()).toBe(false);

    writeListingTermsAccepted();
    expect(readListingTermsAccepted()).toBe(true);
  });

  it("asks again for a category with its own prohibitions", () => {
    window.localStorage.setItem("playnox-listing-terms-accepted", "1");

    expect(readListingTermsAccepted("cs2", "accounts")).toBe(true);
    expect(readListingTermsAccepted("roblox", "items")).toBe(false);

    writeListingTermsAccepted("roblox", "items");
    expect(readListingTermsAccepted("roblox", "items")).toBe(true);
    expect(readListingTermsAccepted("cs2", "accounts")).toBe(true);
  });
});
