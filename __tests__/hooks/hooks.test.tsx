import { act, waitFor } from "@testing-library/react";

const mockAuth = {
  getProfile: jest.fn(),
  register: jest.fn(),
  login: jest.fn(),
  requestEmailCode: jest.fn(),
  verifyEmailCode: jest.fn(),
  loginWithVk: jest.fn(),
  uploadAvatar: jest.fn(),
  updateProfile: jest.fn(),
  logout: jest.fn(),
};
const mockCatalog = {
  listHeroBanners: jest.fn(),
  listSegments: jest.fn(),
  listCategories: jest.fn(),
  listProducts: jest.fn(),
  getCategoryPage: jest.fn(),
  getProduct: jest.fn(),
  search: jest.fn(),
};
const mockFavorites = { list: jest.fn(), listIds: jest.fn(), toggle: jest.fn() };
const mockListings = { listMine: jest.fn(), create: jest.fn() };
const mockOrders = {
  listMine: jest.fn(),
  getOne: jest.fn(),
  create: jest.fn(),
  fulfill: jest.fn(),
  confirm: jest.fn(),
  cancel: jest.fn(),
  dispute: jest.fn(),
  listMessages: jest.fn(),
  postMessage: jest.fn(),
};
const mockProfile = {
  getOverview: jest.fn(),
  getCashback: jest.fn(),
  listItems: jest.fn(),
  getBalanceHistory: jest.fn(),
  getSalesStats: jest.fn(),
  deposit: jest.fn(),
};
const mockSupport = {
  listTopics: jest.fn(),
  listTickets: jest.fn(),
  createTicket: jest.fn(),
  listMessages: jest.fn(),
  postMessage: jest.fn(),
  closeTicket: jest.fn(),
};

jest.mock("@/api/auth.api", () => ({ AuthApi: { getInstance: () => mockAuth } }));
jest.mock("@/api/catalog.api", () => ({ CatalogApi: { getInstance: () => mockCatalog } }));
jest.mock("@/api/favorites.api", () => ({ FavoritesApi: { getInstance: () => mockFavorites } }));
jest.mock("@/api/listings.api", () => ({ ListingsApi: { getInstance: () => mockListings } }));
jest.mock("@/api/orders.api", () => ({ OrdersApi: { getInstance: () => mockOrders } }));
jest.mock("@/api/profile.api", () => ({ ProfileApi: { getInstance: () => mockProfile } }));
jest.mock("@/api/support.api", () => ({ SupportApi: { getInstance: () => mockSupport } }));

import {
  CURRENT_USER_KEY,
  useCurrentUser,
  useLogin,
  useLogout,
  useRegister,
  useRequestEmailCode,
  useUpdateProfile,
  useUploadAvatar,
  useVerifyEmailCode,
  useVkLogin,
} from "@/hooks/use-auth";
import {
  useCatalogCategories,
  useCatalogProduct,
  useCatalogProducts,
  useCatalogSearch,
  useCatalogSegments,
  useCategoryPage,
  useHeroBanners,
} from "@/hooks/use-catalog";
import {
  FAVORITE_IDS_KEY,
  useFavoriteIds,
  useFavorites,
  useToggleFavorite,
} from "@/hooks/use-favorites";
import { MY_LISTINGS_KEY, useCreateListing, useMyListings } from "@/hooks/use-listings";
import {
  ORDERS_MINE_KEY,
  useCancelOrder,
  useConfirmOrder,
  useCreateOrder,
  useDisputeOrder,
  useFulfillOrder,
  useMyOrders,
  useOrder,
  useOrderMessages,
  usePostOrderMessage,
} from "@/hooks/use-orders";
import {
  PROFILE_OVERVIEW_KEY,
  useBalanceHistory,
  useCashbackProgress,
  useDepositBalance,
  useProfileItems,
  useProfileOverview,
  useSalesStats,
} from "@/hooks/use-profile";
import {
  SUPPORT_TICKETS_KEY,
  supportMessagesKey,
  useCloseSupportTicket,
  useCreateSupportTicket,
  usePostSupportMessage,
  useSupportMessages,
  useSupportTickets,
  useSupportTopics,
} from "@/hooks/use-support-chat";
import { useUserStore } from "@/store/user.store";

