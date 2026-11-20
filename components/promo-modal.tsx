"use client";

import { useEffect, useRef, useState } from "react";

import { getErrorMessage } from "@/api/error";
import { PromosApi } from "@/api/promos.api";
import { cx } from "@/lib/cx";
import styles from "@/styles/promo-modal.module.scss";
import type { TPromoQuote } from "@/types/promos";

export function PromoModal({
  amount,
  currency,
  onApplied,
  onClose,
}: {
  amount: number;
  currency: string;
  onApplied: (quote: TPromoQuote, code: string) => void;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  async function submit() {
    const trimmed = code.trim();
    setError(null);

    if (!trimmed) {
      setError("Промокод не указан");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Введите сумму пополнения");
      return;
    }

    setPending(true);
    try {
      const quote = await PromosApi.getInstance().validate({
        code: trimmed,
        context: "topup",
        amount,
        currency,
      });

      if (!quote.valid) {
        setError(quote.message || "Промокод недействителен");
        return;
      }

      onApplied(quote, trimmed);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      className={styles["promo-modal__overlay"]}
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-modal-title"
      onClick={(event) => {
        if (event.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      <div className={styles["promo-modal"]}>
        <div className={styles["promo-modal__head"]}>
          <h2 id="promo-modal-title" className={styles["promo-modal__title"]}>
            Активация промокода
          </h2>
          <button
            className={styles["promo-modal__close"]}
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <img src="/auth/close.svg" alt="" width={20} height={20} />
          </button>
        </div>

        <label className={styles["promo-modal__field"]}>
          <span className={styles["promo-modal__sr-only"]}>Промокод</span>
          <input
            ref={inputRef}
            className={cx(
              styles["promo-modal__input"],
              error && styles["promo-modal__input--error"],
            )}
            value={code}
            placeholder="Ввести промокод"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "promo-modal-error" : undefined}
            autoComplete="off"
            disabled={pending}
            onChange={(event) => {
              setCode(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void submit();
              }
            }}
          />
          {error ? (
            <span
              id="promo-modal-error"
              className={styles["promo-modal__error"]}
              role="alert"
            >
              {error}
            </span>
          ) : null}
        </label>

        <button
          className={styles["promo-modal__submit"]}
          type="button"
          disabled={pending}
          onClick={() => void submit()}
        >
          {pending ? "Проверяем…" : "Активировать"}
        </button>
      </div>
    </div>
  );
}
