import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockCatalog = { getProduct: jest.fn(), listProducts: jest.fn(), countView: jest.fn() };
const mockFavorites = { listIds: jest.fn(), toggle: jest.fn() };
const mockProfile = { getOverview: jest.fn() };

jest.mock("@/api/catalog.api", () => ({ CatalogApi: { getInstance: () => mockCatalog } }));
jest.mock("@/api/favorites.api", () => ({ FavoritesApi: { getInstance: () => mockFavorites } }));
jest.mock("@/api/profile.api", () => ({ ProfileApi: { getInstance: () => mockProfile } }));
jest.mock("@/api/orders.api", () => ({ OrdersApi: { getInstance: () => ({}) } }));

import { ProductCard } from "@/components/product-card";
import { ProductScreen } from "@/components/product-screen";
import { readRecentProducts, rememberProduct } from "@/lib/recent-products";
import { useUserStore } from "@/store/user.store";

import { makeProduct, makeUser } from "../fixtures";
import { renderWithClient } from "../utils";

describe("ProductCard", () => {
  it("links the card and the buy button to the product page", () => {
    renderWithClient(<ProductCard product={makeProduct({ slug: "cs2-prime" })} />);

    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("href", "/product/cs2-prime");
    }
    expect(screen.getByRole("link", { name: "Купить" })).toBeInTheDocument();
  });

  it("shows price, discount, seller and status", () => {
    renderWithClient(
      <ProductCard
        product={makeProduct({
          price: 900,
          oldPrice: 1000,
          discount: "-10%",
          unitHint: "/ шт.",
          seller: "seller_pro",
          sellerOnline: false,
          rating: "4.2",
          fulfillmentTime: "до 1 часа",
        })}
      />,
    );

    expect(screen.getByText("900 ₽")).toBeInTheDocument();
    expect(screen.getByText(/^1\s000 ₽$/)).toBeInTheDocument();
    expect(screen.getByText("-10%")).toBeInTheDocument();
    expect(screen.getByText("seller_pro")).toBeInTheDocument();
    expect(screen.getByText("Не в сети")).toBeInTheDocument();
  });

  it("does not invent an online status", () => {
    renderWithClient(<ProductCard product={makeProduct({ sellerOnline: undefined })} />);

    expect(screen.queryByText("В сети")).not.toBeInTheDocument();
  });

  it("shows sales in grey and no delivery time", () => {
    const { rerender } = renderWithClient(
      <ProductCard product={makeProduct({ soldCount: 12, fulfillmentTime: "до 1 часа" })} />,
    );

    expect(screen.getByText("12 продаж")).toBeInTheDocument();
    expect(screen.queryByText("до 1 часа")).not.toBeInTheDocument();
    expect(screen.queryByText("Мгновенно")).not.toBeInTheDocument();

    rerender(<ProductCard product={makeProduct({ soldCount: 0 })} />);
    expect(screen.queryByText(/продаж/)).not.toBeInTheDocument();
  });

  it("shows the game section under the photo", () => {
    renderWithClient(<ProductCard product={makeProduct({ productType: "Подписка" })} />);

    expect(screen.getByText("Подписка")).toBeInTheDocument();
  });

  it("keeps reviews off the card", () => {
    renderWithClient(
      <ProductCard product={makeProduct({ rating: "4.2", sellerRating: 4.6, sellerReviewCount: 12 })} />,
    );

    expect(screen.queryByText("4,6 · 12")).not.toBeInTheDocument();
    expect(screen.queryByText("4.2")).not.toBeInTheDocument();
    expect(screen.queryByText("Нет отзывов")).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /Рейтинг продавца/ })).not.toBeInTheDocument();
  });
});