import { makeOrder, makeUser } from "../fixtures";
import { renderHookWithClient, router } from "../utils";

type TMutation = { mutateAsync: (arg: unknown) => Promise<unknown> };

beforeEach(() => {
  useUserStore.getState().setUser(null);
  window.history.replaceState(null, "", "/login");
});

describe("use-auth", () => {
  it("loads the current user into the store", async () => {
    const user = makeUser();
    mockAuth.getProfile.mockResolvedValue(user);

    const { result } = renderHookWithClient(() => useCurrentUser());

    await waitFor(() => expect(result.current.data).toEqual(user));
    expect(useUserStore.getState().user).toEqual(user);
  });

  it("treats a failed profile request as a guest", async () => {
    mockAuth.getProfile.mockRejectedValue(new Error("401"));

    const { result } = renderHookWithClient(() => useCurrentUser());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
    expect(useUserStore.getState().user).toBeNull();
  });

  it("uses the server-provided user without a request", () => {
    const user = makeUser();

    renderHookWithClient(() => useCurrentUser(user));

    expect(useUserStore.getState().user).toEqual(user);
    expect(mockAuth.getProfile).not.toHaveBeenCalled();
  });

  it.each([
    ["login", () => useLogin(), mockAuth.login, { email: "a@b.c", password: "p" }],
    ["register", () => useRegister(), mockAuth.register, { email: "a@b.c", password: "p" }],
    ["email code", () => useVerifyEmailCode(), mockAuth.verifyEmailCode, { email: "a@b.c", code: "1" }],
    ["vk", () => useVkLogin(), mockAuth.loginWithVk, "token"],
  ] as Array<[string, () => unknown, jest.Mock, unknown]>)("signs in with %s and returns to the requested page", async (_n, hook, api, arg) => {
    const user = makeUser();
    api.mockResolvedValue(user);
    window.history.replaceState(null, "", "/login?from=/orders/5");

    const { result, client } = renderHookWithClient(hook);
    await act(() => (result.current as TMutation).mutateAsync(arg));

    expect(useUserStore.getState().user).toEqual(user);
    expect(client.getQueryData(CURRENT_USER_KEY)).toEqual(user);
    expect(router.replace).toHaveBeenCalledWith("/orders/5");
    expect(router.refresh).toHaveBeenCalled();
  });

  it.each(["https://evil.com", "//evil.com", "profile"])(
    "ignores an unsafe return url %s",
    async (from) => {
      mockAuth.login.mockResolvedValue(makeUser());
      window.history.replaceState(null, "", `/login?returnUrl=${encodeURIComponent(from)}`);

      const { result } = renderHookWithClient(() => useLogin());
      await act(() => result.current.mutateAsync({ email: "a", password: "b" }));

      expect(router.replace).toHaveBeenCalledWith("/profile");
    },
  );

  it("requests an email code", async () => {
    mockAuth.requestEmailCode.mockResolvedValue({ retryAfterSeconds: 50 });

    const { result } = renderHookWithClient(() => useRequestEmailCode());
    await act(() => result.current.mutateAsync("a@b.c"));

    expect(mockAuth.requestEmailCode).toHaveBeenCalledWith("a@b.c");
  });

  it.each([
    ["avatar", () => useUploadAvatar(), mockAuth.uploadAvatar, new File(["a"], "a.png")],
    ["profile", () => useUpdateProfile(), mockAuth.updateProfile, "nick"],
  ] as Array<[string, () => unknown, jest.Mock, unknown]>)("updates the user after %s change", async (_n, hook, api, arg) => {
    const user = makeUser({ username: "nick" });
    api.mockResolvedValue(user);

    const { result, client } = renderHookWithClient(hook);
    await act(() => (result.current as TMutation).mutateAsync(arg));

    expect(useUserStore.getState().user).toEqual(user);
    expect(client.getQueryData(CURRENT_USER_KEY)).toEqual(user);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("logs out, wipes the cache and goes to login", async () => {
    useUserStore.getState().setUser(makeUser());
    mockAuth.logout.mockResolvedValue(undefined);

    const { result, client } = renderHookWithClient(() => useLogout());
    client.setQueryData(["orders", "mine"], [makeOrder()]);
    await act(() => result.current.mutateAsync());

    expect(useUserStore.getState().user).toBeNull();
    expect(client.getQueryData(["orders", "mine"])).toBeUndefined();
    expect(router.replace).toHaveBeenCalledWith("/login");
  });
});

describe("use-catalog", () => {
  it.each([
    ["banners", () => useHeroBanners(), mockCatalog.listHeroBanners, []],
    ["segments", () => useCatalogSegments(), mockCatalog.listSegments, []],
    ["categories", () => useCatalogCategories("mobile"), mockCatalog.listCategories, ["mobile"]],
    ["all categories", () => useCatalogCategories(null), mockCatalog.listCategories, [undefined]],
    ["products", () => useCatalogProducts(), mockCatalog.listProducts, []],
    ["category page", () => useCategoryPage("steam", { sort: "price-asc" }), mockCatalog.getCategoryPage, ["steam", { sort: "price-asc" }]],
    ["product", () => useCatalogProduct("cs2"), mockCatalog.getProduct, ["cs2"]],
    ["search", () => useCatalogSearch("cs", true), mockCatalog.search, ["cs", undefined]],
  ] as Array<[string, () => unknown, jest.Mock, unknown[]]>)("loads %s", async (_n, hook, api, args) => {
    api.mockResolvedValue("data");

    const { result } = renderHookWithClient(hook);

    await waitFor(() => expect((result.current as { data: unknown }).data).toBe("data"));
    expect(api).toHaveBeenCalledWith(...args);
  });

  it("does not request without a slug or when search is off", () => {
    renderHookWithClient(() => useCategoryPage(""));
    renderHookWithClient(() => useCatalogProduct(""));
    renderHookWithClient(() => useCatalogSearch("cs", false));

    expect(mockCatalog.getCategoryPage).not.toHaveBeenCalled();
    expect(mockCatalog.getProduct).not.toHaveBeenCalled();
    expect(mockCatalog.search).not.toHaveBeenCalled();
  });
});

describe("use-favorites", () => {
  it("loads favorites only for a signed-in user", async () => {
    renderHookWithClient(() => useFavorites());
    renderHookWithClient(() => useFavoriteIds());
    expect(mockFavorites.list).not.toHaveBeenCalled();
    expect(mockFavorites.listIds).not.toHaveBeenCalled();

    useUserStore.getState().setUser(makeUser());
    mockFavorites.listIds.mockResolvedValue([1]);
    const { result } = renderHookWithClient(() => useFavoriteIds());

    await waitFor(() => expect(result.current.data).toEqual([1]));
  });

  it("toggles optimistically and settles on the server answer", async () => {
    let resolve: (value: { favorited: boolean; productIds: number[] }) => void = () => {};
    mockFavorites.toggle.mockReturnValue(new Promise((r) => (resolve = r)));

    const { result, client } = renderHookWithClient(() => useToggleFavorite());
    client.setQueryData(FAVORITE_IDS_KEY, [1]);

    act(() => result.current.mutate(2));
    await waitFor(() => expect(client.getQueryData(FAVORITE_IDS_KEY)).toEqual([1, 2]));

    await act(async () => resolve({ favorited: true, productIds: [1, 2, 3] }));
    await waitFor(() => expect(client.getQueryData(FAVORITE_IDS_KEY)).toEqual([1, 2, 3]));
  });

  it("rolls back and reports an error", async () => {
    mockFavorites.toggle.mockRejectedValue(new Error("500"));
    const onErrorToast = jest.fn();

    const { result, client } = renderHookWithClient(() => useToggleFavorite({ onErrorToast }));
    client.setQueryData(FAVORITE_IDS_KEY, [1]);
    await act(async () => {
      await result.current.mutateAsync(1).catch(() => undefined);
    });

    expect(client.getQueryData(FAVORITE_IDS_KEY)).toEqual([1]);
    expect(onErrorToast).toHaveBeenCalledWith("Не удалось обновить избранное");
  });

  it("does not report success when the server fails", async () => {
    mockFavorites.toggle.mockRejectedValue(new Error("500"));
    const onSuccessToast = jest.fn();

    const { result } = renderHookWithClient(() => useToggleFavorite({ onSuccessToast }));
    await act(async () => {
      await result.current.mutateAsync(1).catch(() => undefined);
    });

    expect(onSuccessToast).not.toHaveBeenCalled();
  });
});

describe("use-listings", () => {
  it("loads and creates listings, refreshing dependent lists", async () => {
    mockListings.listMine.mockResolvedValue([]);
    mockListings.create.mockResolvedValue({ id: "1" });

    const { result, client } = renderHookWithClient(() => ({
      mine: useMyListings(),
      create: useCreateListing(),
    }));
    await waitFor(() => expect(result.current.mine.isSuccess).toBe(true));
    const invalidate = jest.spyOn(client, "invalidateQueries");

    await act(() => result.current.create.mutateAsync({ title: "x" } as never));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: MY_LISTINGS_KEY });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["profile", "items"] });
  });

  it("does not load listings when disabled", () => {
    renderHookWithClient(() => useMyListings(false));
    expect(mockListings.listMine).not.toHaveBeenCalled();
  });
});

