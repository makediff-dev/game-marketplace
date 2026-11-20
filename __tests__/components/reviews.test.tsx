import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockReviews = { forSeller: jest.fn(), forOrder: jest.fn(), create: jest.fn() };

jest.mock("@/api/reviews.api", () => ({ ReviewsApi: { getInstance: () => mockReviews } }));

import { OrderReview, ReviewModal, SellerReviews } from "@/components/reviews";

import { renderWithClient } from "../utils";

const review = (patch = {}) => ({
  id: "1",
  orderId: "5",
  rating: 4,
  text: "Быстро и честно",
  buyerName: "nick",
  createdAt: "2026-11-09T10:00:00.000Z",
  ...patch,
});

describe("SellerReviews", () => {
  it("shows the average and the latest reviews", async () => {
    mockReviews.forSeller.mockResolvedValue({ rating: 4.5, count: 2, items: [review(), review({ id: "2", text: "" })] });

    renderWithClient(<SellerReviews sellerId={11} />);

    expect(await screen.findByText("4,5 · 2")).toBeInTheDocument();
    expect(screen.getByText("Быстро и честно")).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "Оценка 4 из 5" })).toHaveLength(2);
    expect(mockReviews.forSeller).toHaveBeenCalledWith(11);
  });

  it("says when there are no reviews and skips products without a seller", async () => {
    mockReviews.forSeller.mockResolvedValue({ rating: 0, count: 0, items: [] });
    const { rerender } = renderWithClient(<SellerReviews sellerId={11} />);
    expect(await screen.findByText("Отзывов пока нет")).toBeInTheDocument();

    mockReviews.forSeller.mockClear();
    rerender(<SellerReviews />);
    expect(mockReviews.forSeller).not.toHaveBeenCalled();
  });
});

describe("OrderReview", () => {
  it("lets the buyer rate the seller once", async () => {
    mockReviews.forOrder.mockResolvedValue(null);
    mockReviews.create.mockResolvedValue(review({ rating: 5, text: "Супер" }));

    renderWithClient(<OrderReview orderId="5" />);

    const submit = await screen.findByRole("button", { name: "Оставить отзыв" });
    expect(submit).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: "5 из 5" }));
    expect(screen.getByRole("radio", { name: "5 из 5" })).toHaveAttribute("aria-checked", "true");
    await userEvent.type(screen.getByRole("textbox", { name: "Текст отзыва" }), "  Супер ");
    await userEvent.click(submit);

    expect(mockReviews.create).toHaveBeenCalledWith("5", { rating: 5, text: "Супер" });
    expect(await screen.findByRole("region", { name: "Ваш отзыв" })).toHaveTextContent("Супер");
  });

  it("shows an existing review instead of the form", async () => {
    mockReviews.forOrder.mockResolvedValue(review());

    renderWithClient(<OrderReview orderId="5" />);

    expect(await screen.findByText("Быстро и честно")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Оставить отзыв" })).not.toBeInTheDocument();
  });

  it("shows why a review was refused", async () => {
    mockReviews.forOrder.mockResolvedValue(null);
    mockReviews.create.mockRejectedValue(new Error("x"));

    renderWithClient(<OrderReview orderId="5" />);

    await userEvent.click(await screen.findByRole("radio", { name: "3 из 5" }));
    await userEvent.click(screen.getByRole("button", { name: "Оставить отзыв" }));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(mockReviews.create).toHaveBeenCalledWith("5", { rating: 3, text: undefined });
  });
});

describe("ReviewModal", () => {
  it("rates in a tap with quick phrases and thanks the buyer", async () => {
    mockReviews.create.mockResolvedValue(review({ rating: 5 }));
    const onClose = jest.fn();

    renderWithClient(<ReviewModal orderId="5" sellerName="shop" onClose={onClose} />);

    expect(screen.getByText("Выберите оценку")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: "5 из 5" }));
    expect(screen.getByText("Отлично")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Быстро" }));
    await userEvent.click(screen.getByRole("button", { name: "Рекомендую" }));
    expect(screen.getByRole("textbox", { name: "Текст отзыва" })).toHaveValue("Быстро, Рекомендую");
    await userEvent.click(screen.getByRole("button", { name: "Быстро" }));
    expect(screen.getByRole("textbox", { name: "Текст отзыва" })).toHaveValue("Рекомендую");

    await userEvent.click(screen.getByRole("button", { name: "Оставить отзыв" }));

    expect(mockReviews.create).toHaveBeenCalledWith("5", { rating: 5, text: "Рекомендую" });
    expect(await screen.findByRole("heading", { name: "Спасибо за отзыв" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Готово" }));
    expect(onClose).toHaveBeenCalled();
  });
});
