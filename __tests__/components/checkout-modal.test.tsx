import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockOrders = { create: jest.fn() };
const mockProfile = { getOverview: jest.fn() };
const mockPromos = { validate: jest.fn() };

jest.mock("@/api/orders.api", () => ({ OrdersApi: { getInstance: () => mockOrders } }));
jest.mock("@/api/profile.api", () => ({ ProfileApi: { getInstance: () => mockProfile } }));
jest.mock("@/api/promos.api", () => ({ PromosApi: { getInstance: () => mockPromos } }));

import { CheckoutModal } from "@/components/checkout-modal";
import { useUserStore } from "@/store/user.store";

import { makeOrder, makeProduct, makeUser } from "../fixtures";
import { renderWithClient, router } from "../utils";

const accountFormat = {
  slug: "account",
  title: "Данные аккаунта",
  description: "Укажите почту",
  mode: "seller",
  fields: [
    { key: "email", label: "Почта", inputType: "email" },
    { key: "comment", label: "Комментарий", inputType: "textarea", required: false },
    { key: "code", label: "Код", filledBy: "seller" },
  ],
};

const noteFormat = {
  slug: "note",
  title: "Пожелания",
  fields: [{ key: "note", label: "Пожелание", required: false }],
};

function setup(productPatch = {}, balance = 5000) {
  mockProfile.getOverview.mockResolvedValue({ balance, rating: 5 });
  const onClose = jest.fn();
  const product = makeProduct({ price: 1490, ...productPatch });
  const utils = renderWithClient(<CheckoutModal product={product} onClose={onClose} />);
  return { ...utils, onClose, product };
}

beforeEach(() => {
  useUserStore.getState().setUser(makeUser({ id: 7 }));
});

describe("CheckoutModal", () => {
  it("asks the buyer for nothing: the seller's instruction comes after payment", () => {
    setup({ attributes: { fulfillmentFormat: accountFormat } });

    expect(screen.getByRole("dialog", { name: "Оформление заказа" })).toBeInTheDocument();
    expect(screen.queryByText("Данные аккаунта")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Почта")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /Ссылка на обмен/ })).not.toBeInTheDocument();
  });

  it("does not invent login and password when the product has no format", () => {
    setup({ categorySlug: "cs2" });

    expect(screen.queryByLabelText("Логин")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Пароль")).not.toBeInTheDocument();
  });

  it("pays by card and opens the deal", async () => {
    mockOrders.create.mockResolvedValue(makeOrder({ id: "555" }));
    const { onClose, product } = setup({ attributes: { fulfillmentFormat: accountFormat } });

    await userEvent.click(await screen.findByRole("button", { name: /^Оплатить 1\s490/ }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/orders/555"));
    expect(onClose).toHaveBeenCalled();
    expect(mockOrders.create).toHaveBeenCalledWith({
      productId: product.id,
      paymentMethod: "card",
    });
  });

  it("blocks paying from the balance when it is too low", async () => {
    setup({ categorySlug: "x", attributes: { fulfillmentFormat: noteFormat } }, 100);

    await waitFor(() => expect(screen.getByText("Доступно 100 ₽")).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: /Баланс/ }));
    await userEvent.click(screen.getByRole("button", { name: /Оплатить/ }));

    expect(screen.getByRole("alert")).toHaveTextContent("Недостаточно средств на балансе");
  });

  it("shows the server error", async () => {
    mockOrders.create.mockRejectedValue(new Error("boom"));
    setup({ attributes: { fulfillmentFormat: noteFormat } });

    await userEvent.click(screen.getByRole("button", { name: /Оплатить/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Что-то пошло не так");
  });

  it("refuses to sell the user their own product", async () => {
    setup({ sellerUserId: 7 });

    expect(screen.getByRole("button", { name: "Свой товар" })).toBeDisabled();
  });

  describe("promo code", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    const type = async (value: string) => {
      fireEvent.click(screen.getByRole("button", { name: "Ввести промокод" }));
      fireEvent.change(screen.getByLabelText("Промокод"), { target: { value } });
      await act(async () => {
        jest.advanceTimersByTime(400);
      });
    };

    it("applies a valid code to the price and the order", async () => {
      mockPromos.validate.mockResolvedValue({
        valid: true,
        message: "Скидка 10%",
        code: "PLAY10",
        discountAmount: 149,
        payable: 1341,
        feeRate: 0,
        amountAfterDiscount: 1341,
        badgeLabel: "",
      });
      mockOrders.create.mockResolvedValue(makeOrder({ id: "9" }));
      setup({ attributes: { fulfillmentFormat: noteFormat } });

      await type("play10");

      expect(mockPromos.validate).toHaveBeenCalledWith({ code: "play10", context: "marketplace", amount: 1490 });
      expect(screen.getByRole("status")).toHaveTextContent("Скидка 10%");
      fireEvent.click(screen.getByRole("button", { name: "Оплатить 1 341 ₽" }));
      await act(async () => undefined);
      expect(mockOrders.create).toHaveBeenCalledWith(expect.objectContaining({ promoCode: "PLAY10" }));
    });

    it("blocks payment with an invalid code", async () => {
      mockPromos.validate.mockResolvedValue({ valid: false, message: "Промокод не найден" });
      setup({ attributes: { fulfillmentFormat: noteFormat } });

      await type("NOPE");
      fireEvent.click(screen.getByRole("button", { name: /Оплатить/ }));

      expect(screen.getByLabelText("Промокод")).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByRole("alert")).toHaveTextContent("Промокод не найден");
      expect(mockOrders.create).not.toHaveBeenCalled();
    });

    it("clears the code when the field is closed", async () => {
      mockPromos.validate.mockResolvedValue({ valid: false, message: "Промокод не найден" });
      setup();

      await type("NOPE");
      fireEvent.click(screen.getByRole("button", { name: "Закрыть промокод" }));

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Ввести промокод" })).toBeInTheDocument();
    });
  });

  it("closes on Escape, on the overlay and on Cancel and locks the page scroll", async () => {
    const { onClose, unmount } = setup();
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("dialog"));
    await userEvent.click(screen.getByRole("button", { name: "Отмена" }));

    expect(onClose).toHaveBeenCalledTimes(3);
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
