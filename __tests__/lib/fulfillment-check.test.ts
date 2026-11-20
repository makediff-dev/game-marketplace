import { cleanPayload, fieldError, payloadErrors } from "@/lib/fulfillment-check";
import { kindOfFormat, parseFulfillmentFormat } from "@/types/fulfillment";
import type { TFulfillmentField } from "@/types/fulfillment";

const field = (patch: Partial<TFulfillmentField> = {}): TFulfillmentField => ({
  key: "value",
  label: "Значение",
  inputType: "text",
  filledBy: "buyer",
  required: true,
  sortOrder: 0,
  ...patch,
});

describe("fieldError", () => {
  it.each([
    [field({ validation: "steam_trade_url" }), "https://steamcommunity.com/tradeoffer/new/?partner=1&token=Ab-9", null],
    [field({ validation: "steam_trade_url" }), "steam", "Нужна ссылка на обмен Steam"],
    [field({ validation: "roblox_username" }), "ab", "Ник Roblox: 3–20 латинских букв, цифр или _"],
    [field({ validation: "player_id" }), " 1234 ", null],
    [field({ inputType: "phone" }), "+7 901 078-92-93", null],
    [field({ inputType: "phone" }), "12", "Нужен номер телефона в поле «Значение»"],
    [field({ inputType: "number" }), "abc", "Нужно число в поле «Значение»"],
    [field({ inputType: "select", options: ["EU", "Asia"] }), "Asia", null],
    [field({ inputType: "select", options: ["EU"] }), "US", "Выберите вариант в поле «Значение»"],
    [field({ validation: "custom", pattern: "\\d{3}" }), "1234", "Проверьте поле «Значение»"],
    [field({ validation: "custom", pattern: "(" }), "x", null],
    [field(), "  ", "Заполните поле «Значение»"],
    [field({ required: false, inputType: "url" }), "", null],
  ])("%#", (item, value, expected) => {
    expect(fieldError(item, value)).toBe(expected);
  });
});

describe("payload helpers", () => {
  const fields = [field({ key: "a", label: "A" }), field({ key: "b", label: "B", required: false })];

  it("collects errors by key and trims values", () => {
    expect(payloadErrors(fields, { b: "x" })).toEqual({ a: "Заполните поле «A»" });
    expect(cleanPayload(fields, { a: " 1 ", b: " ", c: "extra" })).toEqual({ a: "1" });
  });
});

describe("format kinds", () => {
  it("reads kinds and the fields an admin added", () => {
    const format = parseFulfillmentFormat({
      slug: "topup",
      title: "Пополнение",
      kind: "topup",
      deadlineHours: 2,
      offerTypeSlugs: ["gems"],
      fields: [{ key: "server", label: "Сервер", inputType: "select", options: ["EU"], sensitive: true }],
    });

    expect(format).toMatchObject({ kind: "topup", mode: "seller", deadlineHours: 2, offerTypeSlugs: ["gems"] });
    expect(format?.fields[0]).toMatchObject({ inputType: "select", options: ["EU"], sensitive: true });
    expect(kindOfFormat({ mode: "instant" })).toBe("stock");
    expect(kindOfFormat({ mode: "gift" })).toBe("gift");
  });
});
