import { parseProductDescription } from "@/lib/product-description";
import {
  avatarSrc,
  isPlaceholderUsername,
  memberSince,
  signedInWithVk,
} from "@/lib/profile";
import { segmentIconSrc } from "@/lib/segment-icons";
import type { TUser } from "@/types/auth";

const user = (patch: Partial<TUser> = {}): TUser => ({
  id: 7,
  username: "player",
  email: "player@mail.ru",
  provider: "local",
  confirmed: true,
  blocked: false,
  createdAt: "2026-09-15T10:00:00Z",
  updatedAt: "2026-09-15T10:00:00Z",
  ...patch,
});

describe("parseProductDescription", () => {
  it("returns empty parts for an empty description", () => {
    expect(parseProductDescription()).toEqual({ bullets: [], rest: [] });
    expect(parseProductDescription("")).toEqual({ bullets: [], rest: [] });
  });

  it("splits specs, warning, bullets and the rest", () => {
    const parsed = parseProductDescription(
      [
        "Ранг Global · 500 часов",
        "",
        "⚠️ Смена почты запрещена",
        "• Полный доступ",
        "- Родная почта",
        "Передача в чате заказа.",
        "Гарантия 7 дней.",
      ].join("\n"),
    );

    expect(parsed).toEqual({
      specs: "Ранг Global · 500 часов",
      warning: "Смена почты запрещена",
      bullets: ["Полный доступ", "Родная почта"],
      rest: ["Передача в чате заказа.", "Гарантия 7 дней."],
    });
  });

  it("takes only the first specs and warning lines", () => {
    const parsed = parseProductDescription(
      "Кол-во: 100\nCS Rating 20000\nОбратите внимание: А\n⚠️ Б",
    );

    expect(parsed.specs).toBe("Кол-во: 100");
    expect(parsed.warning).toBe("Обратите внимание: А");
    expect(parsed.rest).toEqual(["CS Rating 20000", "⚠️ Б"]);
  });
});

describe("profile helpers", () => {
  it("detects placeholder usernames", () => {
    expect(isPlaceholderUsername(user())).toBe(false);
    expect(isPlaceholderUsername(user({ username: "player@mail.ru" }))).toBe(
      true,
    );
    expect(isPlaceholderUsername(user({ username: "vk_123" }))).toBe(true);
    expect(isPlaceholderUsername(user({ username: "a@b" }))).toBe(true);
  });

  it("detects VK accounts", () => {
    expect(signedInWithVk(user())).toBe(false);
    expect(signedInWithVk(user({ username: "vk_1" }))).toBe(true);
    expect(signedInWithVk(user({ email: "vk-42@example.com" }))).toBe(true);
  });

  it("formats the member-since month in Russian", () => {
    expect(memberSince("2026-09-15T10:00:00Z")).toBe("сентября 2026");
    expect(memberSince("2025-01-20T10:00:00Z")).toBe("января 2025");
  });

  it("builds the avatar url only when an avatar was uploaded", () => {
    expect(avatarSrc(user())).toBeNull();
    expect(avatarSrc(user({ avatarUpdatedAt: 123 }))).toBe(
      `${process.env.NEXT_PUBLIC_API_URL ?? ""}/auth/avatars/7?v=123`,
    );
  });
});

describe("segmentIconSrc", () => {
  it("maps known icon names", () => {
    expect(segmentIconSrc("phone")).toBe("/catalog/segment-phone.svg");
    expect(segmentIconSrc("globe")).toBe("/catalog/segment-globe.svg");
  });

  it("passes through urls and falls back to the gamepad", () => {
    expect(segmentIconSrc("/x.svg")).toBe("/x.svg");
    expect(segmentIconSrc("https://cdn/x.svg")).toBe("https://cdn/x.svg");
    expect(segmentIconSrc("unknown")).toBe("/catalog/segment-gamepad.svg");
  });
});
