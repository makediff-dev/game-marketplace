"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  SELLER_TERMS_PROHIBITED,
  SELLER_TERMS_REQUIREMENTS,
  type TSellTermItem,
} from "@/lib/sell-wizard";
import styles from "@/styles/seller-terms-modal.module.scss";

function TermCheckbox({
  item,
  checked,
  onToggle,
}: {
  item: TSellTermItem;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={styles["seller-terms-modal__item"]}>
      <div className={styles["seller-terms-modal__item-content"]}>
        <img
          className={styles["seller-terms-modal__dot"]}
          src={item.dotIcon}
          alt=""
          width={8}
          height={8}
          aria-hidden
        />
        <p className={styles["seller-terms-modal__item-text"]}>{item.label}</p>
      </div>
      <button
        type="button"
        className={`${styles["seller-terms-modal__checkbox"]} ${
          checked
            ? styles["seller-terms-modal__checkbox--checked"]
            : styles["seller-terms-modal__checkbox--unchecked"]
        }`}
        onClick={onToggle}
        aria-pressed={checked}
        aria-label={item.label}
      >
        {checked ? (
          <img
            className={styles["seller-terms-modal__check-icon"]}
            src="/assets/checkmark-white.svg"
            alt=""
            width={12}
            height={9}
          />
        ) : null}
      </button>
    </div>
  );
}

export function SellerTermsModal({
  isOpen,
  onClose,
  onAccept,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const items = [...SELLER_TERMS_REQUIREMENTS, ...SELLER_TERMS_PROHIBITED];
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const allChecked = items.every((item) => checked[item.id]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setChecked(
      Object.fromEntries(
        [...SELLER_TERMS_REQUIREMENTS, ...SELLER_TERMS_PROHIBITED].map(
          (item) => [item.id, false],
        ),
      ),
    );

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
      className={styles["seller-terms-modal"]}
      role="dialog"
      aria-modal="true"
      aria-labelledby="seller-terms-title"
      onClick={(event) => {
        if (event.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      <div
        className={styles["seller-terms-modal__panel"]}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles["seller-terms-modal__header"]}>
          <h2
            id="seller-terms-title"
            className={styles["seller-terms-modal__title"]}
          >
            Условия продажи
          </h2>
          <button
            type="button"
            className={styles["seller-terms-modal__close"]}
            aria-label="Закрыть"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className={styles["seller-terms-modal__body"]}>
          <section
            className={styles["seller-terms-modal__block"]}
            aria-label="Требования"
          >
            <h3 className={styles["seller-terms-modal__block-title"]}>
              Требования
            </h3>
            <div className={styles["seller-terms-modal__items"]}>
              {SELLER_TERMS_REQUIREMENTS.map((item) => (
                <TermCheckbox
                  key={item.id}
                  item={item}
                  checked={Boolean(checked[item.id])}
                  onToggle={() =>
                    setChecked((current) => ({
                      ...current,
                      [item.id]: !current[item.id],
                    }))
                  }
                />
              ))}
            </div>
          </section>
          <section
            className={styles["seller-terms-modal__block"]}
            aria-label="Запрещено"
          >
            <h3 className={styles["seller-terms-modal__block-title"]}>
              Запрещено
            </h3>
            <div className={styles["seller-terms-modal__items"]}>
              {SELLER_TERMS_PROHIBITED.map((item) => (
                <TermCheckbox
                  key={item.id}
                  item={item}
                  checked={Boolean(checked[item.id])}
                  onToggle={() =>
                    setChecked((current) => ({
                      ...current,
                      [item.id]: !current[item.id],
                    }))
                  }
                />
              ))}
            </div>
          </section>
        </div>
        <p className={styles["seller-terms-modal__agreement"]}>
          Продолжая, вы принимаете{" "}
          <Link
            href="/terms/sales"
            className={styles["seller-terms-modal__agreement-link"]}
            onClick={onClose}
          >
            Условия продажи
          </Link>
        </p>
        <div className={styles["seller-terms-modal__footer"]}>
          <button
            type="button"
            className={styles["seller-terms-modal__accept-button"]}
            disabled={!allChecked}
            onClick={onAccept}
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}
