const http = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

jest.mock("axios", () => {
  const actual = jest.requireActual("axios");
  return { ...actual, __esModule: true, default: { ...actual.default, create: jest.fn(() => http) } };
});

jest.mock("@/lib/compress-image", () => ({
  compressImage: jest.fn(async (file: File) => file),
}));

import axios from "axios";

import { AuthApi } from "@/api/auth.api";
import { CatalogApi } from "@/api/catalog.api";
import { FavoritesApi } from "@/api/favorites.api";
import { ListingsApi } from "@/api/listings.api";
import { OrdersApi } from "@/api/orders.api";
import { ProfileApi } from "@/api/profile.api";
import { PromosApi } from "@/api/promos.api";
import { SupportApi } from "@/api/support.api";
import { compressImage } from "@/lib/compress-image";

const DATA = { ok: true };

beforeEach(() => {
  for (const fn of Object.values(http)) {
    fn.mockReset();
    fn.mockResolvedValue({ data: DATA });
  }
});

describe("api clients", () => {
  it("are singletons that send cookies to NEXT_PUBLIC_API_URL", () => {
    expect(AuthApi.getInstance()).toBe(AuthApi.getInstance());
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({ withCredentials: true }),
    );
  });

  it.each<[string, () => Promise<unknown>, keyof typeof http, unknown[]]>([
    ["register", () => AuthApi.getInstance().register({ email: "a@b.c", password: "p" }), "post", ["auth/register", { email: "a@b.c", password: "p" }]],
    ["login", () => AuthApi.getInstance().login({ email: "a@b.c", password: "p" }), "post", ["auth/login", { email: "a@b.c", password: "p" }]],
    ["me", () => AuthApi.getInstance().getProfile(), "get", ["auth/me"]],
    ["email code", () => AuthApi.getInstance().requestEmailCode("a@b.c"), "post", ["auth/email/code", { email: "a@b.c" }]],
    ["email verify", () => AuthApi.getInstance().verifyEmailCode("a@b.c", "123456"), "post", ["auth/email/verify", { email: "a@b.c", code: "123456" }]],
    ["vk", () => AuthApi.getInstance().loginWithVk("tok"), "post", ["auth/vk", { accessToken: "tok" }]],
    ["profile", () => AuthApi.getInstance().updateProfile("nick"), "post", ["auth/profile", { username: "nick" }]],
    ["banners", () => CatalogApi.getInstance().listHeroBanners(), "get", ["catalog/hero-banners"]],
    ["segments", () => CatalogApi.getInstance().listSegments(), "get", ["catalog/segments"]],
    ["categories", () => CatalogApi.getInstance().listCategories("mobile"), "get", ["catalog/categories", { params: { segment: "mobile" } }]],
    ["all categories", () => CatalogApi.getInstance().listCategories(), "get", ["catalog/categories", { params: undefined }]],
    ["category page", () => CatalogApi.getInstance().getCategoryPage("steam", { sort: "price-asc" }), "get", ["catalog/categories/steam", { params: { sort: "price-asc" } }]],
    ["filters", () => CatalogApi.getInstance().listFilters("steam", "keys"), "get", ["catalog/filters", { params: { category: "steam", offerType: "keys" } }]],
    ["filters without args", () => CatalogApi.getInstance().listFilters(), "get", ["catalog/filters", { params: {} }]],
    ["products", () => CatalogApi.getInstance().listProducts("steam"), "get", ["catalog/products", { params: { category: "steam" } }]],
    ["all products", () => CatalogApi.getInstance().listProducts(), "get", ["catalog/products", { params: undefined }]],
    ["product", () => CatalogApi.getInstance().getProduct("cs2"), "get", ["catalog/products/cs2"]],
    ["search", () => CatalogApi.getInstance().search("cs"), "get", ["catalog/search", { params: { q: "cs" } }]],
    ["favorites", () => FavoritesApi.getInstance().list(), "get", ["favorites"]],
    ["favorite add", () => FavoritesApi.getInstance().add(5), "post", ["favorites", { productId: 5 }]],
    ["favorite remove", () => FavoritesApi.getInstance().remove(5), "delete", ["favorites/5"]],
    ["favorite toggle", () => FavoritesApi.getInstance().toggle(5), "post", ["favorites/toggle", { productId: 5 }]],
    ["my listings", () => ListingsApi.getInstance().listMine(), "get", ["listings/mine"]],
    ["archive listing", () => ListingsApi.getInstance().archive("3"), "patch", ["listings/mine/3/archive"]],
    ["create order", () => OrdersApi.getInstance().create({ productId: 1, paymentMethod: "balance" }), "post", ["orders", { productId: 1, paymentMethod: "balance" }]],
    ["my orders", () => OrdersApi.getInstance().listMine(), "get", ["orders/mine"]],
    ["order", () => OrdersApi.getInstance().getOne("9"), "get", ["orders/9"]],
    ["fulfill", () => OrdersApi.getInstance().fulfill("9"), "post", ["orders/9/fulfill"]],
    ["confirm", () => OrdersApi.getInstance().confirm("9"), "post", ["orders/9/confirm"]],
    ["cancel", () => OrdersApi.getInstance().cancel("9"), "post", ["orders/9/cancel"]],
    ["dispute", () => OrdersApi.getInstance().dispute("9", "not_received", "не пришло"), "post", ["orders/9/dispute", { ground: "not_received", comment: "не пришло" }]],
    ["order messages", () => OrdersApi.getInstance().listMessages("9"), "get", ["orders/9/messages"]],
    ["order message", () => OrdersApi.getInstance().postMessage("9", "привет"), "post", ["orders/9/messages", { text: "привет" }]],
    ["overview", () => ProfileApi.getInstance().getOverview(), "get", ["profile/overview"]],
    ["cashback", () => ProfileApi.getInstance().getCashback(), "get", ["profile/cashback"]],
    ["items", () => ProfileApi.getInstance().listItems("sales", "disputed"), "get", ["profile/items", { params: { tab: "sales", filter: "disputed" } }]],
    ["history", () => ProfileApi.getInstance().getBalanceHistory(), "get", ["profile/balance/history"]],
    ["sales stats", () => ProfileApi.getInstance().getSalesStats("7d"), "get", ["profile/sales-stats", { params: { period: "7d" } }]],
    ["promo", () => PromosApi.getInstance().validate({ code: "X", context: "topup", amount: 100 }), "post", ["promos/validate", { code: "X", context: "topup", amount: 100 }]],
    ["support topics", () => SupportApi.getInstance().listTopics(), "get", ["support/topics"]],
    ["support tickets", () => SupportApi.getInstance().listTickets(), "get", ["support/tickets"]],
    ["support ticket", () => SupportApi.getInstance().createTicket({ topicId: 1, orderCode: "ORD-1", text: "hi" }), "post", ["support/tickets", { topicId: 1, orderCode: "ORD-1", text: "hi" }]],
    ["support messages", () => SupportApi.getInstance().listMessages(5), "get", ["support/tickets/5/messages"]],
    ["support message", () => SupportApi.getInstance().postMessage(5, "hi"), "post", ["support/tickets/5/messages", { text: "hi" }]],
    ["support close", () => SupportApi.getInstance().closeTicket(5), "post", ["support/tickets/5/close"]],
  ])("%s", async (_name, call, method, args) => {
    await expect(call()).resolves.toBe(DATA);
    expect(http[method]).toHaveBeenCalledWith(...args);
  });

  it("logs out", async () => {
    await expect(AuthApi.getInstance().logout()).resolves.toBeUndefined();
    expect(http.post).toHaveBeenCalledWith("auth/logout");
  });

  it("unwraps favorite ids", async () => {
    http.get.mockResolvedValue({ data: { productIds: [1, 2] } });

    await expect(FavoritesApi.getInstance().listIds()).resolves.toEqual([1, 2]);
    expect(http.get).toHaveBeenCalledWith("favorites/ids");
  });

  it("maps a deposit to an overview", async () => {
    http.post.mockResolvedValue({ data: { balance: 500, history: [] } });

    await expect(ProfileApi.getInstance().deposit(500)).resolves.toEqual({
      balance: 500,
      rating: 0,
    });
    expect(http.post).toHaveBeenCalledWith("profile/balance/deposit", {
      amount: 500,
    });
  });

  it("uploads files as multipart", async () => {
    const file = new File(["x"], "a.png", { type: "image/png" });

    await AuthApi.getInstance().uploadAvatar(file);
    const [path, body] = http.post.mock.calls[0];

    expect(path).toBe("auth/avatar");
    expect((body as FormData).get("file")).toBe(file);
  });

  it("compresses and uploads listing images before creating the listing", async () => {
    http.post
      .mockResolvedValueOnce({ data: { id: 11 } })
      .mockResolvedValueOnce({ data: { id: 12 } })
      .mockResolvedValueOnce({ data: DATA });
    const images = [
      new File(["a"], "a.png", { type: "image/png" }),
      new File(["b"], "b.png", { type: "image/png" }),
    ];

    await ListingsApi.getInstance().create({
      gameId: "cs2",
      gameName: "CS2",
      categoryId: "accounts",
      categoryLabel: "Аккаунты",
      listingType: "one-time",
      title: "Аккаунт",
      description: "",
      deliveryInstruction: "Пришлю данные в чат сделки",
      price: 100,
      images,
    });

    expect(compressImage).toHaveBeenCalledTimes(2);
    expect(http.post.mock.calls[0][0]).toBe("listings/images");
    expect(http.post.mock.calls[2]).toEqual([
      "listings",
      expect.objectContaining({
        title: "Аккаунт",
        description: undefined,
        deliveryInstruction: "Пришлю данные в чат сделки",
        imageIds: [11, 12],
      }),
    ]);
    expect(http.post.mock.calls[2][1]).not.toHaveProperty("deliveryMethodId");
  });

  it("omits imageIds when there are no images", async () => {
    await ListingsApi.getInstance().create({
      gameId: "cs2",
      gameName: "CS2",
      categoryId: "accounts",
      categoryLabel: "Аккаунты",
      listingType: "permanent",
      deliveryInstruction: "Пришлю ключ в чат сделки",
      title: "Ключ",
      price: 100,
    });

    expect(http.post).toHaveBeenCalledWith(
      "listings",
      expect.objectContaining({ imageIds: undefined, listingType: "permanent" }),
    );
  });
});
