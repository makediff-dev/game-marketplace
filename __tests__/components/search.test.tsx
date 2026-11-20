import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockCatalog = { listSegments: jest.fn(), listCategories: jest.fn(), search: jest.fn() };

jest.mock("@/api/catalog.api", () => ({ CatalogApi: { getInstance: () => mockCatalog } }));

import { GamesCatalogScreen } from "@/components/games-catalog-screen";
import { SearchOverlay } from "@/components/search-overlay";
import { SearchScreen } from "@/components/search-screen";
import type { TCatalogCategory, TCatalogSearchHit } from "@/types/catalog";

import { renderWithClient, setNavigation } from "../utils";

const hit = (slug: string, offerTypes: string[] = []): TCatalogSearchHit => ({
  id: slug.length,
  name: slug.toUpperCase(),
  slug,
  icon: `/${slug}.png`,
  offerTypes,
});

const SEGMENTS = [
  { id: 1, name: "Игры", slug: "games", icon: "gamepad", sortOrder: 1, count: 5 },
  { id: 2, name: "Мобильные", slug: "mobile", icon: "phone", sortOrder: 2, count: 3 },
];

beforeEach(() => {
  mockCatalog.listSegments.mockResolvedValue(SEGMENTS);
  mockCatalog.search.mockImplementation(async (q: string) =>
    q.trim() ? { recent: [hit("cs2", ["Аккаунты", "Скины"])], popular: [] } : { recent: [], popular: [hit("steam")] },
  );
});

describe("GamesCatalogScreen", () => {
  const cats = (n: number): TCatalogCategory[] =>
    Array.from({ length: n }, (_, i) => ({ id: i, slug: `g${i}`, name: `Игра ${i}`, icon: "", sortOrder: i, badge: i === 0 ? "Новое" : undefined }));

  it("loads categories of the first segment, then of the chosen one", async () => {
    mockCatalog.listCategories.mockResolvedValue(cats(2));
    renderWithClient(<GamesCatalogScreen />);

    expect(await screen.findByRole("link", { name: /Игра 0/ })).toHaveAttribute("href", "/catalog/g0");
    expect(screen.getByText("Новое")).toBeInTheDocument();
    expect(mockCatalog.listCategories).toHaveBeenCalledWith("games");

    await userEvent.click(screen.getByRole("button", { name: /Мобильные/ }));
    await waitFor(() => expect(mockCatalog.listCategories).toHaveBeenCalledWith("mobile"));
  });

  it("shows forty categories and expands", async () => {
    mockCatalog.listCategories.mockResolvedValue(cats(45));
    renderWithClient(<GamesCatalogScreen />);

    await screen.findByRole("link", { name: /Игра 0/ });
    expect(screen.getAllByRole("link")).toHaveLength(40);
    await userEvent.click(screen.getByRole("button", { name: "Показать еще" }));
    expect(screen.getAllByRole("link")).toHaveLength(45);
    await userEvent.click(screen.getByRole("button", { name: "Скрыть" }));
    expect(screen.getAllByRole("link")).toHaveLength(40);
  });

  it("says when a segment is empty", async () => {
    mockCatalog.listCategories.mockResolvedValue([]);
    renderWithClient(<GamesCatalogScreen />);

    expect(await screen.findByText("Нет категорий")).toBeInTheDocument();
  });
});

