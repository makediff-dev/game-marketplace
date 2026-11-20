"use client";

import { useEffect, useState } from "react";

import { getErrorMessage } from "@/api/error";
import type { TReview } from "@/api/reviews.api";
import {
  useCreateReview,
  useOrderReview,
  useSellerReviews,
} from "@/hooks/use-reviews";
import { cx } from "@/lib/cx";
import styles from "@/styles/reviews.module.scss";

const RATING_WORDS = ["", "Ужасно", "Плохо", "Нормально", "Хорошо", "Отлично"];

const QUICK_PHRASES = [
  "Быстро",
  "Всё как в описании",
  "Вежливый продавец",
  "Рекомендую",
];

function StarIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2.8l2.84 5.75 6.35.92-4.6 4.48 1.09 6.32L12 17.29l-5.68 2.98 1.09-6.32-4.6-4.48 6.35-.92L12 2.8Z"
        fill="currentColor"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Stars({
  value,
  label,
  size = 14,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  return (
    <span className={styles["reviews__stars"]} role="img" aria-label={label}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={cx(
            styles["reviews__star"],
            index < Math.round(value) && styles["reviews__star--on"],
          )}
        >
          <StarIcon size={size} />
        </span>
      ))}
    </span>
  );
}

function ReviewItem({ review }: { review: TReview }) {
  const name = review.buyerName || "Покупатель";

  return (
    <li className={styles["reviews__item"]}>
      <div className={styles["reviews__item-head"]}>
        <span className={styles["reviews__avatar"]} aria-hidden>
          {name.slice(0, 1).toUpperCase()}
        </span>
        <div className={styles["reviews__item-meta"]}>
          <span className={styles["reviews__author"]}>{name}</span>
          <span className={styles["reviews__date"]}>
            {new Date(review.createdAt).toLocaleDateString("ru-RU")}
          </span>
        </div>
        <Stars value={review.rating} label={`Оценка ${review.rating} из 5`} />
      </div>
      {review.text ? (
        <p className={styles["reviews__text"]}>{review.text}</p>
      ) : null}
    </li>
  );
}

