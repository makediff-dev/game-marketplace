import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockCatalog = { getCategoryPage: jest.fn() };
const mockListings = { getMine: jest.fn(), update: jest.fn() };

jest.mock("@/api/catalog.api", () => ({ CatalogApi: { getInstance: () => mockCatalog } }));
jest.mock("@/api/listings.api", () => ({ ListingsApi: { getInstance: () => mockListings } }));

import { ListingEditScreen } from "@/components/listing-edit-screen";

import { renderWithClient, router } from "../utils";

const LISTING = {
  id: "7",
  ownerId: 1,
  status: "active",
  rejectReason: null,
  gameId: "cs2",
  gameName: "Counter-Strike 2",
  categoryId: "accounts",
  categoryLabel: "Аккаунты",
  deliveryMethodId: "auto",
  deliveryMethodLabel: "Автовыдача",
  listingType: "permanent",
  title: "Prime аккаунт",
  description: "Описание",
  comment: "",
  price: 1000,
  income: 900,
  server: null,
  genre: null,
  region: "Россия",
  images: ["https://cdn/a.png", "https://cdn/b.png"],
  imageIds: [11, 12],
  sellerDeliveryPayload: null,
  stock: { free: 2, sold: 5 },
  productSlug: "seller-7-prime",
  createdAt: "",
  updatedAt: "",
};

const PAGE = {
  feePercent: 10,
  filters: [
    { id: 1, key: "region", label: "Регион", fieldType: "radio", scope: "common", sortOrder: 1, config: { options: [{ value: "ru", label: "Россия" }, { value: "kz", label: "Казахстан" }] } },
  ],
  fulfillmentFormats: [
    {
      slug: "auto",
      name: "Автовыдача",
      title: "Данные аккаунта",
      mode: "instant",
      fields: [{ key: "login", label: "Логин", inputType: "text", filledBy: "seller", required: true, sortOrder: 1 }],
    },
  ],
};

beforeEach(() => {
  mockCatalog.getCategoryPage.mockResolvedValue(PAGE);
  mockListings.getMine.mockResolvedValue(LISTING);
  global.URL.createObjectURL = jest.fn(() => "blob:new");
  global.URL.revokeObjectURL = jest.fn();
});

