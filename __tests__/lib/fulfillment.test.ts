import {
  buyerFieldsOf,
  parseFulfillmentFormat,
  sellerFieldsOf,
} from "@/types/fulfillment";

describe("parseFulfillmentFormat", () => {
  it("rejects non-objects and formats without slug or title", () => {
    expect(parseFulfillmentFormat(null)).toBeNull();
    expect(parseFulfillmentFormat("chat")).toBeNull();
    expect(parseFulfillmentFormat({ name: "Чат" })).toBeNull();
    expect(parseFulfillmentFormat({ slug: "chat" })).toBeNull();
  });

  it("normalizes a format coming from Strapi", () => {
    const format = parseFulfillmentFormat({
      id: 3,
      slug: "account",
      name: "Аккаунт",
      mode: "weird",
      fields: [
        { key: "password", label: "Пароль", inputType: "password", filledBy: "seller", sortOrder: 2 },
        { key: " login ", label: " Логин ", sortOrder: 1, required: false },
        { key: "", label: "Пусто" },
        null,
        "junk",
      ],
    });

    expect(format).toEqual({
      id: 3,
      slug: "account",
      name: "Аккаунт",
      title: "Аккаунт",
      description: null,
      kind: "handover",
      mode: "seller",
      deadlineHours: null,
      offerTypeSlugs: [],
      fields: [
        { key: "login", label: "Логин", placeholder: "", helpText: "", inputType: "text", options: [], validation: "none", pattern: "", filledBy: "buyer", required: false, sensitive: false, sortOrder: 1 },
        { key: "password", label: "Пароль", placeholder: "", helpText: "", inputType: "password", options: [], validation: "none", pattern: "", filledBy: "seller", required: true, sensitive: false, sortOrder: 2 },
      ],
    });
  });

  it("keeps known modes and the description", () => {
    expect(
      parseFulfillmentFormat({ slug: "auto", title: "Автовыдача", mode: "instant", description: "Сразу" }),
    ).toMatchObject({ mode: "instant", name: "Автовыдача", description: "Сразу", fields: [] });
  });

  it("splits fields by who fills them", () => {
    const format = parseFulfillmentFormat({
      slug: "s",
      title: "t",
      fields: [
        { key: "nick", label: "Ник" },
        { key: "code", label: "Код", filledBy: "seller" },
      ],
    });

    expect(buyerFieldsOf(format).map((f) => f.key)).toEqual(["nick"]);
    expect(sellerFieldsOf(format).map((f) => f.key)).toEqual(["code"]);
    expect(buyerFieldsOf(null)).toEqual([]);
    expect(sellerFieldsOf(null)).toEqual([]);
  });
});