describe("SearchOverlay", () => {
  it("shows popular categories for an empty query", async () => {
    renderWithClient(<SearchOverlay query="" onClose={jest.fn()} />);

    expect(await screen.findByRole("link", { name: /STEAM/ })).toHaveAttribute("href", "/catalog/steam");
    expect(screen.getByRole("heading", { name: "🔥 Популярные" })).toBeInTheDocument();
  });

  it("lists goods and links to all results", async () => {
    mockCatalog.search.mockResolvedValue({
      recent: [hit("cs2")],
      popular: [],
      products: [{ id: 9, slug: "p9", title: "Prime аккаунт", game: "CS2", price: 500, image: "/p.png", tone: "ok" }],
    });
    const onClose = jest.fn();
    renderWithClient(<SearchOverlay query="кс" onClose={onClose} />);

    const product = await screen.findByRole("link", { name: /Prime аккаунт/ });
    expect(product).toHaveAttribute("href", "/product/p9");
    expect(screen.getByRole("link", { name: "Все результаты" })).toHaveAttribute("href", "/search?q=%D0%BA%D1%81");
    await userEvent.click(product);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows results and remembers the picked one", async () => {
    const onClose = jest.fn();
    renderWithClient(<SearchOverlay query="cs" onClose={onClose} />);

    const link = await screen.findByRole("link", { name: /CS2.*Аккаунты, Скины/ });
    await userEvent.click(link);

    expect(onClose).toHaveBeenCalled();
    expect(JSON.parse(window.localStorage.getItem("playnox-search-recent") ?? "[]")[0].slug).toBe("cs2");
  });

  it("lists, removes and clears recent searches", async () => {
    window.localStorage.setItem("playnox-search-recent", JSON.stringify([hit("cs2"), hit("roblox")]));
    renderWithClient(<SearchOverlay query="" onClose={jest.fn()} />);

    const recent = (await screen.findByRole("heading", { name: "👀 Вы смотрели" })).closest("section")!;
    await userEvent.click(within(recent).getAllByRole("button", { name: "Удалить" })[0]);
    expect(within(recent).queryByText("CS2")).not.toBeInTheDocument();

    await userEvent.click(within(recent).getByRole("button", { name: "Сбросить" }));
    expect(screen.queryByRole("heading", { name: "👀 Вы смотрели" })).not.toBeInTheDocument();
  });

  it("says when nothing is found", async () => {
    mockCatalog.search.mockResolvedValue({ recent: [], popular: [] });
    renderWithClient(<SearchOverlay query="zzz" onClose={jest.fn()} />);

    expect(await screen.findByText("Ничего не найдено")).toBeInTheDocument();
  });

  it("does not repeat recent searches under Популярные", async () => {
    window.localStorage.setItem("playnox-search-recent", JSON.stringify([hit("cs2")]));
    renderWithClient(<SearchOverlay query="" onClose={jest.fn()} />);

    await screen.findByRole("heading", { name: "👀 Вы смотрели" });
    expect(screen.getAllByText("CS2")).toHaveLength(1);
  });

  it("filters results by the chosen segment", async () => {
    renderWithClient(<SearchOverlay query="cs" onClose={jest.fn()} />);
    const chip = await screen.findByRole("button", { name: /Мобильные/ });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(chip);

    await waitFor(() => expect(mockCatalog.search).toHaveBeenLastCalledWith(expect.anything(), "mobile"));
    expect(chip).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(chip);
    await waitFor(() => expect(mockCatalog.search).toHaveBeenLastCalledWith("cs", null));
  });
});

describe("SearchScreen", () => {
  it("takes the query from the url and searches as you type", async () => {
    setNavigation({ pathname: "/search", search: "q=cs" });
    renderWithClient(<SearchScreen />);

    expect(screen.getByRole("searchbox", { name: "Поиск товаров" })).toHaveValue("cs");
    expect(await screen.findByRole("heading", { name: "Игры и приложения" })).toBeInTheDocument();
    await userEvent.click(await screen.findByRole("link", { name: /CS2/ }));
    expect(window.localStorage.getItem("playnox-search-recent")).toContain("cs2");
  });

  it("shows found goods under the games", async () => {
    mockCatalog.search.mockResolvedValue({
      recent: [],
      popular: [],
      products: [{ id: 9, slug: "p9", title: "Prime аккаунт", game: "CS2", price: 500, image: "/p.png", tone: "ok" }],
    });
    setNavigation({ pathname: "/search", search: "q=prime" });
    renderWithClient(<SearchScreen />);

    expect(await screen.findByRole("heading", { name: "Товары" })).toBeInTheDocument();
    expect(screen.getByText("Игр не нашлось")).toBeInTheDocument();
    expect(screen.getByText("CS2")).toBeInTheDocument();
  });

  it("shows recent searches first and can clear them", async () => {
    window.localStorage.setItem("playnox-search-recent", JSON.stringify([hit("roblox")]));
    renderWithClient(<SearchScreen />);

    expect(await screen.findByRole("heading", { name: "👀 Вы смотрели" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Очистить" }));
    expect(await screen.findByRole("heading", { name: "🔥 Популярные" })).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /STEAM/ })).toBeInTheDocument();
  });

  it("says when nothing is found", async () => {
    mockCatalog.search.mockResolvedValue({ recent: [], popular: [] });
    renderWithClient(<SearchScreen />);
    await userEvent.type(screen.getByRole("searchbox"), "zzz");

    expect(await screen.findByText("Ничего не найдено")).toBeInTheDocument();
  });

  it("debounces typing", async () => {
    renderWithClient(<SearchScreen />);
    await userEvent.type(screen.getByRole("searchbox"), "counter");

    await waitFor(() => expect(mockCatalog.search).toHaveBeenCalled());
    expect(mockCatalog.search.mock.calls.length).toBeLessThanOrEqual(2);
  });
});