describe("use-orders", () => {
  it("loads orders, one order and its chat", async () => {
    mockOrders.listMine.mockResolvedValue([makeOrder()]);
    mockOrders.getOne.mockResolvedValue(makeOrder());
    mockOrders.listMessages.mockResolvedValue([]);

    const { result } = renderHookWithClient(() => ({
      mine: useMyOrders(),
      one: useOrder("101"),
      chat: useOrderMessages("101"),
    }));

    await waitFor(() => expect(result.current.chat.isSuccess).toBe(true));
    expect(mockOrders.getOne).toHaveBeenCalledWith("101");
    expect(mockOrders.listMessages).toHaveBeenCalledWith("101");
  });

  it("skips requests without an id or when disabled", () => {
    renderHookWithClient(() => [useOrder(""), useOrderMessages(""), useMyOrders(false)]);

    expect(mockOrders.getOne).not.toHaveBeenCalled();
    expect(mockOrders.listMessages).not.toHaveBeenCalled();
    expect(mockOrders.listMine).not.toHaveBeenCalled();
  });

  it.each([
    ["fulfill", () => useFulfillOrder(), mockOrders.fulfill, { id: "101" }],
    ["confirm", () => useConfirmOrder(), mockOrders.confirm, "101"],
    ["cancel", () => useCancelOrder(), mockOrders.cancel, "101"],
    ["dispute", () => useDisputeOrder(), mockOrders.dispute, { id: "101", reason: "нет" }],
  ] as Array<[string, () => unknown, jest.Mock, unknown]>)("refreshes the deal after %s", async (_n, hook, api, arg) => {
    api.mockResolvedValue(makeOrder());

    const { result, client } = renderHookWithClient(hook);
    const invalidate = jest.spyOn(client, "invalidateQueries");
    await act(() => (result.current as TMutation).mutateAsync(arg));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ORDERS_MINE_KEY });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["orders", "101"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["profile"] });
  });

  it("passes the dispute reason and refreshes support", async () => {
    mockOrders.dispute.mockResolvedValue(makeOrder());

    const { result, client } = renderHookWithClient(() => useDisputeOrder());
    const invalidate = jest.spyOn(client, "invalidateQueries");
    await act(() => result.current.mutateAsync({ id: "101", ground: "no_response", comment: "нет" }));

    expect(mockOrders.dispute).toHaveBeenCalledWith("101", "no_response", "нет");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["support"] });
  });

  it("creates an order and posts a chat message", async () => {
    mockOrders.create.mockResolvedValue(makeOrder());
    mockOrders.postMessage.mockResolvedValue({});

    const { result, client } = renderHookWithClient(() => ({
      create: useCreateOrder(),
      post: usePostOrderMessage("101"),
    }));
    const invalidate = jest.spyOn(client, "invalidateQueries");
    await act(() => result.current.create.mutateAsync({ productId: 1, paymentMethod: "card" }));
    await act(() => result.current.post.mutateAsync("привет"));

    expect(mockOrders.postMessage).toHaveBeenCalledWith("101", "привет");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["orders", "101", "messages"] });
  });
});

