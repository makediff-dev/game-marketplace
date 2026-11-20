import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockAuth = { getProfile: jest.fn() };
const mockNotifications = { list: jest.fn() };
const mockCatalog = { listSegments: jest.fn(), search: jest.fn() };
const mockProfile = { getOverview: jest.fn() };

jest.mock("@/api/auth.api", () => ({ AuthApi: { getInstance: () => mockAuth } }));
jest.mock("@/api/catalog.api", () => ({ CatalogApi: { getInstance: () => mockCatalog } }));
jest.mock("@/api/profile.api", () => ({ ProfileApi: { getInstance: () => mockProfile } }));
jest.mock("@/api/notifications.api", () => ({ NotificationsApi: { getInstance: () => mockNotifications } }));

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteShell } from "@/components/site-shell";

import { makeUser } from "../fixtures";
import { renderWithClient, router, setNavigation } from "../utils";

beforeEach(() => {
  mockAuth.getProfile.mockRejectedValue(new Error("401"));
  mockNotifications.list.mockResolvedValue({ items: [], unread: 0 });
  mockCatalog.listSegments.mockResolvedValue([]);
  mockCatalog.search.mockResolvedValue({ recent: [], popular: [] });
  mockProfile.getOverview.mockRejectedValue(new Error("401"));
  document.documentElement.removeAttribute("data-theme");
});

describe("SiteHeader", () => {
  it("shows sign-in links to a guest", async () => {
    renderWithClient(<SiteHeader />);

    const nav = await screen.findByRole("navigation", { name: "Авторизация" });
    expect(within(nav).getByRole("link", { name: "Вход" })).toHaveAttribute("href", "/login");
    expect(within(nav).getByRole("link", { name: "Продать" })).toHaveAttribute("href", "/sell");
  });

  it("shows account links to a user and marks the current page", async () => {
    mockAuth.getProfile.mockResolvedValue(makeUser());
    setNavigation({ pathname: "/profile/balance" });

    renderWithClient(<SiteHeader />);

    const nav = await screen.findByRole("navigation", { name: "Аккаунт" });
    expect(within(nav).getByRole("link", { name: "Профиль" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Чаты" })).not.toHaveAttribute("aria-current");
    expect(within(nav).getByRole("button", { name: "Уведомления" })).toHaveAttribute("aria-expanded", "false");
  });

  it("shows the balance and the avatar instead of the profile caption", async () => {
    mockAuth.getProfile.mockResolvedValue(makeUser({ avatarUpdatedAt: 7 }));
    mockProfile.getOverview.mockResolvedValue({ balance: 8000, rating: 5 });

    renderWithClient(<SiteHeader />);

    const nav = await screen.findByRole("navigation", { name: "Аккаунт" });
    const link = await within(nav).findByRole("link", { name: /^Профиль, баланс 8\s000 ₽$/ });
    expect(link).toHaveAttribute("href", "/profile");
    expect(link.querySelector("img")?.getAttribute("src")).toMatch(/\/auth\/avatars\/\d+\?v=7$/);
  });

  it("shows the number of unread notifications", async () => {
    mockAuth.getProfile.mockResolvedValue(makeUser());
    mockNotifications.list.mockResolvedValue({ items: [], unread: 120 });

    renderWithClient(<SiteHeader />);

    const nav = await screen.findByRole("navigation", { name: "Аккаунт" });
    const link = await within(nav).findByRole("button", { name: "Уведомления, непрочитанных: 120" });
    expect(link).toHaveTextContent("99+");
  });

  it("does not ask for notifications without a user", async () => {
    renderWithClient(<SiteHeader />);

    await screen.findByRole("navigation", { name: "Авторизация" });
    expect(mockNotifications.list).not.toHaveBeenCalled();
  });

  it("toggles and remembers the theme", async () => {
    renderWithClient(<SiteHeader />);

    await userEvent.click(screen.getByRole("switch", { name: "Включить тёмную тему" }));
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    expect(window.localStorage.getItem("playnox-theme")).toBe("dark");

    await userEvent.click(screen.getByRole("switch", { name: "Включить светлую тему" }));
    expect(document.documentElement).not.toHaveAttribute("data-theme");
    expect(window.localStorage.getItem("playnox-theme")).toBe("light");
  });

  it("searches from the header and broadcasts the query to the catalog", async () => {
    const listener = jest.fn();
    window.addEventListener("playnox-catalog-search", listener);
    renderWithClient(<SiteHeader />);

    const input = screen.getByRole("searchbox", { name: "Поиск товаров" });
    await userEvent.type(input, "cs 2");
    expect(screen.getByRole("listbox", { name: "Результаты поиска" })).toBeInTheDocument();
    expect((listener.mock.calls.at(-1)?.[0] as CustomEvent).detail).toBe("cs 2");

    await userEvent.keyboard("{Enter}");
    expect(router.push).toHaveBeenCalledWith("/search?q=cs%202");
    window.removeEventListener("playnox-catalog-search", listener);
  });

  it("opens the search page with an empty query and closes the overlay outside", async () => {
    renderWithClient(<SiteHeader />);

    fireEvent.focus(screen.getByRole("searchbox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Открыть поиск" }));
    expect(router.push).toHaveBeenCalledWith("/search");
  });

  it("opens the mobile menu, locks scroll and closes on Escape", async () => {
    renderWithClient(<SiteHeader />);

    await userEvent.click(screen.getByRole("button", { name: "Открыть меню" }));
    const menu = screen.getByRole("dialog", { name: "Меню" });
    expect(document.body.style.overflow).toBe("hidden");
    await waitFor(() => expect(within(menu).getByRole("navigation", { name: "Мобильная навигация" })).toBeInTheDocument());

    await userEvent.type(within(menu).getByRole("searchbox"), "roblox{Enter}");
    expect(router.push).toHaveBeenCalledWith("/search?q=roblox");
    expect(screen.queryByRole("dialog", { name: "Меню" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Открыть меню" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Меню" })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });
});

describe("SiteFooter and SiteShell", () => {
  it("renders the page inside the shell with the footer links", async () => {
    renderWithClient(
      <SiteShell>
        <p>контент</p>
      </SiteShell>,
    );

    expect(screen.getByRole("main")).toHaveTextContent("контент");
    expect(screen.getByRole("link", { name: "Политика конфиденциальности" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "Условия продажи" })).toHaveAttribute("href", "/terms/sales");
  });

  it("renders the footer on its own", () => {
    renderWithClient(<SiteFooter />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
