"use client";

import { useEffect, useState } from "react";

import { getErrorMessage } from "@/api/error";
import { LineIcon } from "@/components/ui/line-icon";
import { usePromoteListing, usePromotionTerms } from "@/hooks/use-listings";
import { useProfileOverview } from "@/hooks/use-profile";
import { cx } from "@/lib/cx";
import { formatMoney } from "@/lib/profile";
import styles from "@/styles/promote-dialog.module.scss";
import type { TPromotionMethod } from "@/types/listings";

export function formatPromotedUntil(value: string): string {
  return new Date(value).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Short form for the pill on a profile card: 18.11. */
export function formatPromotedShort(value: string): string {
  return new Date(value).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

function hoursLabel(hours: number): string {
  if (hours % 24 === 0) {
    const days = hours / 24;
    return days === 1 ? "сутки" : `${days} дн.`;
  }

  return `${hours} ч`;
}

/** Pay for a lift to the top of the catalog, from the balance or by card. */
export function PromoteDialog({
  listingId,
  title,
  promotedUntil,
  onClose,
}: {
  listingId: string;
  title: string;
  promotedUntil?: string | null;
  onClose: () => void;
}) {
  const termsQuery = usePromotionTerms();
  const overviewQuery = useProfileOverview();
  const promote = usePromoteListing();
  const terms = termsQuery.data;
  const balance = overviewQuery.data?.balance ?? 0;
  const enough = terms ? balance >= terms.price : false;
  const [method, setMethod] = useState<TPromotionMethod | null>(null);
  const chosen = method ?? (enough ? "balance" : "card");
  const running =
    promotedUntil && Date.parse(promotedUntil) > Date.now()
      ? promotedUntil
      : null;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const done = promote.data?.promotedUntil;

  return (
    <div className={styles["promote-dialog"]} role="presentation" onClick={onClose}>
      <div
        className={styles["promote-dialog__panel"]}
        role="dialog"
        aria-modal="true"
        aria-labelledby="promote-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className={styles["promote-dialog__close"]}
          type="button"
          aria-label="Закрыть"
          onClick={onClose}
        >
          <img src="/auth/close.svg" alt="" width={24} height={24} />
        </button>

        <span className={styles["promote-dialog__badge"]}>
          <LineIcon name="trend" />
        </span>
        <h2 id="promote-title" className={styles["promote-dialog__title"]}>
          {done ? "Объявление в топе" : "Поднять в топ"}
        </h2>
        <p className={styles["promote-dialog__subject"]}>{title}</p>

        {done ? (
          <>
            <p className={styles["promote-dialog__text"]}>
              Оно первым в каталоге до {formatPromotedUntil(done)}.
            </p>
            <button
              className={styles["promote-dialog__primary"]}
              type="button"
              onClick={onClose}
            >
              Готово
            </button>
          </>
        ) : !terms ? (
          <p className={styles["promote-dialog__text"]}>Загрузка…</p>
        ) : (
          <>
            <p className={styles["promote-dialog__text"]}>
              Объявление встанет первым в каталоге игры на{" "}
              {hoursLabel(terms.hours)}.
              {running
                ? ` Сейчас оно в топе до ${formatPromotedUntil(running)}, время добавится.`
                : ""}
            </p>

            <div
              className={styles["promote-dialog__methods"]}
              role="radiogroup"
              aria-label="Способ оплаты"
            >
              <button
                className={cx(
                  styles["promote-dialog__method"],
                  chosen === "balance" && styles["promote-dialog__method--on"],
                )}
                type="button"
                role="radio"
                aria-checked={chosen === "balance"}
                disabled={!enough}
                onClick={() => setMethod("balance")}
              >
                <LineIcon name="wallet" />
                <span className={styles["promote-dialog__method-text"]}>
                  <span className={styles["promote-dialog__method-title"]}>
                    С баланса
                  </span>
                  <span className={styles["promote-dialog__method-note"]}>
                    {enough
                      ? `Доступно ${formatMoney(balance)}`
                      : `Не хватает ${formatMoney(terms.price - balance)}`}
                  </span>
                </span>
              </button>
              <button
                className={cx(
                  styles["promote-dialog__method"],
                  chosen === "card" && styles["promote-dialog__method--on"],
                )}
                type="button"
                role="radio"
                aria-checked={chosen === "card"}
                onClick={() => setMethod("card")}
              >
                <img src="/assets/card-ru-36.svg" alt="" width={24} height={24} />
                <span className={styles["promote-dialog__method-text"]}>
                  <span className={styles["promote-dialog__method-title"]}>
                    Банковской картой
                  </span>
                  <span className={styles["promote-dialog__method-note"]}>
                    Карты РФ и других стран
                  </span>
                </span>
              </button>
            </div>

            {promote.isError ? (
              <p className={styles["promote-dialog__error"]} role="alert">
                {getErrorMessage(promote.error)}
              </p>
            ) : null}

            <button
              className={styles["promote-dialog__primary"]}
              type="button"
              disabled={promote.isPending}
              onClick={() => promote.mutate({ id: listingId, method: chosen })}
            >
              {promote.isPending
                ? "Оплачиваем…"
                : `Оплатить ${formatMoney(terms.price)}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
