import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockCatalog = { listCategories: jest.fn(), getCategoryPage: jest.fn() };
const mockListings = { create: jest.fn() };

jest.mock("@/api/catalog.api", () => ({ CatalogApi: { getInstance: () => mockCatalog } }));
jest.mock("@/api/listings.api", () => ({ ListingsApi: { getInstance: () => mockListings } }));

import { SellWizardScreen } from "@/components/sell-wizard-screen";
import {
  SELL_LISTING_TERMS_STORAGE_KEY,
  SELL_TERMS_STORAGE_KEY,
  getCategoryTerms,
} from "@/lib/sell-wizard";
import { useSellWizardStore } from "@/store/sell-wizard.store";

import { renderWithClient, router, setNavigation } from "../utils";

const CATEGORIES = [
  { id: 1, slug: "cs2", name: "Counter-Strike 2", icon: "/cs2.png", sortOrder: 1, segmentSlug: "games" },
  { id: 2, slug: "roblox", name: "Roblox", icon: "/roblox.png", sortOrder: 2, segmentSlug: "mobile" },
];

const PAGE = {
  category: CATEGORIES[0],
  offerTypes: [{ id: 1, slug: "accounts", name: "Аккаунты", sortOrder: 1 }],
  filters: [
    { id: 1, key: "region", label: "Регион", fieldType: "radio", scope: "common", sortOrder: 1, config: { options: [{ value: "ru", label: "Россия" }] } },
  ],
  products: [],
  total: 0,
};

const INSTRUCTION = "Пришлю логин и пароль в чат сделки за 10 минут";

beforeEach(() => {
  useSellWizardStore.getState().reset();
  useSellWizardStore.setState({ gameId: null });
  window.localStorage.setItem(SELL_TERMS_STORAGE_KEY, "1");
  setNavigation({ pathname: "/sell/create", search: "game=cs2" });
  mockCatalog.listCategories.mockResolvedValue(CATEGORIES);
  mockCatalog.getCategoryPage.mockResolvedValue(PAGE);
});

async function goToForm(listingType = "Разовое объявление") {
  renderWithClient(<SellWizardScreen />);

  await userEvent.click(await screen.findByRole("button", { name: /Аккаунты/ }));
  await userEvent.click(screen.getByRole("button", { name: "Далее" }));
  const terms = await screen.findByRole("dialog", { name: "Условия категории" });
  for (const item of within(terms).getAllByRole("button", { pressed: false })) {
    await userEvent.click(item);
  }
  await userEvent.click(within(terms).getByRole("button", { name: "Принять" }));

  await userEvent.click(await screen.findByRole("button", { name: new RegExp(listingType) }));
  await userEvent.click(screen.getByRole("button", { name: "Далее" }));
  await screen.findAllByRole("heading", { name: "Страница товара", level: 2 });
}

