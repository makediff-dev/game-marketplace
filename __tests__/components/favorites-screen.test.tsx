import { screen } from "@testing-library/react";

const mockFavorites = { list: jest.fn() };

jest.mock("@/api/favorites.api", () => ({ FavoritesApi: { getInstance: () => mockFavorites } }));

import { FavoritesScreen } from "@/components/favorites-screen";
import { useUserStore } from "@/store/user.store";

import { makeProduct, makeUser } from "../fixtures";
import { renderWithClient } from "../utils";

beforeEach(() => useUserStore.getState().setUser(makeUser()));

describe("FavoritesScreen", () => {
  it("lists favorite products", async () => {
    mockFavorites.list.mockResolvedValue([makeProduct({ slug: "cs2-prime", title: "Аккаунт CS2", price: 1490 })]);
    renderWithClient(<FavoritesScreen />);

    expect(screen.getByLabelText("Загрузка")).toBeInTheDocument();
    const link = await screen.findByRole("link", { name: /Аккаунт CS2/ });
    expect(link).toHaveAttribute("href", "/product/cs2-prime");
    expect(link).toHaveTextContent(/1\s490 ₽/);
  });

  it("shows the empty state with a link to the catalog", async () => {
    mockFavorites.list.mockResolvedValue([]);
    renderWithClient(<FavoritesScreen />);

    expect(await screen.findByText("Нет избранных")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Перейти в каталог" })).toHaveAttribute("href", "/");
  });

  it("shows a load error", async () => {
    mockFavorites.list.mockRejectedValue(new Error("500"));
    renderWithClient(<FavoritesScreen />);

    expect(await screen.findByText("Не удалось загрузить")).toBeInTheDocument();
  });
});