/** Seller rating and the latest reviews, on the product page. */
export function SellerReviews({ sellerId }: { sellerId?: number }) {
  const reviewsQuery = useSellerReviews(sellerId);
  const data = reviewsQuery.data;

  if (!sellerId || !data) {
    return null;
  }

  return (
    <section className={styles["reviews"]} aria-label="Отзывы о продавце">
      <h3 className={styles["reviews__title"]}>
        Отзывы о продавце
        {data.count > 0 ? (
          <span className={styles["reviews__summary"]}>
            <span className={styles["reviews__summary-star"]}>
              <StarIcon size={14} />
            </span>
            {data.rating.toFixed(1).replace(".", ",")} · {data.count}
          </span>
        ) : null}
      </h3>
      {data.items.length === 0 ? (
        <p className={styles["reviews__empty"]}>Отзывов пока нет</p>
      ) : (
        <ul className={styles["reviews__list"]}>
          {data.items.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ReviewForm({
  orderId,
  onDone,
}: {
  orderId: string;
  onDone?: () => void;
}) {
  const create = useCreateReview(orderId);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const shown = hover || rating;

  function togglePhrase(phrase: string) {
    setText((current) => {
      const parts = current
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
      const next = parts.includes(phrase)
        ? parts.filter((part) => part !== phrase)
        : [...parts, phrase];
      return next.join(", ");
    });
  }

  return (
    <form
      className={styles["reviews__form"]}
      aria-label="Отзыв о продавце"
      onSubmit={(event) => {
        event.preventDefault();
        create.mutate(
          { rating, text: text.trim() || undefined },
          { onSuccess: () => onDone?.() },
        );
      }}
    >
      <div className={styles["reviews__picker-row"]}>
        <div
          className={styles["reviews__picker"]}
          role="radiogroup"
          aria-label="Оценка"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value} из 5`}
              className={cx(
                styles["reviews__pick"],
                value <= shown && styles["reviews__pick--on"],
              )}
              onMouseEnter={() => setHover(value)}
              onClick={() => setRating(value)}
            >
              <StarIcon size={36} />
            </button>
          ))}
        </div>
        <span className={styles["reviews__rating-word"]} aria-live="polite">
          {shown ? RATING_WORDS[shown] : "Выберите оценку"}
        </span>
      </div>

      <div className={styles["reviews__phrases"]}>
        {QUICK_PHRASES.map((phrase) => {
          const on = text
            .split(",")
            .map((part) => part.trim())
            .includes(phrase);
          return (
            <button
              key={phrase}
              type="button"
              aria-pressed={on}
              className={cx(
                styles["reviews__phrase"],
                on && styles["reviews__phrase--on"],
              )}
              onClick={() => togglePhrase(phrase)}
            >
              {phrase}
            </button>
          );
        })}
      </div>

      <textarea
        className={styles["reviews__input"]}
        value={text}
        maxLength={2000}
        aria-label="Текст отзыва"
        placeholder="Расскажите, как прошла сделка. Необязательно"
        onChange={(event) => setText(event.target.value)}
      />
      {create.error ? (
        <p className={styles["reviews__error"]} role="alert">
          {getErrorMessage(create.error)}
        </p>
      ) : null}
      <button
        className={styles["reviews__submit"]}
        type="submit"
        disabled={rating === 0 || create.isPending}
      >
        {create.isPending ? "Отправляем…" : "Оставить отзыв"}
      </button>
    </form>
  );
}

/** The buyer rates the seller once the deal is completed. */
export function OrderReview({
  orderId,
  onWrite,
}: {
  orderId: string;
  /** Opens the review modal instead of the inline form. */
  onWrite?: () => void;
}) {
  const reviewQuery = useOrderReview(orderId);

  if (reviewQuery.isLoading) {
    return null;
  }

  if (reviewQuery.data) {
    return (
      <section className={styles["reviews"]} aria-label="Ваш отзыв">
        <h3 className={styles["reviews__title"]}>Ваш отзыв</h3>
        <ul className={styles["reviews__list"]}>
          <ReviewItem review={reviewQuery.data} />
        </ul>
      </section>
    );
  }

  if (onWrite) {
    return (
      <div className={styles["reviews__cta"]}>
        <div>
          <p className={styles["reviews__cta-title"]}>Оцените продавца</p>
          <p className={styles["reviews__cta-text"]}>
            Отзыв поможет другим покупателям
          </p>
        </div>
        <button
          type="button"
          className={styles["reviews__cta-btn"]}
          onClick={onWrite}
        >
          Оставить отзыв
        </button>
      </div>
    );
  }

  return (
    <section className={styles["reviews"]} aria-label="Оцените продавца">
      <h3 className={styles["reviews__title"]}>Оцените продавца</h3>
      <ReviewForm orderId={orderId} />
    </section>
  );
}

/** Pops up after a completed deal so the buyer can rate in one tap. */
export function ReviewModal({
  orderId,
  sellerName,
  onClose,
}: {
  orderId: string;
  sellerName?: string | null;
  onClose: () => void;
}) {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={styles["reviews__overlay"]}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={styles["reviews__modal"]}>
        <button
          type="button"
          className={styles["reviews__close"]}
          aria-label="Закрыть"
          onClick={onClose}
        >
          ×
        </button>

        {sent ? (
          <div className={styles["reviews__thanks"]}>
            <span className={styles["reviews__thanks-icon"]} aria-hidden>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="m5 12.5 4.5 4.5L19 7.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h2 id="review-modal-title" className={styles["reviews__modal-title"]}>
              Спасибо за отзыв
            </h2>
            <p className={styles["reviews__modal-text"]}>
              Он появится в профиле продавца и поможет другим покупателям.
            </p>
            <button
              type="button"
              className={styles["reviews__submit"]}
              onClick={onClose}
            >
              Готово
            </button>
          </div>
        ) : (
          <>
            <span className={styles["reviews__modal-badge"]}>
              Сделка завершена
            </span>
            <h2 id="review-modal-title" className={styles["reviews__modal-title"]}>
              Как прошла сделка?
            </h2>
            <p className={styles["reviews__modal-text"]}>
              Оцените{" "}
              {sellerName ? <strong>{sellerName}</strong> : "продавца"}.
              Это займёт пару секунд.
            </p>
            <ReviewForm orderId={orderId} onDone={() => setSent(true)} />
          </>
        )}
      </div>
    </div>
  );
}
