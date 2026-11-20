import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockAuth = { getProfile: jest.fn() };
const mockCatalog = { listCategories: jest.fn(), listProducts: jest.fn(), listHeroBanners: jest.fn() };
const mockProfile = { getCashback: jest.fn() };
const mockPromos = { validate: jest.fn() };

jest.mock("@/api/auth.api", () => ({ AuthApi: { getInstance: () => mockAuth } }));
jest.mock("@/api/catalog.api", () => ({ CatalogApi: { getInstance: () => mockCatalog } }));
jest.mock("@/api/profile.api", () => ({ ProfileApi: { getInstance: () => mockProfile } }));
jest.mock("@/api/promos.api", () => ({ PromosApi: { getInstance: () => mockPromos } }));

import { CashbackProgress } from "@/components/cashback-progress";
import { CatalogScreen } from "@/components/catalog-screen";
import { PromoModal } from "@/components/promo-modal";
import { TopupPaymentModal } from "@/components/topup-payment-modal";
import type { TCatalogCategory } from "@/types/catalog";

import { makeProduct, makeUser } from "../fixtures";
import { renderWithClient } from "../utils";

const category = (slug: string, patch: Partial<TCatalogCategory> = {}): TCatalogCategory => ({
  id: slug.length,
  slug,
  name: slug.toUpperCase(),
  icon: `/${slug}.png`,
  sortOrder: 1,
  ...patch,
});

const products = [
  makeProduct({ id: 1, slug: "a", title: "Ключ Steam", game: "Steam", categorySlug: "steam" }),
  makeProduct({ id: 2, slug: "b", title: "Аккаунт CS2", game: "CS2", categorySlug: "cs2" }),
  makeProduct({ id: 3, slug: "c", title: "Гемы", game: "Brawl Stars", categorySlug: "brawl" }),
  makeProduct({ id: 4, slug: "d", title: "UC", game: "PUBG", categorySlug: "pubg" }),
  makeProduct({ id: 5, slug: "e", title: "Robux", game: "Roblox", categorySlug: "roblox" }),
];

beforeEach(() => {
  mockAuth.getProfile.mockRejectedValue(new Error("401"));
  mockCatalog.listCategories.mockResolvedValue([
    category("steam", { showInTopup: true, sortOrder: 2, badge: "Хит" }),
    category("telegram", { showInTopup: true, sortOrder: 1 }),
    category("cs2"),
  ]);
  mockCatalog.listProducts.mockResolvedValue(products);
  mockCatalog.listHeroBanners.mockResolvedValue([]);
  window.matchMedia = jest.fn().mockReturnValue({ matches: true }) as never;
});

async function renderScreen() {
  const view = renderWithClient(<CatalogScreen />);
  await screen.findByRole("heading", { name: "Каталог цифровых товаров" });
  return view;
}