describe("use-profile", () => {
  it.each([
    ["overview", () => useProfileOverview(), mockProfile.getOverview, []],
    ["cashback", () => useCashbackProgress(), mockProfile.getCashback, []],
    ["items", () => useProfileItems("sales", "disputed"), mockProfile.listItems, ["sales", "disputed"]],
    ["history", () => useBalanceHistory(), mockProfile.getBalanceHistory, []],
    ["stats", () => useSalesStats("90d"), mockProfile.getSalesStats, ["90d"]],
  ] as Array<[string, () => unknown, jest.Mock, unknown[]]>)("loads %s", async (_n, hook, api, args) => {
    api.mockResolvedValue("data");

    const { result } = renderHookWithClient(hook);

    await waitFor(() => expect((result.current as { data: unknown }).data).toBe("data"));
    expect(api).toHaveBeenCalledWith(...args);
  });

  it("updates the balance after a deposit and keeps the rating", async () => {
    mockProfile.deposit.mockResolvedValue({ balance: 700, rating: 0 });

    const { result, client } = renderHookWithClient(() => useDepositBalance());
    client.setQueryData(PROFILE_OVERVIEW_KEY, { balance: 200, rating: 4.9 });
    await act(() => result.current.mutateAsync(500));

    expect(client.getQueryData(PROFILE_OVERVIEW_KEY)).toEqual({ balance: 700, rating: 4.9 });
  });

  it("keeps purchaseTotal after a deposit", async () => {
    mockProfile.deposit.mockResolvedValue({ balance: 700, rating: 0 });

    const { result, client } = renderHookWithClient(() => useDepositBalance());
    client.setQueryData(PROFILE_OVERVIEW_KEY, { balance: 200, rating: 4.9, purchaseTotal: 18300 });
    await act(() => result.current.mutateAsync(500));

    expect(client.getQueryData(PROFILE_OVERVIEW_KEY)).toMatchObject({ purchaseTotal: 18300 });
  });

  it("skips disabled queries", () => {
    renderHookWithClient(() => [useProfileOverview(false), useCashbackProgress(false)]);

    expect(mockProfile.getOverview).not.toHaveBeenCalled();
    expect(mockProfile.getCashback).not.toHaveBeenCalled();
  });
});

