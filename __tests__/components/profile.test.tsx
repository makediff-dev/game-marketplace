import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockAuth = { getProfile: jest.fn(), updateProfile: jest.fn(), uploadAvatar: jest.fn(), logout: jest.fn() };
const mockProfile = {
  getOverview: jest.fn(),
  listItems: jest.fn(),
  getBalanceHistory: jest.fn(),
  deposit: jest.fn(),
  getSalesStats: jest.fn(),
  listWithdrawals: jest.fn(),
  withdraw: jest.fn(),
};

jest.mock("@/api/auth.api", () => ({ AuthApi: { getInstance: () => mockAuth } }));
jest.mock("@/api/profile.api", () => ({ ProfileApi: { getInstance: () => mockProfile } }));

import { AccountMenuDialog, NicknameEditDialog, WelcomeDialog } from "@/components/account-dialogs";
import { AvatarPicker } from "@/components/avatar-picker";
import { BalanceScreen } from "@/components/balance-screen";
import { ProfileCard } from "@/components/profile-card";
import { ProfileScreen } from "@/components/profile-screen";
import { SalesStatsScreen } from "@/components/sales-stats-screen";

import { makeUser } from "../fixtures";
import { renderWithClient, router, setNavigation } from "../utils";

const ITEMS = {
  "goods:active": [{ id: "l1", tab: "goods", filter: "active", title: "Аккаунт CS2", price: 1490, status: "active", href: "/product/x", image: "https://cdn/a.jpg", description: "Prime, 2000 часов" }],
  "goods:completed": [{ id: "l2", tab: "goods", filter: "completed", title: "Архивный", price: 100, status: "archived" }],
  "sales:disputed": [{ id: "104", tab: "sales", filter: "disputed", title: "PUBG UC", price: 870, status: "weird-status", href: "/orders/104" }],
};

beforeEach(() => {
  setNavigation({ pathname: "/profile" });
  mockProfile.getOverview.mockResolvedValue({ balance: 12450, rating: 4, purchaseTotal: 0 });
  mockProfile.listItems.mockImplementation(async (tab: string, filter: string) => ITEMS[`${tab}:${filter}` as keyof typeof ITEMS] ?? []);
});

describe("ProfileScreen", () => {
  it("shows the profile, balance, rating and active goods", async () => {
    renderWithClient(<ProfileScreen initialUser={makeUser({ username: "playtester" })} />);

    expect(await screen.findByRole("heading", { level: 1, name: "playtester" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /12\s450 ₽/ })).toHaveAttribute("href", "/profile/balance");
    expect(screen.getByLabelText("Рейтинг 4 из 5")).toBeInTheDocument();
    expect(screen.getByText("на Playnox с сентября 2026")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /^Аккаунт CS2/ })).toHaveAttribute("href", "/product/x");
    expect(screen.getByRole("link", { name: "Изменить «Аккаунт CS2»" })).toHaveAttribute("href", "/sell/edit/l1");
    expect(screen.getByRole("link", { name: "+ Добавить товар" })).toHaveAttribute("href", "/sell");
    expect(screen.getByText("Prime, 2000 часов")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Аккаунт CS2/ }).querySelector("img")).toHaveAttribute("src", "https://cdn/a.jpg");
  });

  it("switches tabs and filters through the url", async () => {
    renderWithClient(<ProfileScreen initialUser={makeUser()} />);
    await screen.findByRole("tab", { name: "Мои товары", selected: true });

    await userEvent.click(screen.getByRole("tab", { name: "Продажи" }));
    expect(`${window.location.pathname}${window.location.search}`).toBe("/profile?tab=sales");
    await userEvent.click(screen.getByRole("button", { name: "Спорные" }));
    expect(`${window.location.pathname}${window.location.search}`).toBe("/profile?tab=sales&filter=disputed");
    // No router navigation: the server is not asked for the page again.
    expect(router.replace).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();

    const row = await screen.findByRole("link", { name: /PUBG UC/ });
    expect(within(row).getByText("В ожидании")).toBeInTheDocument();
  });

  it("reads the tab from the url and shows empty states", async () => {
    setNavigation({ pathname: "/profile", search: "tab=purchases" });
    renderWithClient(<ProfileScreen initialUser={makeUser()} />);

    expect(await screen.findByText("Нет покупок")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Выставить товар" })).not.toBeInTheDocument();
  });

  it("offers to sell when there are no goods", async () => {
    mockProfile.listItems.mockResolvedValue([]);
    renderWithClient(<ProfileScreen initialUser={makeUser()} />);

    expect(await screen.findByRole("link", { name: "Выставить товар" })).toHaveAttribute("href", "/sell");
  });

  it("asks for a nickname when the username is a placeholder", async () => {
    mockAuth.updateProfile.mockResolvedValue(makeUser({ username: "Nick42" }));
    renderWithClient(<ProfileScreen initialUser={makeUser({ username: "player@mail.ru" })} />);

    expect(await screen.findByRole("heading", { name: "Знакомство" })).toBeInTheDocument();
    const save = screen.getByRole("button", { name: "Сохранить" });
    expect(save).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Nickname"), "ни");
    expect(screen.getByRole("alert")).toHaveTextContent("латиница и цифры");
    await userEvent.clear(screen.getByLabelText("Nickname"));
    await userEvent.type(screen.getByLabelText("Nickname"), "Nick42");
    await userEvent.click(save);

    expect(await screen.findByRole("dialog", { name: /Добро пожаловать/ })).toHaveTextContent("Nick42");
    expect(mockAuth.updateProfile).toHaveBeenCalledWith("Nick42");
  });

  it("opens the account menu", async () => {
    renderWithClient(<ProfileScreen initialUser={makeUser()} />);

    await userEvent.click(await screen.findByRole("button", { name: "Открыть меню профиля" }));
    expect(screen.getByRole("dialog", { name: "Меню" })).toBeInTheDocument();
  });

  it("does not round the rating up", async () => {
    mockProfile.getOverview.mockResolvedValue({ balance: 0, rating: 4.1 });
    const { container } = renderWithClient(<ProfileScreen initialUser={makeUser()} />);

    await screen.findByLabelText("Рейтинг 4.1 из 5");
    expect(container.querySelectorAll('img[src="/assets/star-filled.svg"]')).toHaveLength(4);
  });

  it("labels archived goods in Russian", async () => {
    setNavigation({ pathname: "/profile", search: "filter=completed" });
    renderWithClient(<ProfileScreen initialUser={makeUser()} />);

    expect(await screen.findByText("Архивный")).toBeInTheDocument();
    expect(screen.queryByText("archived")).not.toBeInTheDocument();
  });
});

