"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { OrderDetail } from "@/lib/mock/orders";
import {
  canCloseDealEarly,
  canCompleteDeal,
  formatDealCountdown,
  getDealTimerHint,
  getDealTimerDockHint,
  getSellerPresenceLabel,
} from "@/lib/deal/deal-timer";
import styles from "./deal-timer.module.css";

interface DealTimerProps {
  order: OrderDetail;
  deadlineAt: number;
  sellerOnline: boolean;
  variant?: "inline" | "dock" | "page";
  orderHref?: string;
  onCloseDealEarly?: () => void;
  onCompleteDeal?: () => void;
}

export function DealTimer({
  order,
  deadlineAt,
  sellerOnline,
  variant = "inline",
  orderHref,
  onCloseDealEarly,
  onCompleteDeal,
}: DealTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    Math.max(0, Math.floor((deadlineAt - Date.now()) / 1000)),
  );

  useEffect(() => {
    const updateRemaining = () => {
      setRemainingSeconds(Math.max(0, Math.floor((deadlineAt - Date.now()) / 1000)));
    };

    updateRemaining();
    const intervalId = window.setInterval(updateRemaining, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [deadlineAt]);

  const isExpired = remainingSeconds <= 0;
  const sellerName = order.seller;
  const presenceLabel = getSellerPresenceLabel(sellerName, sellerOnline, order.tab);
  const hint = getDealTimerHint(order, isExpired);
  const dockHint = getDealTimerDockHint(order, isExpired);
  const countdown = isExpired ? "00:00:00" : formatDealCountdown(remainingSeconds);
  const showCompleteButton =
    order.tab === "purchases" && canCompleteDeal(order) && Boolean(onCompleteDeal) && !isExpired;
  const showCloseEarlyButton =
    order.tab === "sales" && canCloseDealEarly(order) && Boolean(onCloseDealEarly) && !isExpired;
  const showDockHints = variant === "dock" && !showCompleteButton && !showCloseEarlyButton;

  if (variant === "page") {
    return (
      <section
        className={`${styles.timer} ${styles.timerPage} ${isExpired ? styles.timerExpired : ""}`}
        aria-label="Таймер сделки"
      >
        <div className={styles.pageLayout}>
          <div className={styles.pageTimerColumn}>
            <span className={styles.pageTimerLabel}>Время на сделку</span>
            <strong className={styles.pageTimerValue} aria-live="polite">
              {countdown}
            </strong>
          </div>

          <div className={styles.pageSideColumn}>
            <div className={styles.pagePresenceBadge}>
              <span
                className={`${styles.presenceDot} ${
                  sellerOnline ? styles.presenceDotOnline : styles.presenceDotOffline
                }`}
                aria-hidden
              />
              <span className={styles.pagePresenceText}>{presenceLabel}</span>
            </div>

            {showCompleteButton ? (
              <button type="button" className={styles.pageActionButton} onClick={onCompleteDeal}>
                Завершить сделку
              </button>
            ) : null}

            {showCloseEarlyButton ? (
              <button
                type="button"
                className={styles.pageActionButton}
                onClick={onCloseDealEarly}
              >
                Досрочно закрыть сделку
              </button>
            ) : null}

            {isExpired && !showCompleteButton && !showCloseEarlyButton ? (
              <p className={styles.pageExpiredMessage}>Время истекло</p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  const dockContent = (
    <>
      <div className={styles.timerMain}>
        <div className={styles.timerBlock}>
          <span className={styles.timerLabel}>Время на сделку</span>
          <strong className={styles.timerValue} aria-live="polite">
            {countdown}
          </strong>
        </div>

        <div className={styles.presenceBlock}>
          <div className={styles.presenceRow}>
            <span
              className={`${styles.presenceDot} ${
                sellerOnline ? styles.presenceDotOnline : styles.presenceDotOffline
              }`}
              aria-hidden
            />
            <span className={styles.presenceText}>{presenceLabel}</span>
          </div>
        </div>
      </div>

      {showDockHints ? (
        <div className={styles.hintLines}>
          <span className={styles.hintLine}>{dockHint[0]}</span>
          <span className={styles.hintLine}>{dockHint[1]}</span>
        </div>
      ) : variant !== "dock" ? (
        <p className={styles.hint}>{hint}</p>
      ) : null}
    </>
  );

  if (variant === "dock") {
    return (
      <section
        className={`${styles.timer} ${styles.timerDock} ${isExpired ? styles.timerExpired : ""}`}
        aria-label="Таймер сделки"
      >
        {orderHref ? (
          <Link href={orderHref} className={styles.timerLink}>
            {dockContent}
          </Link>
        ) : (
          dockContent
        )}

        {showCompleteButton ? (
          <button
            type="button"
            className={styles.completeDealButton}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onCompleteDeal?.();
            }}
          >
            Завершить сделку
          </button>
        ) : null}

        {showCloseEarlyButton ? (
          <button
            type="button"
            className={styles.closeEarlyButton}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onCloseDealEarly?.();
            }}
          >
            Досрочно закрыть сделку
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section
      className={`${styles.timer} ${isExpired ? styles.timerExpired : ""}`}
      aria-label="Таймер сделки"
    >
      <div className={styles.timerMain}>
        <div className={styles.timerBlock}>
          <span className={styles.timerLabel}>Время на сделку</span>
          <strong className={styles.timerValue} aria-live="polite">
            {countdown}
          </strong>
          <span className={styles.timerStatus}>
            {isExpired ? "Время истекло" : "Осталось на выполнение"}
          </span>
        </div>

        <div className={styles.presenceBlock}>
          <span className={styles.presenceLabel}>
            {order.tab === "sales" ? "Ваш статус" : "Статус продавца"}
          </span>
          <div className={styles.presenceRow}>
            <span
              className={`${styles.presenceDot} ${
                sellerOnline ? styles.presenceDotOnline : styles.presenceDotOffline
              }`}
              aria-hidden
            />
            <span className={styles.presenceText}>{presenceLabel}</span>
          </div>
        </div>
      </div>

      <p className={styles.hint}>{hint}</p>
    </section>
  );
}
