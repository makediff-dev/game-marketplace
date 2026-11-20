import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockNotifications = {
  list: jest.fn(),
  markRead: jest.fn(),
  getSettings: jest.fn(),
  updateSettings: jest.fn(),
};

jest.mock("@/api/notifications.api", () => ({ NotificationsApi: { getInstance: () => mockNotifications } }));

import { NotificationsMenu } from "@/components/notifications-menu";
import { NotificationsSettingsScreen } from "@/components/notifications-settings-screen";

import { renderWithClient } from "../utils";

const item = (id: string, patch = {}) => ({
  id,
  type: "order_paid",
  title: "Заказ оплачен",
  text: "Ключ, 1 000 ₽",
  link: "/orders/5",
  read: false,
  createdAt: "2026-11-09T10:00:00.000Z",
  ...patch,
});

const SETTINGS = [
  { type: "order_paid", label: "Оплата заказа", critical: true, email: true },
  { type: "message", label: "Новые сообщения", critical: false, email: true },
  { type: "order_created", label: "Новый заказ", critical: false, email: false },
];

beforeEach(() => {
  mockNotifications.markRead.mockResolvedValue(undefined);
});

const renderMenu = (onNavigate = jest.fn()) =>
  renderWithClient(
    <NotificationsMenu buttonClassName="bell" label="Уведомления" onNavigate={onNavigate}>
      bell
    </NotificationsMenu>,
  );

describe("NotificationsMenu", () => {
  it("opens a list, keeps new ones highlighted after marking them read", async () => {
    mockNotifications.list
      .mockResolvedValueOnce({
        items: [item("2"), item("1", { title: "Спор решён", link: null, read: true, text: "" })],
        unread: 1,
      })
      .mockResolvedValue({
        items: [item("2", { read: true }), item("1", { title: "Спор решён", link: null, read: true, text: "" })],
        unread: 0,
      });
    const onNavigate = jest.fn();
    renderMenu(onNavigate);

    const bell = await screen.findByRole("button", { name: "Уведомления, непрочитанных: 1" });
    expect(screen.queryByRole("region", { name: "Уведомления" })).not.toBeInTheDocument();
    await userEvent.click(bell);

    const panel = screen.getByRole("region", { name: "Уведомления" });
    const link = within(panel).getByRole("link", { name: /Заказ оплачен/ });
    expect(link).toHaveAttribute("href", "/orders/5");
    expect(within(panel).getByRole("link", { name: "Настройки писем" })).toHaveAttribute("href", "/profile/notifications");
    await waitFor(() => expect(mockNotifications.markRead).toHaveBeenCalledWith(undefined));
    await waitFor(() => expect(screen.getByRole("button", { name: "Уведомления" })).toBeInTheDocument());

    // Read on the server now, still shown as new while the list is open.
    expect(link).toHaveTextContent("Новое:");
    expect(link.className).toMatch(/item--new/);
    expect(within(panel).getByText("Спор решён").closest("div")?.className).not.toMatch(/item--new/);

    await userEvent.click(link);
    expect(onNavigate).toHaveBeenCalled();
  });

  it("says when there is nothing yet and does not mark anything", async () => {
    mockNotifications.list.mockResolvedValue({ items: [], unread: 0 });
    renderMenu();

    await userEvent.click(await screen.findByRole("button", { name: "Уведомления" }));

    expect(await screen.findByText("Уведомлений пока нет")).toBeInTheDocument();
    expect(mockNotifications.markRead).not.toHaveBeenCalled();
  });

  it("closes on Escape and on a click outside", async () => {
    mockNotifications.list.mockResolvedValue({ items: [], unread: 0 });
    renderMenu();
    const bell = await screen.findByRole("button", { name: "Уведомления" });

    await userEvent.click(bell);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("region")).not.toBeInTheDocument();

    await userEvent.click(bell);
    await userEvent.click(document.body);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });
});

describe("NotificationsSettingsScreen", () => {
  it("shows e-mail settings and locks critical ones", async () => {
    mockNotifications.getSettings.mockResolvedValue(SETTINGS);

    renderWithClient(<NotificationsSettingsScreen />);

    const critical = await screen.findByRole("switch", { name: "Письма: Оплата заказа" });
    expect(critical).toBeDisabled();
    expect(critical).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Важное письмо, отключить нельзя")).toBeInTheDocument();
    expect(screen.queryByText(/localStorage/)).not.toBeInTheDocument();
  });

  it("turns one type off and keeps the others as they were", async () => {
    mockNotifications.getSettings.mockResolvedValue(SETTINGS);
    mockNotifications.updateSettings.mockResolvedValue(
      SETTINGS.map((s) => (s.type === "message" ? { ...s, email: false } : s)),
    );

    renderWithClient(<NotificationsSettingsScreen />);

    await userEvent.click(await screen.findByRole("switch", { name: "Письма: Новые сообщения" }));

    expect(mockNotifications.updateSettings).toHaveBeenCalledWith(["message", "order_created"]);
    await waitFor(() =>
      expect(screen.getByRole("switch", { name: "Письма: Новые сообщения" })).toHaveAttribute("aria-checked", "false"),
    );
  });

  it("shows an error when saving fails", async () => {
    mockNotifications.getSettings.mockResolvedValue(SETTINGS);
    mockNotifications.updateSettings.mockRejectedValue(new Error("x"));

    renderWithClient(<NotificationsSettingsScreen />);

    await userEvent.click(await screen.findByRole("switch", { name: "Письма: Новый заказ" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(mockNotifications.updateSettings).toHaveBeenCalledWith([]);
    expect(within(screen.getByRole("alert")).getByText(/Что-то пошло не так/)).toBeInTheDocument();
  });
});