describe("account dialogs", () => {
  it("links profile pages, shows the account and logs out", async () => {
    mockAuth.logout.mockResolvedValue(undefined);
    const onClose = jest.fn();
    renderWithClient(<AccountMenuDialog user={makeUser({ username: "Nick" })} onClose={onClose} />);

    expect(screen.queryByRole("button", { name: /Вкл\.|Выкл\./ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Понравившиеся товары/ })).toHaveAttribute("href", "/favorites");
    expect(screen.getByRole("link", { name: /Баланс и история/ })).toHaveAttribute("href", "/profile/balance");
    expect(screen.queryByRole("link", { name: /Защита средств/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Написать в поддержку/ })).toHaveAttribute("href", "/chat?chat=support");
    expect(screen.getByText("player@mail.ru")).toBeInTheDocument();
    expect(screen.getByText("Nick")).toBeInTheDocument();

    const notifications = screen.getByRole("link", { name: /Уведомления/ });
    expect(notifications).toHaveAttribute("href", "/profile/notifications");
    await userEvent.click(notifications);
    expect(onClose).toHaveBeenCalledTimes(1);
    onClose.mockClear();

    await userEvent.click(screen.getByRole("button", { name: /Выйти из профиля/ }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login"));

    fireEvent.click(screen.getByRole("dialog", { name: "Меню" }).parentElement!);
    expect(onClose).toHaveBeenCalled();
  });

  it("does not show the stand-in address of a VK sign-in", () => {
    renderWithClient(
      <AccountMenuDialog user={makeUser({ email: "vk-239684601@example.com" })} onClose={jest.fn()} />,
    );

    expect(screen.queryByText(/@example.com/)).not.toBeInTheDocument();
    expect(screen.getByText("Не указана")).toBeInTheDocument();
  });

  it("edits the nickname from the menu", async () => {
    mockAuth.updateProfile.mockRejectedValueOnce(new Error("taken")).mockResolvedValueOnce(makeUser({ username: "NewNick" }));
    const onClose = jest.fn();
    const onSaved = jest.fn();
    renderWithClient(<NicknameEditDialog user={makeUser({ username: "Old" })} onClose={onClose} onSaved={onSaved} />);

    const input = screen.getByLabelText("Nickname");
    expect(input).toHaveValue("Old");
    await userEvent.clear(input);
    await userEvent.type(input, "NewNick");
    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Что-то пошло не так");

    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(makeUser({ username: "NewNick" })));
    expect(onClose).toHaveBeenCalled();
  });

  it("closes the welcome dialog", async () => {
    const onClose = jest.fn();
    render(<WelcomeDialog name="Nick" since="сентября 2026" onClose={onClose} />);

    expect(screen.getByText("На Playnox с сентября 2026")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Начать" }));
    await userEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe("AvatarPicker", () => {
  const pick = (file: File) =>
    fireEvent.change(document.querySelector('input[type="file"]')!, { target: { files: [file] } });

  it("checks type and size before uploading", async () => {
    mockAuth.uploadAvatar.mockResolvedValue(makeUser({ avatarUpdatedAt: 5 }));
    renderWithClient(<AvatarPicker user={makeUser()} size={88} />);

    pick(new File(["x"], "a.gif", { type: "image/gif" }));
    expect(screen.getByRole("alert")).toHaveTextContent("JPEG, PNG или WebP");

    const big = new File(["x"], "a.png", { type: "image/png" });
    Object.defineProperty(big, "size", { value: 3 * 1024 * 1024 });
    pick(big);
    expect(screen.getByRole("alert")).toHaveTextContent("больше 2 МБ");

    const ok = new File(["x"], "a.webp", { type: "image/webp" });
    pick(ok);
    await waitFor(() => expect(mockAuth.uploadAvatar).toHaveBeenCalledWith(ok));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the uploaded photo or a placeholder", () => {
    const { container, unmount } = renderWithClient(<AvatarPicker user={makeUser()} size={72} showUploadButton={false} />);
    expect(container.querySelector("img")).toHaveAttribute("src", "/profile/user-circle.svg");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    unmount();

    const view = renderWithClient(<AvatarPicker user={makeUser({ avatarUpdatedAt: 9 })} size={72} />);
    expect(view.container.querySelector("img")?.getAttribute("src")).toContain("/auth/avatars/7?v=9");
  });

  it("shows an upload error", async () => {
    mockAuth.uploadAvatar.mockRejectedValue(new Error("x"));
    renderWithClient(<AvatarPicker user={makeUser()} size={88} />);

    pick(new File(["x"], "a.png", { type: "image/png" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Что-то пошло не так");
  });
});

describe("BalanceScreen", () => {
  beforeEach(() => {
    mockProfile.listWithdrawals.mockResolvedValue([]);
    mockProfile.getOverview.mockResolvedValue({ balance: 500, rating: 0 });
    mockProfile.getBalanceHistory.mockResolvedValue([
      { id: "1", label: "Пополнение баланса", amount: 300, status: "Выполнено" },
      { id: "2", label: "Покупка: ключ", amount: -100, status: "Выполнено" },
    ]);
  });

  it("shows the balance and the history", async () => {
    renderWithClient(<BalanceScreen />);

    expect(await screen.findByText("500 ₽")).toBeInTheDocument();
    const history = screen.getByRole("region", { name: "История операций" });
    expect(within(history).getByText("+300 ₽")).toBeInTheDocument();
    expect(within(history).getByText("-100 ₽")).toBeInTheDocument();
  });

  it("deposits the chosen preset", async () => {
    mockProfile.deposit.mockResolvedValue({ balance: 1500, rating: 0 });
    renderWithClient(<BalanceScreen />);

    await userEvent.click(await screen.findByRole("button", { name: "1000" }));
    expect(screen.getByLabelText("Сумма")).toHaveValue("1000");
    await userEvent.click(screen.getByRole("button", { name: "Пополнить баланс" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Подтвердить" }));

    await waitFor(() => expect(mockProfile.deposit).toHaveBeenCalledWith(1000));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(await screen.findByText(/^1\s500 ₽$/)).toBeInTheDocument();
  });

  it("shows a deposit error and an empty history", async () => {
    mockProfile.deposit.mockRejectedValue(new Error("x"));
    mockProfile.getBalanceHistory.mockResolvedValue([]);
    renderWithClient(<BalanceScreen />);

    expect(await screen.findByText("Операций пока нет")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Пополнить баланс" }));
    await userEvent.click(screen.getByRole("button", { name: "Подтвердить" }));
    expect(await within(screen.getByRole("dialog")).findByText(/Что-то пошло не так/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("lets the user withdraw money by СБП", async () => {
    mockProfile.withdraw.mockResolvedValue({ id: "1", status: "paid" });
    renderWithClient(<BalanceScreen />);

    await userEvent.click(await screen.findByRole("button", { name: "500" }));
    await userEvent.click(screen.getByRole("button", { name: "Вывести средства" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("по СБП");
    const confirm = within(dialog).getByRole("button", { name: "Подтвердить" });
    expect(confirm).toBeDisabled();

    await userEvent.type(within(dialog).getByLabelText("Телефон для СБП"), "+7 900 123-45-67");
    await userEvent.type(within(dialog).getByLabelText("Банк получателя"), "Т-Банк");
    await userEvent.click(confirm);

    await waitFor(() =>
      expect(mockProfile.withdraw).toHaveBeenCalledWith({ amount: 500, phone: "+7 900 123-45-67", bank: "Т-Банк" }),
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("shows why a withdrawal failed", async () => {
    mockProfile.withdraw.mockRejectedValue(new Error("x"));
    renderWithClient(<BalanceScreen />);

    await userEvent.click(await screen.findByRole("button", { name: "Вывести средства" }));
    await userEvent.type(screen.getByLabelText("Телефон для СБП"), "89001234567");
    await userEvent.type(screen.getByLabelText("Банк получателя"), "Сбер");
    await userEvent.click(screen.getByRole("button", { name: "Подтвердить" }));

    expect(await within(screen.getByRole("dialog")).findByText(/Что-то пошло не так/)).toBeInTheDocument();
  });

  it("shows the held amount and my withdrawals", async () => {
    mockProfile.getOverview.mockResolvedValue({ balance: 500, heldBalance: 1500, rating: 0 });
    mockProfile.listWithdrawals.mockResolvedValue([
      { id: "2", amount: 300, status: "rejected", bank: "Сбер", phone: "+7 ••• •••-45-67", rejectReason: "Банк отклонил", createdAt: "", processedAt: null },
      { id: "1", amount: 1000, status: "paid", bank: "Т-Банк", phone: "+7 ••• •••-45-67", rejectReason: null, createdAt: "", processedAt: null },
    ]);
    renderWithClient(<BalanceScreen />);

    expect(await screen.findByText(/Заблокировано в сделках и выводах: 1\s500 ₽/)).toBeInTheDocument();
    const list = await screen.findByRole("region", { name: "Заявки на вывод" });
    expect(within(list).getByText("Отклонено: Банк отклонил")).toBeInTheDocument();
    expect(within(list).getByText("Выплачено")).toBeInTheDocument();
    expect(within(list).getByText("СБП, Т-Банк, +7 ••• •••-45-67")).toBeInTheDocument();
  });
});

describe("SalesStatsScreen", () => {
  it("loads stats for the chosen period", async () => {
    mockProfile.getSalesStats.mockResolvedValue({
      periodLabel: "за 7 дней",
      revenue: 2250,
      revenueChange: 12.5,
      ordersCount: 3,
      ordersChange: -10,
      averageOrderValue: 750,
      successRate: 75,
      dailyRevenue: [{ label: "пн", value: 100 }, { label: "вт", value: 50 }],
      topProducts: [{ id: "1", title: "Аккаунт", salesCount: 2, revenue: 1500 }],
      avgResponseMinutes: 4,
      repeatBuyersPercent: 10,
      activeListings: 2,
      viewsToPurchasePercent: 3,
    });
    const { container } = renderWithClient(<SalesStatsScreen />);

    expect(await screen.findByText("Выручка за 7 дней")).toBeInTheDocument();
    expect(screen.getByText("+12,5% к прошлому периоду")).toBeInTheDocument();
    expect(screen.getByText("-10% к прошлому периоду")).toBeInTheDocument();
    expect(screen.getByText("2 продажи")).toBeInTheDocument();
    expect(Array.from(container.querySelectorAll<HTMLElement>(".sales-stats-page__bar")).map((b) => b.style.height)).toEqual(["100%", "50%"]);

    await userEvent.click(screen.getByRole("button", { name: "90 дней" }));
    await waitFor(() => expect(mockProfile.getSalesStats).toHaveBeenLastCalledWith("90d"));
  });

  it("shows empty sections", async () => {
    mockProfile.getSalesStats.mockResolvedValue({
      periodLabel: "", revenue: 0, revenueChange: 0, ordersCount: 0, ordersChange: 0, averageOrderValue: 0,
      successRate: 0, dailyRevenue: [], topProducts: [], avgResponseMinutes: 0, repeatBuyersPercent: 0,
      activeListings: 0, viewsToPurchasePercent: 0,
    });
    renderWithClient(<SalesStatsScreen />);

    expect(await screen.findByText("Пока нет данных за выбранный период")).toBeInTheDocument();
    expect(screen.getAllByText("без изменений")).toHaveLength(2);
  });
});

// ProfileCard нигде не подключён.
describe("unused ProfileCard", () => {
  it("shows the email and logs out", async () => {
    mockAuth.logout.mockResolvedValue(undefined);
    renderWithClient(<ProfileCard initialUser={makeUser()} />);

    expect(screen.getByText("player@mail.ru")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Выйти" }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login"));
  });
});
