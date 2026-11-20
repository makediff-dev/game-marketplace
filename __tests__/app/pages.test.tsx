import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { isValidElement } from "react";

const mockCookies = { get: jest.fn() };
const mockAxiosGet = jest.fn();

jest.mock("next/headers", () => ({ cookies: async () => mockCookies }));
jest.mock("axios", () => {
  const actual = jest.requireActual("axios");
  return { ...actual, __esModule: true, default: { ...actual.default, get: (...args: unknown[]) => mockAxiosGet(...args) } };
});

import { fetchCurrentUser } from "@/api/auth.server";
import CategoryPage from "@/app/catalog/[slug]/page";
import CatalogPage from "@/app/catalog/page";
import ChatPage from "@/app/chat/page";
import ContactsPage from "@/app/contacts/page";
import FavoritesPage from "@/app/favorites/page";
import RootLayout, { metadata } from "@/app/layout";
import LoginPage from "@/app/login/page";
import OrderPage from "@/app/orders/[id]/page";
import HomePage from "@/app/page";
import PrivacyPage from "@/app/privacy/page";
import ProductLoading from "@/app/product/[slug]/loading";
import ProductPage from "@/app/product/[slug]/page";
import BalancePage from "@/app/profile/balance/page";
import NotificationsPage from "@/app/profile/notifications/page";
import ProfilePage from "@/app/profile/page";
import SalesStatsPage from "@/app/profile/sales-stats/page";
import { Providers } from "@/app/providers";
import SecurityPage from "@/app/profile/security/page";
import RegisterPage from "@/app/register/page";
import SearchPage from "@/app/search/page";
import SellCreatePage from "@/app/sell/create/page";
import SellPage from "@/app/sell/page";
import SupportPage from "@/app/support/page";
import SalesTermsPage from "@/app/terms/sales/page";
import TermsPage from "@/app/terms/page";
import CategoryLoading from "@/app/catalog/[slug]/loading";
import { AuthScreen } from "@/components/auth-screen";
import { BalanceScreen } from "@/components/balance-screen";
import { CatalogScreen } from "@/components/catalog-screen";
import { CategoryCatalogScreen } from "@/components/category-catalog-screen";
import { ChatScreen } from "@/components/chat-screen";
import { ContactsScreen } from "@/components/contacts-screen";
import { FavoritesScreen } from "@/components/favorites-screen";
import { GamesCatalogScreen } from "@/components/games-catalog-screen";
import { LegalArticle } from "@/components/legal-article";
import { NotificationsSettingsScreen } from "@/components/notifications-settings-screen";
import { OrderScreen } from "@/components/order-screen";
import { ProductScreen } from "@/components/product-screen";
import { ProfileScreen } from "@/components/profile-screen";
import { SalesStatsScreen } from "@/components/sales-stats-screen";
import { SalesTermsScreen } from "@/components/sales-terms-screen";
import { SearchScreen } from "@/components/search-screen";
import { SellScreen } from "@/components/sell-screen";
import { SellWizardScreen } from "@/components/sell-wizard-screen";
import { SiteShell } from "@/components/site-shell";
import { CatalogPageSkeleton, ListPageSkeleton, ProductPageSkeleton } from "@/components/skeleton";
import { SupportScreen } from "@/components/support-screen";
import { redirect } from "@/__tests__/navigation-mock";

import { makeUser } from "../fixtures";

type TAnyElement = ReactElement<Record<string, unknown>>;

function findChild(element: unknown, type: unknown): TAnyElement | null {
  if (!isValidElement(element)) {
    return null;
  }
  const el = element as TAnyElement;
  if (el.type === type) {
    return el;
  }
  const children = el.props.children;
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = findChild(child, type);
    if (found) {
      return found;
    }
  }
  return null;
}

