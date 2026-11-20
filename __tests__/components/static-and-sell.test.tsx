import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockAuth = { getProfile: jest.fn() };
const mockCatalog = { listSegments: jest.fn(), listCategories: jest.fn(), getFees: jest.fn() };

jest.mock("@/api/auth.api", () => ({ AuthApi: { getInstance: () => mockAuth } }));
jest.mock("@/api/catalog.api", () => ({ CatalogApi: { getInstance: () => mockCatalog } }));

import { BackLink } from "@/components/back-link";
import { ContactsScreen } from "@/components/contacts-screen";
import { FavoriteHeartIcon } from "@/components/favorite-heart-icon";
import { LegalArticle } from "@/components/legal-article";
import { SalesTermsScreen } from "@/components/sales-terms-screen";
import { SellProductSuccessModal } from "@/components/sell-product-success-modal";
import { SellScreen } from "@/components/sell-screen";
import { SellWizardTermsModal } from "@/components/sell-wizard-terms-modal";
import { SellerTermsModal } from "@/components/seller-terms-modal";
import {
  CatalogPageSkeleton,
  ListPageSkeleton,
  ProductPageSkeleton,
  ProfilePageSkeleton,
  Skeleton,
} from "@/components/skeleton";
import { SupportScreen } from "@/components/support-screen";
import { CONTACT_CARDS, SALES_TERMS, SUPPORT_FAQ } from "@/lib/static-content";
import { SELLER_TERMS_PROHIBITED, SELLER_TERMS_REQUIREMENTS, SELL_TERMS_STORAGE_KEY } from "@/lib/sell-wizard";

import { makeUser } from "../fixtures";
import { renderWithClient, router } from "../utils";

describe("static pages", () => {
  it("renders a legal article", () => {
    render(
      <LegalArticle
        title="Политика"
        lead="Вступление"
        updatedAt="1 октября"
        sections={[{ heading: "Раздел", paragraphs: ["Абзац"], items: ["Пункт"] }, { heading: "Пустой" }]}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Политика" })).toBeInTheDocument();
    expect(screen.getByText("Дата обновления: 1 октября")).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveTextContent("Пункт");
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);
  });

  it("omits the update date when unknown", () => {
    render(<LegalArticle title="T" lead="L" sections={[]} />);

    expect(screen.queryByText(/Дата обновления/)).not.toBeInTheDocument();
  });

  it("renders contacts with email and social links", () => {
    render(<ContactsScreen />);

    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(CONTACT_CARDS.length);
    for (const card of CONTACT_CARDS.filter((c) => c.email)) {
      expect(screen.getByRole("link", { name: card.email })).toHaveAttribute("href", `mailto:${card.email}`);
    }
  });

  it("renders sales terms with the fee tables", () => {
    render(<SalesTermsScreen />);

    expect(screen.getAllByRole("table")).toHaveLength(SALES_TERMS.tables.length);
    expect(screen.getByRole("link", { name: SALES_TERMS.agreementLinkLabel })).toHaveAttribute("href", "/terms");
  });

  it("renders the support FAQ", () => {
    render(<SupportScreen />);

    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(SUPPORT_FAQ.length);
  });

  it("renders small building blocks", () => {
    const { container } = render(
      <>
        <BackLink href="/x" className="extra" />
        <FavoriteHeartIcon filled />
        <FavoriteHeartIcon filled={false} size={16} />
        <Skeleton width={10} height={20} radius={4} className="bone-x" />
        <CatalogPageSkeleton />
        <ProductPageSkeleton />
        <ListPageSkeleton />
        <ProfilePageSkeleton />
      </>,
    );

    expect(screen.getByRole("link", { name: "Назад" })).toHaveClass("extra");
    expect(container.querySelectorAll("svg")).toHaveLength(2);
    expect(container.querySelector(".bone-x")).toHaveStyle({ width: "10px", height: "20px" });
    expect(screen.getAllByLabelText("Загрузка").length).toBeGreaterThanOrEqual(4);
  });
});

