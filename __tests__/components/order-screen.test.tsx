import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockOrders = {
  getOne: jest.fn(),
  listMessages: jest.fn(),
  postMessage: jest.fn(),
  fulfill: jest.fn(),
  confirm: jest.fn(),
  cancel: jest.fn(),
  dispute: jest.fn(),
};

jest.mock("@/api/orders.api", () => ({ OrdersApi: { getInstance: () => mockOrders } }));

const mockReviews = { forSeller: jest.fn(), forOrder: jest.fn(), create: jest.fn() };

jest.mock("@/api/reviews.api", () => ({ ReviewsApi: { getInstance: () => mockReviews } }));

import { OrderScreen } from "@/components/order-screen";
import { useUserStore } from "@/store/user.store";
import type { TOrder } from "@/types/orders";

import { makeOrder, makeUser } from "../fixtures";
import { renderWithClient } from "../utils";

const FUTURE = new Date(Date.now() + 3 * 3600 * 1000).toISOString();

function setup(patch: Partial<TOrder> = {}, userId = 7) {
  const order = makeOrder({ autoConfirmAt: FUTURE, ...patch });
  mockOrders.getOne.mockResolvedValue(order);
  useUserStore.getState().setUser(makeUser({ id: userId }));
  renderWithClient(<OrderScreen orderId={order.id} />);
  return order;
}

beforeEach(() => {
  localStorage.clear();
  mockReviews.forOrder.mockResolvedValue(null);
  mockOrders.listMessages.mockResolvedValue([
    { id: "1", orderId: "101", authorId: 0, authorRole: "system", text: "Заказ оплачен.", createdAt: "2026-09-20T10:00:00Z" },
    { id: "2", orderId: "101", authorId: 11, authorRole: "seller", text: "Передаю данные", createdAt: "2026-09-20T10:05:00Z" },
    { id: "3", orderId: "101", authorId: 7, authorRole: "buyer", text: "Спасибо", createdAt: "2026-09-20T10:06:00Z" },
  ]);
});

