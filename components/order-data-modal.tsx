"use client";

import { useEffect, useState } from "react";

import type { TOrderData } from "@/lib/order-data";
import styles from "@/styles/order-page.module.scss";

const COPIED_MS = 1600;

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="9"
        y="9"
        width="11"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m5 12.5 4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KeyIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m11 12 8-8m-3 3 2.5 2.5M14 9l2 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function OrderDataModal({
  data,
  onClose,
  onCopied,
}: {
  data: TOrderData;
  onClose: () => void;
  onCopied: (ok: boolean) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const [shown, setShown] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }
    const timer = window.setTimeout(() => setCopied(null), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  function copy(key: string, value: string) {
    navigator.clipboard
      ?.writeText(value)
      .then(() => {
        setCopied(key);
        onCopied(true);
      })
      .catch(() => onCopied(false));
  }

  const all = data.rows.map((row) => `${row.label}: ${row.value}`).join("\n");

  return (
    <div
      className={styles["order-page__overlay"]}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-data-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`${styles["order-page__modal"]} ${styles["order-page__modal--data"]}`}
      >
        <button
          type="button"
          className={styles["order-page__modal-close"]}
          aria-label="Закрыть"
          onClick={onClose}
        >
          ×
        </button>
        <span className={styles["order-page__data-icon"]}>
          <KeyIcon size={22} />
        </span>
        <h2 id="order-data-title" className={styles["order-page__modal-title"]}>
          {data.title}
        </h2>
        <p className={styles["order-page__modal-text"]}>{data.hint}</p>

        <dl className={styles["order-page__data-list"]}>
          {data.rows.map((row) => (
            <div key={row.key} className={styles["order-page__data-row"]}>
              <div className={styles["order-page__data-body"]}>
                <dt className={styles["order-page__data-label"]}>
                  {row.label}
                </dt>
                <dd className={styles["order-page__data-text"]}>
                  {row.sensitive && !shown.has(row.key) ? "••••••••" : row.value}
                </dd>
              </div>
              {row.sensitive ? (
                <button
                  type="button"
                  className={styles["order-page__data-reveal"]}
                  aria-pressed={shown.has(row.key)}
                  onClick={() =>
                    setShown((current) => {
                      const next = new Set(current);
                      if (next.has(row.key)) {
                        next.delete(row.key);
                      } else {
                        next.add(row.key);
                      }
                      return next;
                    })
                  }
                >
                  {shown.has(row.key) ? "Скрыть" : "Показать"}
                </button>
              ) : null}
              <button
                type="button"
                className={`${styles["order-page__data-copy"]} ${copied === row.key ? styles["order-page__data-copy--done"] : ""}`}
                aria-label={`Скопировать: ${row.label}`}
                title="Скопировать"
                onClick={() => copy(row.key, row.value)}
              >
                {copied === row.key ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          ))}
        </dl>

        <div className={styles["order-page__modal-actions"]}>
          <button
            type="button"
            className={styles["order-page__ghost-btn"]}
            onClick={onClose}
          >
            Закрыть
          </button>
          {data.rows.length > 1 ? (
            <button
              type="button"
              className={styles["order-page__primary-btn"]}
              onClick={() => copy("*", all)}
            >
              {copied === "*" ? "Скопировано" : "Скопировать всё"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