describe("ListingEditScreen", () => {
  it("opens the listing with its data and saves a new price", async () => {
    mockListings.update.mockResolvedValue({ ...LISTING, price: 2000 });
    renderWithClient(<ListingEditScreen listingId="7" />);

    expect(await screen.findByDisplayValue("Prime аккаунт")).toBeInTheDocument();
    expect(await screen.findByText(/Осталось: 2 · Продано: 5/)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Удалить фото" })).toHaveLength(2);

    const price = screen.getByDisplayValue("1 000");
    await userEvent.clear(price);
    await userEvent.type(price, "2000");
    expect(screen.getByText("1 800")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Казахстан" }));
    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    await waitFor(() => expect(mockListings.update).toHaveBeenCalled());
    expect(mockListings.update).toHaveBeenCalledWith("7", {
      title: "Prime аккаунт",
      price: 2000,
      description: "Описание",
      comment: "",
      server: "",
      genre: "",
      region: "Казахстан",
      stockItems: undefined,
      photos: [11, 12],
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Новые цена и данные уже действуют");
    await userEvent.click(screen.getByRole("button", { name: "Мои товары" }));
    expect(router.push).toHaveBeenCalledWith("/profile?tab=goods");
  });

  it("keeps old photos by id, uploads new ones and warns about moderation", async () => {
    mockListings.update.mockResolvedValue({ ...LISTING, status: "moderation" });
    renderWithClient(<ListingEditScreen listingId="7" />);
    await screen.findByDisplayValue("Prime аккаунт");

    await userEvent.click(screen.getAllByRole("button", { name: "Удалить фото" })[0]);
    const file = new File(["x"], "c.png", { type: "image/png" });
    fireEvent.change(document.querySelector<HTMLInputElement>('input[type="file"]')!, {
      target: { files: [file] },
    });
    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    await waitFor(() => expect(mockListings.update).toHaveBeenCalled());
    expect(mockListings.update.mock.calls[0][1].photos).toEqual([12, file]);
    expect(await screen.findByRole("status")).toHaveTextContent("снова на модерации");
  });

  it("adds units to the stock without moderation", async () => {
    mockListings.update.mockResolvedValue(LISTING);
    renderWithClient(<ListingEditScreen listingId="7" />);
    await screen.findByText(/Осталось: 2/);

    await userEvent.click(screen.getByRole("button", { name: "+ Добавить позицию" }));
    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Заполните поле «Логин»");
    expect(mockListings.update).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText("Логин"), " acc_3 ");
    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    await waitFor(() => expect(mockListings.update).toHaveBeenCalled());
    expect(mockListings.update.mock.calls[0][1].stockItems).toEqual([{ login: "acc_3" }]);
  });

  it("brings a sold-out listing back with new units only", async () => {
    mockListings.getMine.mockResolvedValueOnce({ ...LISTING, status: "sold", stock: { free: 0, sold: 4 } });
    mockListings.update.mockResolvedValue({ ...LISTING, status: "active" });
    renderWithClient(<ListingEditScreen listingId="7" />);

    expect(await screen.findByText(/Товар закончился: продано 4/)).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Prime аккаунт")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Вернуть в продажу" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Заполните поле «Логин»");

    await userEvent.type(screen.getByLabelText("Логин"), "acc_9");
    await userEvent.click(screen.getByRole("button", { name: "Вернуть в продажу" }));

    await waitFor(() => expect(mockListings.update).toHaveBeenCalledWith("7", { stockItems: [{ login: "acc_9" }] }));
    expect(await screen.findByRole("status")).toHaveTextContent("товар снова в продаже");
  });

  it("says a sold one-time listing cannot be changed", async () => {
    mockListings.getMine.mockResolvedValueOnce({ ...LISTING, status: "sold", listingType: "one-time" });
    renderWithClient(<ListingEditScreen listingId="7" />);

    expect(await screen.findByText("Товар продан, изменить его нельзя.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Вернуть в продажу" })).not.toBeInTheDocument();
  });

  it("does not add units to a one-time listing", async () => {
    mockListings.getMine.mockResolvedValueOnce({ ...LISTING, listingType: "one-time", stock: { free: 1, sold: 0 } });
    renderWithClient(<ListingEditScreen listingId="7" />);

    expect(await screen.findByText(/У разового товара одна позиция/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+ Добавить позицию" })).not.toBeInTheDocument();
  });

  it("asks for a photo and a title", async () => {
    renderWithClient(<ListingEditScreen listingId="7" />);
    await screen.findByDisplayValue("Prime аккаунт");

    for (const button of screen.getAllByRole("button", { name: "Удалить фото" })) {
      await userEvent.click(button);
    }
    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Добавьте хотя бы одно фото");

    await userEvent.clear(screen.getByDisplayValue("Prime аккаунт"));
    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Укажите название товара");
    expect(mockListings.update).not.toHaveBeenCalled();
  });

  it("shows why a listing was rejected and a missing listing", async () => {
    mockListings.getMine.mockResolvedValueOnce({ ...LISTING, status: "rejected", rejectReason: "Нет скриншота" });
    const { unmount } = renderWithClient(<ListingEditScreen listingId="7" />);
    expect(await screen.findByText("Причина отказа: Нет скриншота")).toBeInTheDocument();
    unmount();

    mockListings.getMine.mockRejectedValueOnce(new Error("404"));
    renderWithClient(<ListingEditScreen listingId="8" />);
    expect(await screen.findByText("Объявление не найдено")).toBeInTheDocument();
  });
});
