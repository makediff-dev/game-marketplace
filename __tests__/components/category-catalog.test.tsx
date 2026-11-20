import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockCatalog = { getCategoryPage: jest.fn() };

jest.mock("@/api/catalog.api", () => ({ CatalogApi: { getInstance: () => mockCatalog } }));

import { CategoryCatalogScreen } from "@/components/category-catalog-screen";
import { FilterModal } from "@/components/filter-modal";
import type { TCatalogFilterField } from "@/types/catalog";

import { makeProduct } from "../fixtures";
import { renderWithClient } from "../utils";

const field = (patch: Partial<TCatalogFilterField>): TCatalogFilterField => ({
  id: 1,
  key: "k",
  label: "L",
  fieldType: "boolean",
  scope: "common",
  sortOrder: 1,
  ...patch,
});

const FILTERS: TCatalogFilterField[] = [
  field({ id: 1, key: "price", label: "Цена", fieldType: "range" }),
  field({ id: 2, key: "region", label: "Регион", fieldType: "radio", config: { options: [{ value: "ru", label: "Россия", description: "Только РФ" }, { value: "eu", label: "Европа" }] } }),
  field({ id: 3, key: "hours", label: "Часы", fieldType: "range", config: { minPlaceholder: "мин", maxPlaceholder: "макс" } }),
  field({ id: 4, key: "discount", label: "Со скидкой", config: { icon: "discount" } }),
  field({ id: 5, key: "verified", label: "Проверенный продавец", config: { icon: "star" } }),
];

function page(count = 3, patch = {}) {
  return {
    category: { id: 1, slug: "cs2", name: "Counter-Strike 2", icon: "/cs2.png", sortOrder: 1 },
    offerTypes: [
      { id: 1, slug: "accounts", name: "Аккаунты", sortOrder: 1 },
      { id: 2, slug: "skins", name: "Скины", sortOrder: 2 },
    ],
    filters: FILTERS,
    products: Array.from({ length: count }, (_, i) => makeProduct({ id: i + 1, slug: `p${i}`, title: `Товар ${i + 1}` })),
    total: count,
    ...patch,
  };
}

const lastParams = () => mockCatalog.getCategoryPage.mock.calls.at(-1)?.[1];

