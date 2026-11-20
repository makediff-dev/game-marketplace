import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockOrders = { listMine: jest.fn(), listMessages: jest.fn(), postMessage: jest.fn() };
const mockSupport = {
  listTopics: jest.fn(),
  listTickets: jest.fn(),
  createTicket: jest.fn(),
  listMessages: jest.fn(),
  postMessage: jest.fn(),
  closeTicket: jest.fn(),
};

jest.mock("@/api/orders.api", () => ({ OrdersApi: { getInstance: () => mockOrders } }));
jest.mock("@/api/support.api", () => ({ SupportApi: { getInstance: () => mockSupport } }));

import { ChatScreen } from "@/components/chat-screen";
import { isChatUnread, markChatRead } from "@/lib/chat-unread";
import { useUserStore } from "@/store/user.store";

import { makeOrder, makeUser } from "../fixtures";
import { renderWithClient, router, setNavigation } from "../utils";

const ORDERS = [
  makeOrder({ id: "101", code: "ORD-101", title: "Аккаунт CS2", lastMessageText: "Передаю", lastMessageAt: "2026-09-20T10:00:00Z" }),
  makeOrder({ id: "102", code: "ORD-102", title: "Robux", role: "seller", counterpartyUsername: "buyer_max", status: "completed", lastMessageAt: "2026-09-21T10:00:00Z" }),
  makeOrder({ id: "103", code: "ORD-103", title: "Отменённый", status: "cancelled" }),
];

const TOPICS = [
  { id: 1, name: "Проблема с заказом", needsOrder: true },
  { id: 6, name: "Другое", needsOrder: false },
];
const TICKET = {
  id: 5,
  status: "answered",
  topicName: "Проблема с заказом",
  orderCode: "ORD-101",
  lastMessageAt: "2026-09-22T10:00:00Z",
  lastMessagePreview: "Проверяем заказ",
  createdAt: "2026-09-22T09:01:00Z",
  closedAt: null,
};

beforeEach(() => {
  setNavigation({ pathname: "/chat" });
  useUserStore.getState().setUser(makeUser({ id: 7 }));
  mockOrders.listMine.mockResolvedValue(ORDERS);
  mockOrders.listMessages.mockImplementation(async (id: string) => [
    { id: `${id}-1`, orderId: id, authorId: 0, authorRole: "system", text: "Заказ оплачен.", createdAt: "2026-09-20T10:00:00Z" },
    { id: `${id}-2`, orderId: id, authorId: 11, authorRole: "seller", text: `Сообщение ${id}`, createdAt: "2026-09-20T10:01:00Z" },
    { id: `${id}-3`, orderId: id, authorId: 7, authorRole: "buyer", text: "Ответ", createdAt: "2026-09-20T10:02:00Z" },
  ]);
  mockSupport.listTopics.mockResolvedValue(TOPICS);
  mockSupport.listTickets.mockResolvedValue([TICKET]);
  mockSupport.listMessages.mockResolvedValue([
    { id: "s0", authorRole: "system", text: "Обращение создано", createdAt: "2026-09-22T09:00:00Z" },
    { id: "s1", authorRole: "user", text: "Не пришёл код", createdAt: "2026-09-22T09:01:00Z" },
    { id: "s2", authorRole: "support", text: "Проверяем заказ", createdAt: "2026-09-22T10:00:00Z" },
  ]);
});