describe("ProductScreen", () => {
  const product = makeProduct({
    id: 1,
    slug: "cs2-prime",
    title: "Аккаунт CS2 Prime",
    price: 1490,
    seller: "seller_pro",
    sellerVerified: true,
    description: "Как передаём: в чате\n• Почта\n• Пароль\n• Гарантия\n⚠️ Не меняйте почту",
  });
  const others = [2, 3, 4].map((id) => makeProduct({ id, slug: `p${id}`, title: `Товар ${id}` }));

  beforeEach(() => {
    useUserStore.getState().setUser(null);
    mockCatalog.countView.mockResolvedValue(undefined);
    mockCatalog.getProduct.mockResolvedValue(product);
    mockCatalog.listProducts.mockResolvedValue([product, ...others]);
    mockFavorites.listIds.mockResolvedValue([]);
    mockProfile.getOverview.mockResolvedValue({ balance: 0, rating: 0 });
  });

  it("shows a skeleton, then the product", async () => {
    renderWithClient(<ProductScreen slug="cs2-prime" />);

    expect(screen.getByLabelText("Загрузка")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { level: 1, name: "Аккаунт CS2 Prime" })).toBeInTheDocument();
    expect(screen.getByText("Официально от Playnox")).toBeInTheDocument();
    expect(screen.getByText("Не меняйте почту")).toBeInTheDocument();
    expect(mockCatalog.countView).toHaveBeenCalledWith("cs2-prime");
  });

  it("shows not found on error", async () => {
    mockCatalog.getProduct.mockRejectedValue(new Error("404"));

    renderWithClient(<ProductScreen slug="nope" />);

    expect(await screen.findByText("Товар не найден")).toBeInTheDocument();
  });

  it("expands long bullet lists", async () => {
    renderWithClient(<ProductScreen slug="cs2-prime" />);
    await screen.findByText("Почта");

    expect(screen.queryByText("Гарантия")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "ещё" }));
    expect(screen.getByText("Гарантия")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "свернуть" }));
    expect(screen.queryByText("Гарантия")).not.toBeInTheDocument();
  });

  it("asks a guest to sign in before buying or saving", async () => {
    renderWithClient(<ProductScreen slug="cs2-prime" />);

    await userEvent.click(await screen.findByRole("button", { name: "Купить" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByText("Оформление заказа")).not.toBeInTheDocument();
  });

  it("opens checkout for a signed-in buyer", async () => {
    useUserStore.getState().setUser(makeUser({ id: 7 }));

    renderWithClient(<ProductScreen slug="cs2-prime" />);
    await userEvent.click(await screen.findByRole("button", { name: "Купить" }));

    expect(screen.getByRole("dialog", { name: "Оформление заказа" })).toBeInTheDocument();
  });

  it("does not let the seller buy their own product", async () => {
    useUserStore.getState().setUser(makeUser({ id: 7 }));
    mockCatalog.getProduct.mockResolvedValue({ ...product, sellerUserId: 7 });

    renderWithClient(<ProductScreen slug="cs2-prime" />);

    expect(await screen.findByRole("button", { name: "Ваш товар" })).toBeDisabled();
    expect(mockCatalog.countView).not.toHaveBeenCalled();
  });

  it("toggles the favorite with a toast", async () => {
    useUserStore.getState().setUser(makeUser({ id: 7 }));
    mockFavorites.toggle.mockResolvedValue({ favorited: true, productIds: [1] });
    mockFavorites.listIds.mockResolvedValueOnce([]).mockResolvedValue([1]);

    renderWithClient(<ProductScreen slug="cs2-prime" />);
    await userEvent.click(await screen.findByRole("button", { name: "В избранное" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Добавлено в избранное");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Убрать из избранного" })).toHaveAttribute("aria-pressed", "true"),
    );
  });

  it("remembers the product and lists recently viewed ones", async () => {
    rememberProduct(others[0]);

    renderWithClient(<ProductScreen slug="cs2-prime" />);
    await screen.findByRole("heading", { level: 1 });

    expect(readRecentProducts()[0].slug).toBe("cs2-prime");
    const recent = screen.getByRole("heading", { name: /Вы смотрели/ }).closest("section")!;
    expect(within(recent).getByText("Товар 2")).toBeInTheDocument();

    await userEvent.click(within(recent).getByRole("button", { name: "Сбросить" }));
    expect(screen.queryByRole("heading", { name: /Вы смотрели/ })).not.toBeInTheDocument();
  });

  it("lists other products and hides the current one", async () => {
    renderWithClient(<ProductScreen slug="cs2-prime" />);

    const similar = (await screen.findByRole("heading", { name: /Похожие товары/ })).closest("section")!;
    expect(within(similar).getAllByRole("article")).toHaveLength(3);
  });

  it("shows similar products from the same game only", async () => {
    mockCatalog.listProducts.mockResolvedValue([
      product,
      makeProduct({ id: 9, slug: "steam-key", title: "Ключ Steam", categorySlug: "steam" }),
    ]);

    renderWithClient(<ProductScreen slug="cs2-prime" />);
    await screen.findByRole("heading", { level: 1 });
    await act(async () => undefined);

    expect(screen.queryByText("Ключ Steam")).not.toBeInTheDocument();
  });

  it("loads more similar products", async () => {
    mockCatalog.listProducts.mockResolvedValue(
      Array.from({ length: 12 }, (_, i) => makeProduct({ id: i + 10, slug: `s${i}`, title: `Товар ${i}` })),
    );

    renderWithClient(<ProductScreen slug="cs2-prime" />);
    await userEvent.click(await screen.findByRole("button", { name: "Показать еще" }));

    expect(screen.getByText("Товар 9")).toBeInTheDocument();
  });
});