describe("SellWizardScreen", () => {
  it("sends the user back when the seller terms were not accepted", async () => {
    window.localStorage.removeItem(SELL_TERMS_STORAGE_KEY);
    renderWithClient(<SellWizardScreen />);

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/sell"));
  });

  it.each(["", "game=unknown"])("sends the user back for a bad game (%s)", async (search) => {
    setNavigation({ pathname: "/sell/create", search });
    renderWithClient(<SellWizardScreen />);

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/sell"));
  });

  it("walks through the steps with progress", async () => {
    renderWithClient(<SellWizardScreen />);

    expect(await screen.findByRole("heading", { name: "Выберите категорию" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByRole("button", { name: "Далее" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Назад" }));
    expect(router.push).toHaveBeenCalledWith("/sell");
  });

  it("asks for category terms once and skips them later", async () => {
    window.localStorage.setItem(SELL_LISTING_TERMS_STORAGE_KEY, "1");
    renderWithClient(<SellWizardScreen />);

    await userEvent.click(await screen.findByRole("button", { name: /Аккаунты/ }));
    await userEvent.click(screen.getByRole("button", { name: "Далее" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Тип объявления" })).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "2");
  });

  it("goes back through the steps", async () => {
    await goToForm();

    await userEvent.click(screen.getByRole("button", { name: "Назад" }));
    expect(await screen.findByRole("heading", { name: "Тип объявления" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Назад" }));
    expect(await screen.findByRole("heading", { name: "Выберите категорию" })).toBeInTheDocument();
  });

  it("validates the form and asks for the instruction", async () => {
    await goToForm();

    await userEvent.clear(screen.getAllByLabelText("Цена товара")[0]);
    await userEvent.click(screen.getAllByRole("button", { name: "Сохранить" })[0]);
    expect(screen.getAllByText("Укажите название товара")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Укажите цену товара")[0]).toBeInTheDocument();

    await userEvent.type(screen.getAllByLabelText("Цена товара")[0], "1000");
    await userEvent.type(screen.getAllByLabelText("Название товара")[0], "Аккаунт Prime");
    await userEvent.type(screen.getByRole("textbox", { name: "Инструкция для покупателя" }), "  коротко ");
    await userEvent.click(screen.getAllByRole("button", { name: "Сохранить" })[0]);
    expect(screen.getByText(/как покупатель получит товар/)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Инструкция для покупателя" })).toHaveAttribute("aria-invalid", "true");
    expect(mockListings.create).not.toHaveBeenCalled();
  });

  function addPhoto() {
    global.URL.createObjectURL = jest.fn(() => "blob:x");
    global.URL.revokeObjectURL = jest.fn();
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [new File(["x"], "a.png", { type: "image/png" })] } });
  }

  it("asks for a photo before sending the listing", async () => {
    await goToForm();

    await userEvent.type(screen.getAllByLabelText("Название товара")[0], "Аккаунт Prime");
    await userEvent.type(screen.getByRole("textbox", { name: "Инструкция для покупателя" }), INSTRUCTION);
    await userEvent.click(screen.getAllByRole("button", { name: "Сохранить" })[0]);

    expect(screen.getByText("Добавьте хотя бы одно фото")).toBeInTheDocument();
    expect(mockListings.create).not.toHaveBeenCalled();
  });

  it("sends the listing to moderation and opens my goods", async () => {
    mockListings.create.mockResolvedValue({ id: "1", title: "Аккаунт Prime", productSlug: null });
    await goToForm();
    addPhoto();

    expect(screen.getAllByText(/^900$/).length).toBeGreaterThan(0);
    await userEvent.type(screen.getAllByLabelText("Название товара")[0], " Аккаунт Prime ");
    await userEvent.click(screen.getByRole("button", { name: "Россия" }));
    await userEvent.type(screen.getByPlaceholderText("Опишите товар подробно"), "Описание");
    await userEvent.type(screen.getByRole("textbox", { name: "Инструкция для покупателя" }), " " + INSTRUCTION + " ");
    await userEvent.click(screen.getAllByRole("button", { name: "Сохранить" })[1]);

    await waitFor(() => expect(mockListings.create).toHaveBeenCalled());
    expect(mockListings.create.mock.calls[0][0]).toMatchObject({
      gameId: "cs2",
      gameName: "Counter-Strike 2",
      categoryId: "accounts",
      title: "Аккаунт Prime",
      description: "Описание",
      deliveryInstruction: INSTRUCTION,
      price: 1000,
      region: "Россия",
    });
    expect(mockListings.create.mock.calls[0][0]).not.toHaveProperty("deliveryMethodId");

    const dialog = await screen.findByRole("dialog", { name: "Объявление отправлено на модерацию" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Мои товары" }));
    expect(router.push).toHaveBeenCalledWith("/profile?tab=goods");
    expect(useSellWizardStore.getState()).toMatchObject({ step: 2, title: "", categoryId: null });
  });

  it("shows a server error", async () => {
    mockListings.create.mockRejectedValue(new Error("x"));
    await goToForm();
    addPhoto();

    await userEvent.type(screen.getAllByLabelText("Название товара")[0], "Ключ");
    await userEvent.type(screen.getByRole("textbox", { name: "Инструкция для покупателя" }), INSTRUCTION);
    await userEvent.click(screen.getAllByRole("button", { name: "Сохранить" })[0]);

    expect(await screen.findByText(/Что-то пошло не так/)).toBeInTheDocument();
  });

  it("checks photos before adding them", async () => {
    await goToForm();
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    global.URL.createObjectURL = jest.fn(() => "blob:x");
    global.URL.revokeObjectURL = jest.fn();

    fireEvent.change(input, { target: { files: [new File(["x"], "a.gif", { type: "image/gif" })] } });
    expect(screen.getByText("Можно загрузить JPEG, PNG или WebP")).toBeInTheDocument();

    fireEvent.change(input, { target: { files: [new File(["x"], "a.png", { type: "image/png" })] } });
    expect(await screen.findByRole("button", { name: "Удалить фото" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Удалить фото" }));
    expect(screen.getByRole("button", { name: "Загрузить фото" })).toBeInTheDocument();
  });

  it("opens every section without admin-set delivery methods", async () => {
    window.localStorage.setItem(SELL_LISTING_TERMS_STORAGE_KEY, "1");
    mockCatalog.getCategoryPage.mockResolvedValue({
      ...PAGE,
      offerTypes: [
        { id: 1, slug: "accounts", name: "Аккаунты", sortOrder: 1 },
        { id: 2, slug: "skins", name: "Скины", sortOrder: 2 },
      ],
    });
    renderWithClient(<SellWizardScreen />);

    const skins = await screen.findByRole("button", { name: /Скины/ });
    expect(skins).toBeEnabled();
    await userEvent.click(skins);
    await userEvent.click(screen.getByRole("button", { name: "Далее" }));

    expect(await screen.findByRole("heading", { name: "Тип объявления" })).toBeInTheDocument();
  });

  it("shows the Roblox items prohibitions even after other terms were accepted", async () => {
    window.localStorage.setItem(SELL_LISTING_TERMS_STORAGE_KEY, "1");
    setNavigation({ pathname: "/sell/create", search: "game=roblox" });
    mockCatalog.getCategoryPage.mockResolvedValue({ ...PAGE, offerTypes: [{ id: 2, slug: "items", name: "Предметы", sortOrder: 1 }] });
    renderWithClient(<SellWizardScreen />);

    await userEvent.click(await screen.findByRole("button", { name: /Предметы/ }));
    await userEvent.click(screen.getByRole("button", { name: "Далее" }));

    expect(screen.getByRole("dialog")).toHaveTextContent(getCategoryTerms("roblox", "items").items[0].label);
  });
});