describe("ChatScreen", () => {
  it("lists open deals newest first and opens the latest", async () => {
    renderWithClient(<ChatScreen />);

    const threads = await screen.findAllByRole("button", { name: /ORD-|Передаю/ });
    expect(threads.map((b) => b.textContent)).toEqual([
      expect.stringContaining("buyer_max"),
      expect.stringContaining("seller_pro"),
    ]);
    expect(screen.queryByText("Отменённый")).not.toBeInTheDocument();
    expect(within(threads[0]).getByText("Продажа")).toBeInTheDocument();
    expect(within(threads[1]).getByText("Покупка")).toBeInTheDocument();

    await userEvent.click(threads[0]);
    expect(await screen.findByText("Сделка закрыта — переписка только для чтения")).toBeInTheDocument();
  });

  it("opens the latest deal by default", async () => {
    renderWithClient(<ChatScreen />);

    expect(await screen.findByRole("button", { name: /buyer_max/ })).toHaveAttribute("aria-current", "true");
  });

  it("keeps the safety note on top and warns under external links", async () => {
    mockOrders.listMessages.mockResolvedValue([
      { id: "m1", orderId: "101", authorId: 11, authorRole: "seller", text: "Гайд youtube.com/x", createdAt: "2026-09-20T10:01:00Z", externalLink: true },
      { id: "m2", orderId: "101", authorId: 11, authorRole: "seller", text: "Обмен steamcommunity.com/tradeoffer", createdAt: "2026-09-20T10:02:00Z", externalLink: false },
    ]);
    setNavigation({ pathname: "/chat", search: "chat=101" });
    renderWithClient(<ChatScreen />);

    const log = await screen.findByRole("log");
    expect(within(log).getByText(/никогда не просит войти по ссылке/)).toBeInTheDocument();
    await within(log).findByText("Гайд youtube.com/x");
    expect(within(log).getAllByRole("note")).toHaveLength(1);
    expect(within(log).getByRole("note")).toHaveTextContent("Внешняя ссылка");
  });

  it("switches deals, updates the url and sends a message", async () => {
    mockOrders.postMessage.mockResolvedValue({});
    renderWithClient(<ChatScreen />);

    await userEvent.click(await screen.findByRole("button", { name: /seller_pro/ }));
    expect(`${window.location.pathname}${window.location.search}`).toBe("/chat?chat=101");
    expect(router.replace).not.toHaveBeenCalled();
    const log = screen.getByRole("log");
    expect(await within(log).findByText("Сообщение 101")).toBeInTheDocument();
    expect(within(log).getByText("Вы")).toBeInTheDocument();
    expect(within(log).getByText(/Заказ оплачен\. — /)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Открыть сделку" })).toHaveAttribute("href", "/orders/101");

    await userEvent.type(screen.getByLabelText("Сообщение"), " Привет {Enter}");
    expect(mockOrders.postMessage).toHaveBeenCalledWith("101", "Привет");
    await waitFor(() => expect(screen.getByLabelText("Сообщение")).toHaveValue(""));
  });

  it("marks unread deals and clears the mark when opened", async () => {
    markChatRead("101", "2026-09-19T00:00:00Z");
    setNavigation({ pathname: "/chat", search: "chat=102" });
    renderWithClient(<ChatScreen />);

    const thread = await screen.findByRole("button", { name: /seller_pro/ });
    expect(within(thread).getByText("!")).toBeInTheDocument();
    await userEvent.click(thread);
    expect(isChatUnread("101", "2026-09-20T10:00:00Z")).toBe(false);
  });

  it("opens the deal from the legacy ?order= link", async () => {
    setNavigation({ pathname: "/chat", search: "order=101" });
    renderWithClient(<ChatScreen />);

    expect(await screen.findByRole("button", { name: /seller_pro/ })).toHaveAttribute("aria-current", "true");
  });

  it("lists support tickets and opens one with its order", async () => {
    mockSupport.postMessage.mockResolvedValue({});
    setNavigation({ pathname: "/chat", search: "chat=support" });
    renderWithClient(<ChatScreen />);

    const ticket = await screen.findByRole("button", { name: /№5 · Проблема с заказом/ });
    expect(screen.getByRole("button", { name: /Поддержка/ })).toHaveAttribute("aria-current", "true");
    expect(within(ticket).getByText("Есть ответ")).toBeInTheDocument();
    expect(within(ticket).getByText("Заказ ORD-101")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "/support");

    await userEvent.click(ticket);
    const log = await screen.findByRole("log");
    expect(await within(log).findByText("Проверяем заказ")).toBeInTheDocument();
    expect(within(log).getByText(/Обращение создано — /)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ORD-101" })).toHaveAttribute("href", "/orders/101");
    expect(mockSupport.listMessages).toHaveBeenCalledWith(5);
    expect(isChatUnread("support-5", TICKET.lastMessageAt)).toBe(false);

    await userEvent.type(screen.getByLabelText("Сообщение"), "Ещё вопрос{Enter}");
    expect(mockSupport.postMessage).toHaveBeenCalledWith(5, "Ещё вопрос");

    await userEvent.click(screen.getByRole("button", { name: /Вопрос решён/ }));
    expect(mockSupport.closeTicket).toHaveBeenCalledWith(5);
  });

  it("creates a ticket with a topic and an order", async () => {
    mockSupport.listTickets.mockResolvedValue([]);
    mockSupport.createTicket.mockResolvedValue({ ...TICKET, id: 9, status: "open" });
    setNavigation({ pathname: "/chat", search: "chat=support" });
    renderWithClient(<ChatScreen />);

    expect(await screen.findByText(/Обращений пока нет/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Новое обращение" }));

    await userEvent.click(screen.getByRole("button", { name: "Отправить" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Выберите тему обращения");

    await userEvent.click(await screen.findByRole("combobox", { name: "Тема" }));
    await userEvent.click(screen.getByRole("option", { name: "Проблема с заказом" }));
    await userEvent.type(screen.getByLabelText("Вопрос"), "Не пришёл аккаунт");
    await userEvent.click(screen.getByRole("button", { name: "Отправить" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Выберите заказ");

    await userEvent.click(screen.getByRole("combobox", { name: /Заказ/ }));
    await userEvent.click(screen.getByRole("option", { name: "ORD-101 · Аккаунт CS2" }));
    await userEvent.click(screen.getByRole("button", { name: "Отправить" }));

    await waitFor(() =>
      expect(mockSupport.createTicket).toHaveBeenCalledWith({ topicId: 1, orderCode: "ORD-101", text: "Не пришёл аккаунт" }),
    );
    expect(await screen.findByText(/№9 · Проблема с заказом/)).toBeInTheDocument();
  });

  it("shows a closed ticket without a composer", async () => {
    mockSupport.listTickets.mockResolvedValue([{ ...TICKET, status: "closed" }]);
    setNavigation({ pathname: "/chat", search: "chat=support" });
    renderWithClient(<ChatScreen />);

    await userEvent.click(await screen.findByRole("button", { name: /№5/ }));

    expect(await screen.findByText("Обращение №5 закрыто")).toBeInTheDocument();
    expect(screen.queryByLabelText("Сообщение")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Создать новое обращение" }));
    expect(await screen.findByText("Новое обращение", { selector: "p" })).toBeInTheDocument();
  });

  it("marks support unread only for an unseen reply", async () => {
    renderWithClient(<ChatScreen />);
    const support = await screen.findByRole("button", { name: /Поддержка/ });
    await waitFor(() => expect(within(support).getByText("!")).toBeInTheDocument());
  });

  it("does not mark support for a seen reply or a ticket waiting for support", async () => {
    markChatRead("support-5", "2026-09-23T00:00:00Z");
    mockSupport.listTickets.mockResolvedValue([TICKET, { ...TICKET, id: 6, status: "open" }]);
    renderWithClient(<ChatScreen />);

    const support = await screen.findByRole("button", { name: /Поддержка/ });
    await waitFor(() => expect(mockSupport.listTickets).toHaveBeenCalled());
    expect(within(support).queryByText("!")).not.toBeInTheDocument();
  });

  it("falls back to support when there are no deals", async () => {
    mockOrders.listMine.mockResolvedValue([]);
    renderWithClient(<ChatScreen />);

    expect(await screen.findByText(/Пока нет сделок для переписки/)).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /Поддержка/ })).toHaveAttribute("aria-current", "true");
  });

  it("shows loading, errors and send failures", async () => {
    mockOrders.listMine.mockRejectedValueOnce(new Error("500"));
    const { unmount } = renderWithClient(<ChatScreen />);
    expect(screen.getByLabelText("Загрузка")).toBeInTheDocument();
    expect(await screen.findByText("Не удалось загрузить сделки")).toBeInTheDocument();
    unmount();

    mockOrders.postMessage.mockRejectedValue(new Error("x"));
    setNavigation({ pathname: "/chat", search: "chat=101" });
    renderWithClient(<ChatScreen />);
    await userEvent.type(await screen.findByLabelText("Сообщение"), "Привет{Enter}");
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("asks to pick a chat while the user is unknown", async () => {
    useUserStore.getState().setUser(null);
    renderWithClient(<ChatScreen />);

    expect(await screen.findByText("Выберите чат")).toBeInTheDocument();
  });
});