describe("terms modals", () => {
  const all = [...SELLER_TERMS_REQUIREMENTS, ...SELLER_TERMS_PROHIBITED];

  it("enables Принять only after every point is checked", async () => {
    const onAccept = jest.fn();
    render(<SellerTermsModal isOpen onClose={jest.fn()} onAccept={onAccept} />);

    const accept = screen.getByRole("button", { name: "Принять" });
    expect(accept).toBeDisabled();
    for (const item of all) {
      await userEvent.click(screen.getByRole("button", { name: item.label }));
    }
    expect(accept).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: all[0].label }));
    expect(accept).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: all[0].label }));
    await userEvent.click(accept);
    expect(onAccept).toHaveBeenCalled();
  });

  it("renders nothing when closed and closes on Escape or backdrop", () => {
    const onClose = jest.fn();
    const { rerender } = render(<SellerTermsModal isOpen={false} onClose={onClose} onAccept={jest.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(<SellerTermsModal isOpen onClose={onClose} onAccept={jest.fn()} />);
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("dialog"));
    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("works the same way for the wizard terms", async () => {
    const onAccept = jest.fn();
    const onClose = jest.fn();
    const items = SELLER_TERMS_REQUIREMENTS.slice(0, 2);
    render(
      <SellWizardTermsModal isOpen title="Аккаунты" blockTitle="Требования" items={items} onClose={onClose} onAccept={onAccept} />,
    );

    expect(screen.getByRole("dialog", { name: "Аккаунты" })).toBeInTheDocument();
    for (const item of items) {
      await userEvent.click(screen.getByRole("button", { name: item.label }));
    }
    await userEvent.click(screen.getByRole("button", { name: "Принять" }));
    expect(onAccept).toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("sends the seller to their goods after a new listing", async () => {
    const onClose = jest.fn();
    const onGoToListings = jest.fn();
    render(<SellProductSuccessModal isOpen productTitle="Аккаунт" onClose={onClose} onGoToListings={onGoToListings} />);

    expect(screen.getByText(/«Аккаунт» появится в каталоге после проверки/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Мои товары" }));
    await userEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onGoToListings).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("tells the seller that the listing is under moderation", () => {
    render(<SellProductSuccessModal isOpen productTitle="Аккаунт" onClose={jest.fn()} onGoToListings={jest.fn()} />);

    expect(screen.getByRole("dialog")).toHaveTextContent(/модерац/i);
  });
});

describe("SellScreen", () => {
  beforeEach(() => {
    mockCatalog.listSegments.mockResolvedValue([
      { id: 1, name: "Игры", slug: "games", icon: "", sortOrder: 1, count: 1 },
      { id: 2, name: "Мобильные", slug: "mobile", icon: "", sortOrder: 2, count: 1 },
    ]);
    mockCatalog.listCategories.mockResolvedValue([
      { id: 1, slug: "cs2", name: "CS2", icon: "/cs2.png", sortOrder: 2, segmentSlug: "games", isPopular: true },
      { id: 2, slug: "brawl", name: "Brawl", icon: "/b.png", sortOrder: 1, segmentSlug: "mobile", isPopular: true, badge: "👀" },
    ]);
  });

  it("sends a guest to sign in before selling", async () => {
    mockAuth.getProfile.mockRejectedValue(new Error("401"));
    renderWithClient(<SellScreen />);

    await userEvent.click(screen.getByRole("button", { name: "Начать продажу" }));
    expect(router.push).toHaveBeenCalledWith("/login?returnUrl=/sell");

    await userEvent.click((await screen.findAllByRole("button", { name: /CS2/ }))[0]);
    expect(router.push).toHaveBeenCalledWith(`/login?returnUrl=${encodeURIComponent("/sell/create?game=cs2")}`);
  });

  it("asks a seller to accept the terms once, then opens the wizard", async () => {
    mockAuth.getProfile.mockResolvedValue(makeUser());
    renderWithClient(<SellScreen />);

    const dialog = await screen.findByRole("dialog", { name: "Условия продажи" });
    for (const item of [...SELLER_TERMS_REQUIREMENTS, ...SELLER_TERMS_PROHIBITED]) {
      await userEvent.click(within(dialog).getByRole("button", { name: item.label }));
    }
    await userEvent.click(within(dialog).getByRole("button", { name: "Принять" }));
    expect(window.localStorage.getItem(SELL_TERMS_STORAGE_KEY)).toBe("1");
    expect(screen.queryByRole("region", { name: "Стать продавцом" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Мобильные" }));
    await userEvent.click(screen.getByRole("button", { name: /^Brawl/ }));
    expect(router.push).toHaveBeenCalledWith("/sell/create?game=brawl");
  });

  it("reopens the terms when a game is picked before accepting", async () => {
    mockAuth.getProfile.mockResolvedValue(makeUser());
    renderWithClient(<SellScreen />);

    await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Закрыть" }));
    await userEvent.click(screen.getAllByRole("button", { name: /CS2/ })[0]);
    expect(screen.getByRole("dialog", { name: "Условия продажи" })).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });

  it("calculates the payout after a 10% fee", async () => {
    mockAuth.getProfile.mockRejectedValue(new Error("401"));
    renderWithClient(<SellScreen />);

    const input = screen.getByLabelText("Цена товара");
    await userEvent.clear(input);
    await userEvent.type(input, "2 500");
    expect(screen.getByText(/^2\s250$/)).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, "abc");
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("opens on popular games from every section, then filters by section", async () => {
    mockAuth.getProfile.mockRejectedValue(new Error("401"));
    renderWithClient(<SellScreen />);

    expect(await screen.findByRole("button", { name: "Популярное" })).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(screen.getAllByText("Создать объявление")).toHaveLength(2));

    await userEvent.click(screen.getByRole("button", { name: "Игры" }));
    expect(screen.getAllByText("Создать объявление")).toHaveLength(1);
    expect(screen.getByRole("button", { name: /CS2/ })).toBeInTheDocument();
  });

  it("states one service fee", async () => {
    mockAuth.getProfile.mockRejectedValue(new Error("401"));
    mockCatalog.getFees.mockResolvedValue({ feePercent: 10, minFeePercent: 10 });
    renderWithClient(<SellScreen />);

    expect(await screen.findByText("Комиссия сервиса — 10%")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
    expect(screen.queryByText("от 5%")).not.toBeInTheDocument();
  });

  it("shows the fees from the admin panel and pays out by them", async () => {
    mockAuth.getProfile.mockRejectedValue(new Error("401"));
    mockCatalog.getFees.mockResolvedValue({ feePercent: 12.5, minFeePercent: 5 });
    renderWithClient(<SellScreen />);

    expect(await screen.findByText("от 5%")).toBeInTheDocument();
    expect(screen.getByText(/Комиссия сервиса — 12,5%, в некоторых категориях меньше/)).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText("Цена товара"));
    await userEvent.type(screen.getByLabelText("Цена товара"), "1000");
    expect(screen.getByText("875")).toBeInTheDocument();
  });
});
