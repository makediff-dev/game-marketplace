"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { TSellTermItem } from "@/lib/sell-wizard";
import styles from "@/styles/sell-wizard-terms-modal.module.scss";

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
    <div className={styles["sell-wizard-terms-modal__item"]}>
      <div className={styles["sell-wizard-terms-modal__item-content"]}>
        <img
          className={styles["sell-wizard-terms-modal__dot"]}
          src={item.dotIcon}
          alt=""
          width={8}
          height={8}
          aria-hidden
        />
        <p className={styles["sell-wizard-terms-modal__item-text"]}>
          {item.label}
        </p>
      </div>
      <button
        type="button"
        className={`${styles["sell-wizard-terms-modal__checkbox"]} ${
          checked
            ? styles["sell-wizard-terms-modal__checkbox--checked"]
            : styles["sell-wizard-terms-modal__checkbox--unchecked"]
        }`}
        onClick={onToggle}
        aria-pressed={checked}
        aria-label={item.label}
      >
        {checked ? (
          <img
            className={styles["sell-wizard-terms-modal__check-icon"]}
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

export function SellWizardTermsModal({
  isOpen,
  title,
  blockTitle,
  items,
  onClose,
  onAccept,
}: {
  isOpen: boolean;
  title: string;
  blockTitle: string;
  items: TSellTermItem[];
  onClose: () => void;
  onAccept: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const allChecked = items.every((item) => checked[item.id]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setChecked(Object.fromEntries(items.map((item) => [item.id, false])));

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
  }, [isOpen, onClose, items]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className={styles["sell-wizard-terms-modal"]}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sell-wizard-terms-title"
      onClick={(event) => {
        if (event.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      <div
        className={styles["sell-wizard-terms-modal__panel"]}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles["sell-wizard-terms-modal__header"]}>
          <h2
            id="sell-wizard-terms-title"
            className={styles["sell-wizard-terms-modal__title"]}
          >
            {title}
          </h2>
          <button
            type="button"
            className={styles["sell-wizard-terms-modal__close"]}
            aria-label="Закрыть"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className={styles["sell-wizard-terms-modal__body"]}>
          <section
            className={styles["sell-wizard-terms-modal__block"]}
            aria-label={blockTitle}
          >
            <h3 className={styles["sell-wizard-terms-modal__block-title"]}>
              {blockTitle}
            </h3>
            <div className={styles["sell-wizard-terms-modal__items"]}>
              {items.map((item) => (
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
        <p className={styles["sell-wizard-terms-modal__agreement"]}>
          Продолжая, вы принимаете{" "}
          <Link
            href="/terms/sales"
            className={styles["sell-wizard-terms-modal__agreement-link"]}
            onClick={onClose}
          >
            Условия продажи
          </Link>
        </p>
        <div className={styles["sell-wizard-terms-modal__footer"]}>
          <button
            type="button"
            className={styles["sell-wizard-terms-modal__accept-button"]}
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
