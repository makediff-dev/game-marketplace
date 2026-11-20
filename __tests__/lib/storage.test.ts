import { isChatUnread, markChatRead } from "@/lib/chat-unread";
import {
  clearRecentProducts,
  readRecentProducts,
  rememberProduct,
} from "@/lib/recent-products";
import type { TCatalogProduct } from "@/types/catalog";

const product = (slug: string) => ({ id: slug.length, slug }) as TCatalogProduct;

describe("recent products", () => {
  it("is empty by default and on broken storage", () => {
    expect(readRecentProducts()).toEqual([]);

    window.localStorage.setItem("playnox-recent-products", "{broken");
    expect(readRecentProducts()).toEqual([]);
  });

  it("puts the last viewed product first without duplicates", () => {
    rememberProduct(product("a"));
    rememberProduct(product("b"));
    rememberProduct(product("a"));

    expect(readRecentProducts().map((item) => item.slug)).toEqual(["a", "b"]);
  });

  it("keeps at most 8 products", () => {
    for (let index = 0; index < 10; index += 1) {
      rememberProduct(product(`p${index}`));
    }

    const slugs = readRecentProducts().map((item) => item.slug);
    expect(slugs).toHaveLength(8);
    expect(slugs[0]).toBe("p9");
    expect(slugs).not.toContain("p0");
  });

  it("clears the list", () => {
    rememberProduct(product("a"));
    clearRecentProducts();

    expect(readRecentProducts()).toEqual([]);
  });
});

describe("chat unread marks", () => {
  it("has no unread without messages", () => {
    expect(isChatUnread("1", null)).toBe(false);
    expect(isChatUnread("1", undefined)).toBe(false);
  });

  it("is unread until the chat is opened", () => {
    expect(isChatUnread("1", "2026-10-01T10:00:00Z")).toBe(true);

    markChatRead("1", "2026-10-01T10:00:00Z");
    expect(isChatUnread("1", "2026-10-01T10:00:00Z")).toBe(false);
    expect(isChatUnread("1", "2026-10-01T10:05:00Z")).toBe(true);
  });

  it("tracks orders separately and survives broken storage", () => {
    markChatRead("1", "2026-10-01T10:00:00Z");
    expect(isChatUnread("2", "2026-10-01T09:00:00Z")).toBe(true);

    window.localStorage.setItem("playnox-chat-read-at", "not json");
    expect(isChatUnread("1", "2026-10-01T09:00:00Z")).toBe(true);
  });
});