describe("use-support-chat", () => {
  it("loads topics, tickets and the ticket messages", async () => {
    mockSupport.listTopics.mockResolvedValue([]);
    mockSupport.listTickets.mockResolvedValue([]);
    mockSupport.listMessages.mockResolvedValue([]);

    const { result } = renderHookWithClient(() => [
      useSupportTopics(),
      useSupportTickets(),
      useSupportMessages(5),
    ]);

    await waitFor(() => expect(result.current[2].isSuccess).toBe(true));
    expect(mockSupport.listMessages).toHaveBeenCalledWith(5);
  });

  it("does not load when disabled or without a ticket", () => {
    renderHookWithClient(() => [useSupportTopics(false), useSupportTickets(false), useSupportMessages(null)]);

    expect(mockSupport.listTopics).not.toHaveBeenCalled();
    expect(mockSupport.listTickets).not.toHaveBeenCalled();
    expect(mockSupport.listMessages).not.toHaveBeenCalled();
  });

  it("refreshes tickets and messages after changes", async () => {
    mockSupport.postMessage.mockResolvedValue({});
    mockSupport.createTicket.mockResolvedValue({ id: 6 });
    mockSupport.closeTicket.mockResolvedValue({});

    const { result, client } = renderHookWithClient(() => [
      usePostSupportMessage(5),
      useCreateSupportTicket(),
      useCloseSupportTicket(5),
    ] as const);
    const invalidate = jest.spyOn(client, "invalidateQueries");

    await act(() => result.current[0].mutateAsync("hi"));
    expect(mockSupport.postMessage).toHaveBeenCalledWith(5, "hi");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: supportMessagesKey(5) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: SUPPORT_TICKETS_KEY });

    await act(() => result.current[1].mutateAsync({ topicId: 1, text: "Вопрос" }));
    expect(mockSupport.createTicket).toHaveBeenCalledWith({ topicId: 1, text: "Вопрос" });

    await act(() => result.current[2].mutateAsync());
    expect(mockSupport.closeTicket).toHaveBeenCalledWith(5);
  });
});
