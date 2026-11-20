import { render, screen } from "@testing-library/react";

import PaymentFailPage from "@/app/payment/fail/page";
import PaymentSuccessPage from "@/app/payment/success/page";
import { paymentReturnLinks } from "@/components/payment-result-screen";

describe("payment return pages", () => {
  it("sends the buyer back to the order", async () => {
    render(
      await PaymentSuccessPage({
        searchParams: Promise.resolve({ order: "PX-42" }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Оплата прошла" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Перейти к заказу" }),
    ).toHaveAttribute("href", "/orders/PX-42");
  });

  it("offers a retry for a failed top-up", async () => {
    render(
      await PaymentFailPage({
        searchParams: Promise.resolve({ type: "topup" }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Оплата не прошла" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Попробовать снова" }),
    ).toHaveAttribute("href", "/profile/balance");
    expect(screen.getByRole("link", { name: "поддержку" })).toHaveAttribute(
      "href",
      "/support",
    );
  });

  it("falls back to purchases and balance without params", () => {
    expect(paymentReturnLinks("success", {}).map((link) => link.href)).toEqual(
      ["/profile?tab=purchases", "/profile/balance"],
    );
  });

  it("ignores an order code that is not a plain code", () => {
    expect(paymentReturnLinks("fail", { order: "../profile" })[0].href).toBe(
      "/profile?tab=purchases",
    );
  });
});
