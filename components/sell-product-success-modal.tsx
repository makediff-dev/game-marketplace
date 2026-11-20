"use client";

import { useEffect, useRef } from "react";

import styles from "@/styles/sell-product-success-modal.module.scss";

export function SellProductSuccessModal({
  isOpen,
  productTitle,
  onClose,
  onGoToListings,
}: {
  isOpen: boolean;
  productTitle: string;
  onClose: () => void;
  onGoToListings: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className={styles["sell-product-success-modal"]}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sell-success-title"
      onClick={(event) => {
        if (event.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      <div
        className={styles["sell-product-success-modal__panel"]}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles["sell-product-success-modal__content"]}>
          <span
            className={styles["sell-product-success-modal__emoji"]}
            aria-hidden
          >
            🎉
          </span>
          <h2
            id="sell-success-title"
            className={styles["sell-product-success-modal__title"]}
          >
            Объявление отправлено на модерацию
          </h2>
          <p className={styles["sell-product-success-modal__subtitle"]}>
            «{productTitle}» появится в каталоге после проверки. Мы пришлём
            уведомление с результатом.
          </p>
        </div>
        <div className={styles["sell-product-success-modal__footer"]}>
          <button
            type="button"
            className={styles["sell-product-success-modal__primary"]}
            onClick={onGoToListings}
          >
            Мои товары
          </button>
          <button
            type="button"
            className={styles["sell-product-success-modal__secondary"]}
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