describe("CategoryCatalogScreen", () => {
  beforeEach(() => mockCatalog.getCategoryPage.mockResolvedValue(page()));

  it("shows the category with its products", async () => {
    renderWithClient(<CategoryCatalogScreen slug="cs2" />);

    expect(screen.getByLabelText("Загрузка")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { level: 1, name: "Counter-Strike 2" })).toBeInTheDocument();
    expect(screen.getByText("Всего 3 товара")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(mockCatalog.getCategoryPage).toHaveBeenCalledWith("cs2", { offerType: undefined, sort: undefined });
  });

  it("shows not found and empty states", async () => {
    mockCatalog.getCategoryPage.mockRejectedValueOnce(new Error("404"));
    const { unmount } = renderWithClient(<CategoryCatalogScreen slug="nope" />);
    expect(await screen.findByText("Категория не найдена")).toBeInTheDocument();
    unmount();

    mockCatalog.getCategoryPage.mockResolvedValue(page(0));
    renderWithClient(<CategoryCatalogScreen slug="cs2" />);
    expect(await screen.findByText("Нет товаров")).toBeInTheDocument();
  });

  it("switches offer types", async () => {
    renderWithClient(<CategoryCatalogScreen slug="cs2" />);

    await userEvent.click(await screen.findByRole("button", { name: "Скины" }));

    await waitFor(() => expect(lastParams()).toEqual({ offerType: "skins", sort: undefined }));
  });

  it("shows every section by default and requests the one that is chosen", async () => {
    renderWithClient(<CategoryCatalogScreen slug="cs2" />);
    await screen.findByRole("heading", { level: 1 });

    expect(screen.getByRole("button", { name: "Все" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Аккаунты" })).toHaveAttribute("aria-pressed", "false");
    expect(lastParams()).toMatchObject({ offerType: undefined });

    await userEvent.click(screen.getByRole("button", { name: "Аккаунты" }));
    await waitFor(() => expect(lastParams()).toMatchObject({ offerType: "accounts" }));
  });

  it("sorts from the dropdown by price, seller rating and speed", async () => {
    renderWithClient(<CategoryCatalogScreen slug="cs2" />);

    const toggle = await screen.findByRole("button", { name: "Сортировка: сначала популярные" });
    await userEvent.click(toggle);
    const menu = screen.getByRole("menu", { name: "Сортировка" });
    expect(within(menu).getByRole("menuitemradio", { name: "Сначала популярные" })).toHaveAttribute("aria-checked", "true");

    await userEvent.click(within(menu).getByRole("menuitemradio", { name: "Высокий рейтинг продавца" }));
    await waitFor(() => expect(lastParams()).toMatchObject({ sort: "rating" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Сортировка: высокий рейтинг продавца" }));
    await userEvent.click(screen.getByRole("menuitemradio", { name: "Быстрая выдача" }));
    await waitFor(() => expect(lastParams()).toMatchObject({ sort: "speed" }));

    await userEvent.click(screen.getByRole("button", { name: "Сортировка: быстрая выдача" }));
    await userEvent.click(screen.getByRole("menuitemradio", { name: "Сначала популярные" }));
    await waitFor(() => expect(lastParams()).toMatchObject({ sort: undefined }));
  });

  it("closes the sort menu on Escape", async () => {
    renderWithClient(<CategoryCatalogScreen slug="cs2" />);

    await userEvent.click(await screen.findByRole("button", { name: /^Сортировка/ }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("filters by price from the dropdown", async () => {
    renderWithClient(<CategoryCatalogScreen slug="cs2" />);

    await userEvent.click(await screen.findByRole("button", { name: /Цена, ₽/ }));
    const menu = screen.getByRole("dialog", { name: "Фильтр по цене" });
    await userEvent.type(within(menu).getByLabelText("Цена от"), "100");
    await userEvent.click(within(menu).getByRole("button", { name: "Применить" }));
    await waitFor(() => expect(lastParams()).toMatchObject({ priceMin: "100" }));
    expect(screen.getByRole("button", { name: /от 100 ₽/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /от 100 ₽/ }));
    await userEvent.type(screen.getByLabelText("Цена до"), "500{Enter}");
    expect(screen.getByRole("button", { name: /100–500 ₽/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /100–500 ₽/ }));
    await userEvent.clear(screen.getByLabelText("Цена от"));
    await userEvent.click(screen.getByRole("button", { name: "Применить" }));
    expect(screen.getByRole("button", { name: /до 500 ₽/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /до 500 ₽/ }));
    await userEvent.click(screen.getByRole("button", { name: "Сбросить" }));
    expect(screen.getByRole("button", { name: /Цена, ₽/ })).toBeInTheDocument();
  });

  it("closes the price dropdown on Escape and outside clicks", async () => {
    renderWithClient(<CategoryCatalogScreen slug="cs2" />);

    await userEvent.click(await screen.findByRole("button", { name: /Цена, ₽/ }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Цена, ₽/ }));
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("applies modal filters without dropping the price", async () => {
    renderWithClient(<CategoryCatalogScreen slug="cs2" />);

    await userEvent.click(await screen.findByRole("button", { name: /Цена, ₽/ }));
    await userEvent.type(screen.getByLabelText("Цена от"), "100{Enter}");
    await userEvent.click(screen.getByRole("button", { name: "Фильтры" }));
    const modal = screen.getByRole("dialog", { name: "Фильтры" });
    expect(within(modal).queryByText("Цена")).not.toBeInTheDocument();
    await userEvent.click(within(modal).getByRole("button", { name: /Россия/ }));
    await userEvent.click(within(modal).getByRole("button", { name: "Показать" }));

    await waitFor(() => expect(lastParams()).toMatchObject({ region: "ru", priceMin: "100" }));
  });

  it("shows more than eight products on demand", async () => {
    mockCatalog.getCategoryPage.mockResolvedValue(page(10));
    renderWithClient(<CategoryCatalogScreen slug="cs2" />);

    expect(await screen.findAllByRole("article")).toHaveLength(8);
    await userEvent.click(screen.getByRole("button", { name: "Показать еще" }));
    expect(screen.getAllByRole("article")).toHaveLength(10);
    await userEvent.click(screen.getByRole("button", { name: "Скрыть" }));
    expect(screen.getAllByRole("article")).toHaveLength(8);
  });
});

describe("FilterModal", () => {
  const renderModal = (filters = FILTERS.slice(1), initialValues = {}) => {
    const onApply = jest.fn();
    const onClose = jest.fn();
    render(<FilterModal title="Фильтры" filters={filters} initialValues={initialValues} onApply={onApply} onClose={onClose} />);
    return { onApply, onClose };
  };

  it("collects radio, range and switch values", async () => {
    const { onApply } = renderModal();

    expect(screen.getByText("Только РФ")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Европа/ }));
    await userEvent.type(screen.getByPlaceholderText("мин"), "10");
    await userEvent.type(screen.getByPlaceholderText("макс"), "99");
    await userEvent.click(screen.getByRole("button", { name: "Со скидкой" }));
    await userEvent.click(screen.getByRole("button", { name: "Показать" }));

    expect(onApply).toHaveBeenCalledWith({ region: "eu", hoursMin: "10", hoursMax: "99", discount: true });
  });

  it("starts from the current values and resets them", async () => {
    const { onApply } = renderModal(FILTERS.slice(1), { region: "ru", verified: true });

    expect(screen.getByRole("button", { name: /Россия/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Проверенный продавец" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Сбросить" }));
    await userEvent.click(screen.getByRole("button", { name: "Показать" }));

    expect(onApply).toHaveBeenCalledWith({});
  });

  it("closes on Escape and on the backdrop", () => {
    const { onClose } = renderModal();

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("dialog").parentElement!);
    fireEvent.click(screen.getByRole("dialog"));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("lets several options be picked in checkbox filters", async () => {
    renderModal([
      field({ key: "platform", label: "Платформа", fieldType: "checkbox", config: { options: [{ value: "pc", label: "PC" }, { value: "ps", label: "PS5" }] } }),
    ]);

    expect(screen.getByText(/Платформа/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /PC/ }));
    await userEvent.click(screen.getByRole("button", { name: /PS5/ }));
    expect(screen.getByRole("button", { name: /PC/ })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: /PC/ }));
    expect(screen.getByRole("button", { name: /PC/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("names the switches", () => {
    renderModal();

    expect(screen.getByRole("button", { name: "Со скидкой" })).toBeInTheDocument();
  });
});