describe("pages", () => {
  it.each([
    ["home", HomePage, CatalogScreen],
    ["catalog", CatalogPage, GamesCatalogScreen],
    ["contacts", ContactsPage, ContactsScreen],
    ["favorites", FavoritesPage, FavoritesScreen],
    ["support", SupportPage, SupportScreen],
    ["sell", SellPage, SellScreen],
    ["terms of sale", SalesTermsPage, SalesTermsScreen],
    ["balance", BalancePage, BalanceScreen],
    ["notifications", NotificationsPage, NotificationsSettingsScreen],
    ["sales stats", SalesStatsPage, SalesStatsScreen],
    ["search", SearchPage, SearchScreen],
    ["sell create", SellCreatePage, SellWizardScreen],
    ["chat", ChatPage, ChatScreen],
    ["profile", ProfilePage, ProfileScreen],
  ] as const)("%s page renders its screen", (_name, Page, Screen) => {
    expect(findChild((Page as () => ReactElement)(), Screen)).not.toBeNull();
  });

  it.each([
    ["privacy", PrivacyPage, "Политика конфиденциальности"],
    ["terms", TermsPage, "Пользовательское соглашение"],
  ] as const)("%s page renders the legal article", (_name, Page, title) => {
    const article = findChild(Page(), LegalArticle);

    expect(article?.props.title).toBe(title);
    expect(article?.props.sections).toEqual(expect.any(Array));
  });

  it("passes route params to dynamic screens", async () => {
    const category = await CategoryPage({ params: Promise.resolve({ slug: "steam" }) });
    const product = await ProductPage({ params: Promise.resolve({ slug: "cs2" }) });
    const order = await OrderPage({ params: Promise.resolve({ id: "101" }) });

    expect(findChild(category, CategoryCatalogScreen)?.props.slug).toBe("steam");
    expect(findChild(product, ProductScreen)?.props.slug).toBe("cs2");
    expect(findChild(order, OrderScreen)?.props.orderId).toBe("101");
  });

  it("passes the VK error to the login screen", async () => {
    const page = await LoginPage({ searchParams: Promise.resolve({ vk: "denied" }) });

    expect(findChild(page, AuthScreen)?.props.vkError).toBe("denied");
  });

  it("redirects registration to the login page", () => {
    RegisterPage();

    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("sends the removed funds protection page to the profile", () => {
    SecurityPage();

    expect(redirect).toHaveBeenCalledWith("/profile");
  });

  it("uses skeletons while routes load", () => {
    expect(findChild(ProductLoading(), ProductPageSkeleton)).not.toBeNull();
    expect(findChild(CategoryLoading(), CatalogPageSkeleton) ?? findChild(CategoryLoading(), ListPageSkeleton)).not.toBeNull();
  });
});

describe("root layout", () => {
  it("wraps pages into providers and the site shell and boots the theme", () => {
    const html = RootLayout({ children: <p>страница</p> }) as TAnyElement;

    expect(html.props.lang).toBe("ru");
    expect(findChild(html, Providers)).not.toBeNull();
    expect(findChild(html, SiteShell)).not.toBeNull();
    const script = findChild(html, "script");
    expect(String((script?.props.dangerouslySetInnerHTML as { __html: string }).__html)).toContain("playnox-theme");
    expect(metadata.title).toBe("Playnox — маркетплейс игровых товаров");
  });

  it("provides a query client", () => {
    render(
      <Providers>
        <p>внутри</p>
      </Providers>,
    );

    expect(screen.getByText("внутри")).toBeInTheDocument();
  });
});

describe("fetchCurrentUser on the server", () => {
  it("returns null without a session cookie", async () => {
    mockCookies.get.mockReturnValue(undefined);

    await expect(fetchCurrentUser()).resolves.toBeNull();
    expect(mockAxiosGet).not.toHaveBeenCalled();
  });

  it("forwards the cookie to the API", async () => {
    const user = makeUser();
    mockCookies.get.mockReturnValue({ value: "tok" });
    mockAxiosGet.mockResolvedValue({ data: user });

    await expect(fetchCurrentUser()).resolves.toEqual(user);
    expect(mockAxiosGet).toHaveBeenCalledWith("auth/me", expect.objectContaining({ headers: { Cookie: "access_token=tok" } }));
  });

  it("returns null when the API refuses", async () => {
    mockCookies.get.mockReturnValue({ value: "tok" });
    mockAxiosGet.mockRejectedValue(new Error("401"));

    await expect(fetchCurrentUser()).resolves.toBeNull();
  });
});