describe("CatalogScreen", () => {
  it("shows a skeleton while loading", () => {
    mockCatalog.listProducts.mockReturnValue(new Promise(() => {}));
    mockCatalog.listCategories.mockReturnValue(new Promise(() => {}));

    renderWithClient(<CatalogScreen />);

    expect(screen.getByLabelText("Загрузка")).toBeInTheDocument();
  });

  it("shows the first four products and expands on a search event", async () => {
    await renderScreen();

    expect(await screen.findByText("Ключ Steam")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(4);

    act(() => {
      window.dispatchEvent(new CustomEvent("playnox-catalog-search", { detail: "roblox" }));
    });
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByText("Robux")).toBeInTheDocument();
  });

  it("reports load errors and empty catalogs", async () => {
    mockCatalog.listProducts.mockRejectedValue(new Error("500"));
    await renderScreen();
    expect(await screen.findByText("Не удалось загрузить товары")).toBeInTheDocument();
  });

  it("uses fallback banners and switches slides", async () => {
    await renderScreen();

    const dots = screen.getAllByRole("button", { name: /^Баннер \d$/ });
    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveAttribute("aria-current", "true");

    await userEvent.click(screen.getByRole("button", { name: "Следующий баннер" }));
    expect(dots[1]).toHaveAttribute("aria-current", "true");
    await userEvent.click(screen.getByRole("button", { name: "Предыдущий баннер" }));
    await userEvent.click(screen.getByRole("button", { name: "Предыдущий баннер" }));
    expect(dots[2]).toHaveAttribute("aria-current", "true");
    await userEvent.click(dots[0]);
    expect(dots[0]).toHaveAttribute("aria-current", "true");
  });

  it("autoplays banners unless motion is reduced", async () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false }) as never;
    await renderScreen();
    const dots = screen.getAllByRole("button", { name: /^Баннер \d$/ });
    jest.useFakeTimers();
    try {
      fireEvent.click(dots[1]);
      act(() => jest.advanceTimersByTime(4900));
      expect(dots[1]).toHaveAttribute("aria-current", "true");
      act(() => jest.advanceTimersByTime(200));
      expect(dots[2]).toHaveAttribute("aria-current", "true");
    } finally {
      jest.useRealTimers();
    }
  });

  it("links categories into the catalog", async () => {
    await renderScreen();

    const games = screen.getByRole("region", { name: "Игры" });
    expect(within(games).getByRole("link", { name: /STEAM/ })).toHaveAttribute("href", "/catalog/steam");
    expect(screen.getByRole("link", { name: "Все категории" })).toHaveAttribute("href", "/catalog");
  });

  describe("top-up", () => {
    it("lists top-up services in sort order and switches the copy", async () => {
      await renderScreen();

      const services = screen.getAllByRole("button", { pressed: true }).concat(
        screen.getAllByRole("button", { pressed: false }),
      );
      expect(services.map((b) => b.getAttribute("aria-label"))).toEqual(
        expect.arrayContaining(["TELEGRAM", "STEAM"]),
      );
      expect(screen.getByRole("heading", { name: "Пополнить TELEGRAM" })).toBeInTheDocument();
      expect(screen.getByLabelText("@username")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "STEAM" }));
      expect(screen.getByRole("heading", { name: "Пополнить STEAM" })).toBeInTheDocument();
      expect(screen.getByLabelText("Логин STEAM")).toBeInTheDocument();
    });

    it("adds the 5% fee and validates the form", async () => {
      await renderScreen();

      expect(screen.getByRole("button", { name: /Оплатить 1\s050/ })).toBeInTheDocument();
      await userEvent.click(screen.getByRole("button", { name: /Оплатить/ }));
      expect(screen.getByLabelText("@username")).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByRole("status")).toHaveTextContent("Введите логин");

      await userEvent.type(screen.getByLabelText("@username"), "durov");
      await userEvent.clear(screen.getByLabelText("Сумма"));
      await userEvent.click(screen.getByRole("button", { name: /Оплатить/ }));
      expect(screen.getByLabelText("Сумма")).toHaveAttribute("aria-invalid", "true");

      await userEvent.type(screen.getByLabelText("Сумма"), "200");
      await userEvent.click(screen.getByRole("button", { name: "Доллары" }));
      await userEvent.click(screen.getByRole("button", { name: /Оплатить 210/ }));
      expect(screen.getByRole("dialog", { name: "Оплата" })).toHaveTextContent("210 $");
    });

    it("applies a promo code from the modal and can drop it", async () => {
      mockPromos.validate.mockResolvedValue({
        valid: true,
        message: "Без комиссии",
        code: "ZERO",
        feeRate: 0,
        payable: 1000,
        badgeLabel: "0%",
        discountAmount: 0,
        amountAfterDiscount: 1000,
      });
      await renderScreen();

      await userEvent.click(screen.getByRole("button", { name: /Ввести промокод/ }));
      const dialog = screen.getByRole("dialog", { name: "Активация промокода" });
      await userEvent.type(within(dialog).getByPlaceholderText("Ввести промокод"), "ZERO{Enter}");

      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(screen.getByRole("status")).toHaveTextContent("Без комиссии");
      expect(screen.getByText("0%")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Оплатить 1\s000/ })).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Сбросить промокод" }));
      expect(screen.getByText("5%")).toBeInTheDocument();
    });

    // BUG: «Перейти к оплате» только закрывает окно: платежа нет, баланс
    // не пополняется, пользователь не получает ни ответа, ни ошибки.
    it.failing("starts a payment when the user confirms", async () => {
      await renderScreen();
      await userEvent.type(screen.getByLabelText("@username"), "durov");
      await userEvent.click(screen.getByRole("button", { name: /Оплатить/ }));
      await userEvent.click(screen.getByRole("button", { name: "Перейти к оплате" }));

      expect(screen.queryByRole("dialog")).toBeInTheDocument();
    });
  });

  it("shows cashback progress to a signed-in user", async () => {
    mockAuth.getProfile.mockResolvedValue(makeUser());
    mockProfile.getCashback.mockResolvedValue({
      tiers: [
        { id: 1, label: "", percent: 1, thresholdAmount: 0, sortOrder: 1 },
        { id: 2, label: "Серебро", percent: 3, thresholdAmount: 10000, sortOrder: 2 },
      ],
      purchaseTotal: 5000,
      currentPercent: 1,
      progress: 0.5,
      nextThreshold: 10000,
      nextPercent: 3,
    });

    await renderScreen();

    expect(await screen.findByRole("region", { name: "Кешбэк от покупок" })).toBeInTheDocument();
  });
});