describe("OrderScreen", () => {
  it("shows loading and not found", async () => {
    mockOrders.getOne.mockRejectedValue(new Error("404"));
    renderWithClient(<OrderScreen orderId="404" />);

    expect(screen.getByLabelText("Загрузка")).toBeInTheDocument();
    expect(await screen.findByText("Заказ не найден")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "К покупкам" })).toHaveAttribute("href", "/profile?tab=purchases");
  });

  it("shows the deal to the buyer with the status, steps and chat", async () => {
    setup();

    expect(await screen.findByRole("heading", { level: 1, name: "Сделка #ORD-7-101" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Покупки" })).toHaveAttribute("href", "/profile?tab=purchases");
    expect(screen.getByText("Статус сделки")).toBeInTheDocument();
    expect(screen.getByText("Продавец выполняет")).toBeInTheDocument();
    const log = screen.getByRole("log");
    expect(await within(log).findByText("Передаю данные")).toBeInTheDocument();
    expect(within(log).getByText("Вы")).toBeInTheDocument();
    expect(within(log).getByText("seller_pro")).toBeInTheDocument();
    expect(within(log).getByText(/Заказ оплачен\. — 20\.09\.2026/)).toBeInTheDocument();
  });

  it("lets the buyer confirm the deal", async () => {
    mockOrders.confirm.mockResolvedValue(makeOrder({ status: "completed" }));
    setup({ status: "awaiting_confirm" });

    await userEvent.click(await screen.findByRole("button", { name: "Завершить сделку" }));

    expect(mockOrders.confirm).toHaveBeenCalledWith("101");
    expect(await screen.findByRole("dialog", { name: "Как прошла сделка?" })).toBeInTheDocument();
  });

  it("asks for a review once when the buyer comes back to a completed deal", async () => {
    setup({ status: "completed" });

    const dialog = await screen.findByRole("dialog", { name: "Как прошла сделка?" });
    expect(within(dialog).getByText("seller_pro")).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Закрыть" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Оставить отзыв" }));
    expect(screen.getByRole("dialog", { name: "Как прошла сделка?" })).toBeInTheDocument();
  });

  it("does not ask again after the buyer closed the review", async () => {
    localStorage.setItem("playnox-review-asked:101", "1");
    setup({ status: "completed" });

    expect(await screen.findByRole("button", { name: "Оставить отзыв" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows server errors", async () => {
    mockOrders.confirm.mockRejectedValue(new Error("x"));
    setup({ status: "awaiting_confirm" });

    await userEvent.click(await screen.findByRole("button", { name: "Завершить сделку" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Что-то пошло не так");
  });

  it("lets the seller mark the deal fulfilled", async () => {
    mockOrders.fulfill.mockResolvedValue(makeOrder({ status: "awaiting_confirm" }));
    setup({ role: "seller", counterpartyUsername: "buyer_max" }, 11);

    expect(await screen.findByRole("link", { name: "Продажи" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Завершить сделку" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Отменить сделку" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Я выполнил" }));

    expect(mockOrders.fulfill).toHaveBeenCalledWith("101", undefined);
  });

  it("marks the deal done without a form: the goods go over in the chat", async () => {
    mockOrders.fulfill.mockResolvedValue(makeOrder({ status: "awaiting_confirm" }));
    setup(
      {
        role: "seller",
        paidAt: new Date().toISOString(),
        fulfillmentFormat: {
          slug: "manual",
          name: "Передача",
          title: "Передача",
          kind: "handover",
          mode: "seller",
          deadlineHours: 24,
          fields: [
            { key: "login", label: "Логин", inputType: "text", filledBy: "seller", required: true, sortOrder: 1 },
            { key: "password", label: "Пароль", inputType: "password", filledBy: "seller", required: true, sortOrder: 2 },
          ],
        },
      },
      11,
    );

    expect(await screen.findByText(/^Передайте товар до /)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Я выполнил" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockOrders.fulfill).toHaveBeenCalledWith("101", undefined);
  });

  it("says when the handover deadline has passed", async () => {
    setup({
      paidAt: "2026-01-01T00:00:00Z",
      fulfillmentFormat: { slug: "t", name: "T", title: "T", kind: "trade", mode: "seller", deadlineHours: 2, fields: [] },
    });

    expect(await screen.findByText("Срок передачи истёк")).toBeInTheDocument();
  });

  it("masks passwords in the delivered data until asked", async () => {
    setup({
      status: "awaiting_confirm",
      deliveryPayload: { login: "acc", password: "secret" },
      fulfillmentFormat: {
        slug: "a",
        name: "A",
        title: "A",
        kind: "stock",
        mode: "instant",
        fields: [
          { key: "login", label: "Логин", inputType: "text", filledBy: "seller", required: true, sortOrder: 1 },
          { key: "password", label: "Пароль", inputType: "password", filledBy: "seller", required: true, sortOrder: 2, sensitive: true },
        ],
      },
    });

    await userEvent.click(await screen.findByRole("button", { name: "Данные товара" }));
    const dialog = screen.getByRole("dialog", { name: "Данные товара" });
    expect(within(dialog).queryByText("secret")).not.toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Показать" }));
    expect(within(dialog).getByText("secret")).toBeInTheDocument();
  });

  it("hides the fulfil button for instant delivery", async () => {
    setup({ role: "seller", fulfillmentMode: "instant" }, 11);

    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("button", { name: "Я выполнил" })).not.toBeInTheDocument();
    expect(screen.getByText("Мгновенная выдача")).toBeInTheDocument();
  });

  it("cancels an unpaid order after a confirmation", async () => {
    mockOrders.cancel.mockResolvedValue(makeOrder({ status: "cancelled" }));
    setup({ status: "pending_payment", paidAt: null });

    await userEvent.click(await screen.findByRole("button", { name: "Отменить заказ" }));
    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Назад" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Отменить заказ" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Отменить заказ" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Заказ отменён");
    expect(mockOrders.cancel).toHaveBeenCalledWith("101");
  });

  it("offers only a dispute to close a paid deal", async () => {
    setup({ status: "awaiting_fulfillment" });

    expect(await screen.findByRole("button", { name: "Открыть спор" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Отменить/ })).not.toBeInTheDocument();
  });

  it("opens a dispute on a ground from the list with a comment", async () => {
    mockOrders.dispute.mockResolvedValue(makeOrder({ status: "disputed" }));
    setup();

    await userEvent.click(await screen.findByRole("button", { name: "Открыть спор" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Открыть спор" }));
    const send = screen.getByRole("button", { name: "Отправить спор" });
    expect(send).toBeDisabled();

    const grounds = within(screen.getByRole("group", { name: "Основание спора" })).getAllByRole("radio");
    expect(grounds.map((g) => g.closest("label")?.textContent)).toEqual([
      "Товар не получен",
      "Не соответствует описанию",
      "Не активируется",
      "Нарушены сроки",
      "Нет ответа от другой стороны",
    ]);

    await userEvent.click(screen.getByRole("radio", { name: "Не активируется" }));
    await userEvent.type(screen.getByRole("textbox", { name: "Комментарий к спору" }), "  Ключ уже использован ");
    await userEvent.click(send);

    expect(mockOrders.dispute).toHaveBeenCalledWith("101", "not_activating", "Ключ уже использован");
    expect(await screen.findByRole("status")).toHaveTextContent("Спор открыт");
  });

  it("sends no comment when it is empty", async () => {
    mockOrders.dispute.mockResolvedValue(makeOrder({ status: "disputed" }));
    setup();

    await userEvent.click(await screen.findByRole("button", { name: "Открыть спор" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Открыть спор" }));
    await userEvent.click(screen.getByRole("radio", { name: "Товар не получен" }));
    await userEvent.click(screen.getByRole("button", { name: "Отправить спор" }));

    expect(mockOrders.dispute).toHaveBeenCalledWith("101", "not_received", undefined);
  });

  it("goes back from the reason step and closes it", async () => {
    setup();

    await userEvent.click(await screen.findByRole("button", { name: "Открыть спор" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Открыть спор" }));
    await userEvent.click(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Вы уверены");
    await userEvent.click(screen.getByRole("button", { name: "Отмена" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("lets the seller open a dispute on the seller grounds", async () => {
    setup({ role: "seller", status: "awaiting_confirm" }, 11);

    await userEvent.click(await screen.findByRole("button", { name: "Открыть спор" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Открыть спор" }));

    const grounds = within(screen.getByRole("group", { name: "Основание спора" })).getAllByRole("radio");
    expect(grounds.map((g) => g.closest("label")?.textContent)).toEqual([
      "Нет ответа от другой стороны",
      "Покупатель не подтверждает получение",
    ]);
  });

  it("sends chat messages", async () => {
    mockOrders.postMessage.mockResolvedValue({});
    setup();

    const input = await screen.findByLabelText("Сообщение");
    expect(screen.getByRole("button", { name: "Отправить" })).toBeDisabled();
    await userEvent.type(input, " Привет ");
    await userEvent.click(screen.getByRole("button", { name: "Отправить" }));

    expect(mockOrders.postMessage).toHaveBeenCalledWith("101", "Привет");
    await waitFor(() => expect(input).toHaveValue(""));
  });

  it("shows a send error", async () => {
    mockOrders.postMessage.mockRejectedValue(new Error("x"));
    setup();

    await userEvent.type(await screen.findByLabelText("Сообщение"), "Привет{Enter}");

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it.each([
    ["cancelled", "Отменена покупателем"],
    ["refunded", "Возврат"],
  ] as const)("locks a %s deal", async (status, text) => {
    setup({ status });

    expect(await screen.findByText(new RegExp(`Сделка завершена со статусом: ${text}`))).toBeInTheDocument();
    expect(screen.getByText("Переписка только для чтения")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Открыть спор" })).not.toBeInTheDocument();
  });

  it("shows the dispute reason", async () => {
    setup({ status: "disputed", disputeReason: "Не пришло" });

    expect(await screen.findByText("Открыт спор: Не пришло")).toBeInTheDocument();
  });

  it("says when the chat is empty", async () => {
    mockOrders.listMessages.mockResolvedValue([]);
    setup();

    expect(await screen.findByText("Сообщений пока нет")).toBeInTheDocument();
  });

  it("has no deal timer and keeps the confirm button on old deadlines", async () => {
    setup({ status: "awaiting_confirm", autoConfirmAt: "2026-01-01T00:00:00Z" });

    expect(await screen.findByRole("button", { name: "Завершить сделку" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText(/^\d{2}:\d{2}:\d{2}$/)).not.toBeInTheDocument();
  });

  it("shows the delivered data to the buyer", async () => {
    setup({
      status: "awaiting_confirm",
      fulfillmentMode: "instant",
      deliveryPayload: { password: "pa55", login: "acc_123" },
      fulfillmentFormat: {
        slug: "account",
        name: "Аккаунт",
        title: "Аккаунт",
        kind: "stock",
        mode: "instant",
        fields: [
          { key: "login", label: "Логин", inputType: "text", filledBy: "seller", required: true, sortOrder: 1 },
          { key: "password", label: "Пароль", inputType: "password", filledBy: "seller", required: true, sortOrder: 2 },
        ],
      },
    });

    expect(screen.queryByText("acc_123")).not.toBeInTheDocument();
    await userEvent.click(await screen.findByRole("button", { name: "Данные товара" }));

    const dialog = screen.getByRole("dialog", { name: "Данные товара" });
    expect(within(dialog).getAllByRole("term").map((term) => term.textContent)).toEqual(["Логин", "Пароль"]);
    expect(within(dialog).getByText("acc_123")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Скопировать: Логин" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Скопировать всё" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the buyer's data to the seller", async () => {
    setup({ role: "seller", buyerPayload: { login: "player_one" } }, 11);

    await userEvent.click(await screen.findByRole("button", { name: "Данные покупателя" }));

    const dialog = screen.getByRole("dialog", { name: "Данные покупателя" });
    expect(within(dialog).getByText("player_one")).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Скопировать всё" })).not.toBeInTheDocument();
  });

  it("has no data block before the goods are handed over", async () => {
    setup({ buyerPayload: { login: "player_one" } });

    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("button", { name: "Данные товара" })).not.toBeInTheDocument();
  });

  it("shows the order photo and no made-up online status", async () => {
    setup({ title: "Brawl Stars 170 гемов", image: "https://cdn/gems.png" });
    await screen.findByRole("heading", { level: 1 });

    expect(document.querySelector('img[src="/catalog/banner-cs2.png"]')).toBeNull();
    expect(document.querySelector('img[src="https://cdn/gems.png"]')).not.toBeNull();
    expect(screen.queryByText(/в сети|Online/)).not.toBeInTheDocument();
  });

  it("tells the buyer when an unpaid order runs out", async () => {
    setup({ status: "pending_payment", paidAt: null, createdAt: "2026-11-17T10:00:00.000Z" });

    expect(await screen.findByText(/Оплатите до .*товар вернётся в продажу/)).toBeInTheDocument();
  });

  it("does not offer a dispute before payment", async () => {
    setup({ status: "pending_payment", paidAt: null });

    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("button", { name: "Открыть спор" })).not.toBeInTheDocument();
  });

  it("closes modals with the cross", async () => {
    setup();

    await userEvent.click(await screen.findByRole("button", { name: "Открыть спор" }));
    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("opens the seller instruction for the buyer until they press «Понятно»", async () => {
    setup({ deliveryInstruction: "Пришлите ник в чат, передам за 10 минут" });

    const dialog = await screen.findByRole("alertdialog", { name: "Как получить товар" });
    expect(dialog).toHaveTextContent("Пришлите ник в чат, передам за 10 минут");
    expect(within(dialog).queryByRole("button", { name: "Закрыть" })).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole("button", { name: "Понятно" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(localStorage.getItem("playnox-instruction-seen:101")).toBe("1");

    await userEvent.click(screen.getByRole("button", { name: "Инструкция" }));
    expect(screen.getByRole("alertdialog", { name: "Как получить товар" })).toBeInTheDocument();
  });

  it("does not open the instruction by itself once it was read", async () => {
    localStorage.setItem("playnox-instruction-seen:101", "1");
    setup({ deliveryInstruction: "Пришлите ник в чат" });

    expect(await screen.findByRole("button", { name: "Инструкция" })).toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("lets the seller look at their instruction without opening it by itself", async () => {
    setup({ deliveryInstruction: "Пришлите ник в чат", role: "seller" }, 11);

    await userEvent.click(await screen.findByRole("button", { name: "Инструкция" }));
    expect(screen.getByRole("alertdialog", { name: "Ваша инструкция покупателю" })).toBeInTheDocument();
  });

  it("has no instruction button for deals without one", async () => {
    setup();

    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByRole("button", { name: "Инструкция" })).not.toBeInTheDocument();
  });
});