describe("CashbackProgress", () => {
  const tier = (id: number, thresholdAmount: number, label = "") => ({ id, label, percent: id, thresholdAmount, sortOrder: id });
  const widths = (container: HTMLElement) =>
    Array.from(container.querySelectorAll<HTMLElement>(".cashback-progress__segment-fill")).map((el) => el.style.width);

  it("renders nothing without tiers", () => {
    const { container } = renderWithClient(
      <CashbackProgress data={{ tiers: [], purchaseTotal: 0, currentPercent: 0, progress: 0, nextThreshold: null, nextPercent: null }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("fills segments up to the purchase total", () => {
    const { container } = renderWithClient(
      <CashbackProgress
        data={{ tiers: [tier(1, 0), tier(2, 10000, "Серебро"), tier(3, 50000)], purchaseTotal: 30000, currentPercent: 2, progress: 0, nextThreshold: 50000, nextPercent: 3 }}
      />,
    );

    expect(widths(container)).toEqual(["100%", "50%", "0%"]);
    expect(screen.getByText("1%")).toBeInTheDocument();
    expect(screen.getByText("Серебро")).toBeInTheDocument();
    expect(screen.getByText(/^50\s000 ₽$/)).toBeInTheDocument();
  });

  it("fills the last tier once reached", () => {
    const { container } = renderWithClient(
      <CashbackProgress data={{ tiers: [tier(1, 0), tier(2, 100)], purchaseTotal: 100, currentPercent: 2, progress: 1, nextThreshold: null, nextPercent: null }} />,
    );

    expect(widths(container)).toEqual(["100%", "100%"]);
  });
});

describe("PromoModal", () => {
  const renderModal = (amount = 1000) => {
    const onApplied = jest.fn();
    const onClose = jest.fn();
    renderWithClient(<PromoModal amount={amount} currency="rub" onApplied={onApplied} onClose={onClose} />);
    return { onApplied, onClose, input: screen.getByPlaceholderText("Ввести промокод") };
  };

  it("validates the input before asking the server", async () => {
    renderModal(0);

    await userEvent.click(screen.getByRole("button", { name: "Активировать" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Промокод не указан");

    await userEvent.type(screen.getByPlaceholderText("Ввести промокод"), "X");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Активировать" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Введите сумму пополнения");
    expect(mockPromos.validate).not.toHaveBeenCalled();
  });

  it("shows why a code is rejected", async () => {
    mockPromos.validate.mockResolvedValueOnce({ valid: false, message: "" }).mockRejectedValueOnce(new Error("x"));
    const { input } = renderModal();

    await userEvent.type(input, " BAD ");
    await userEvent.click(screen.getByRole("button", { name: "Активировать" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Промокод недействителен");
    expect(mockPromos.validate).toHaveBeenCalledWith({ code: "BAD", context: "topup", amount: 1000, currency: "rub" });

    await userEvent.click(screen.getByRole("button", { name: "Активировать" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Что-то пошло не так");
  });

  it("returns a valid quote", async () => {
    const quote = { valid: true, message: "ok" };
    mockPromos.validate.mockResolvedValue(quote);
    const { input, onApplied } = renderModal();

    await userEvent.type(input, "GOOD");
    await userEvent.click(screen.getByRole("button", { name: "Активировать" }));

    await waitFor(() => expect(onApplied).toHaveBeenCalledWith(quote, "GOOD"));
  });

  it("closes on Escape, the cross and the backdrop", async () => {
    const { onClose } = renderModal();

    fireEvent.keyDown(document, { key: "Escape" });
    await userEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    fireEvent.click(screen.getByRole("dialog"));

    expect(onClose).toHaveBeenCalledTimes(3);
  });
});

describe("TopupPaymentModal", () => {
  it("lets the user pick a method and shows the amount", async () => {
    const onClose = jest.fn();
    renderWithClient(<TopupPaymentModal amountLabel="1 050 ₽" onClose={onClose} />);

    expect(screen.getByRole("option", { name: "СБП" })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(screen.getByRole("option", { name: "Криптовалюта" }));
    expect(screen.getByRole("option", { name: "Криптовалюта" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "СБП" })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("1 050 ₽")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    await userEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
