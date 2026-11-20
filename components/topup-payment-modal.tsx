"use client";

import { useEffect, useRef, useState } from "react";

import { cx } from "@/lib/cx";
import styles from "@/styles/topup-payment-modal.module.scss";

const METHODS = [
  { id: "sbp", label: "СБП", icon: "/assets/sbp-36.svg" },
  { id: "card-ru", label: "Банковская карта", icon: "/assets/card-ru-36.svg" },
  {
    id: "card-foreign",
    label: "Зарубежная карта",
    icon: "/assets/card-foreign.png",
  },
  { id: "card-by", label: "Карта Беларуси", icon: "/assets/card-by.svg" },
  { id: "crypto", label: "Криптовалюта", icon: "/assets/umoney-36.svg" },
] as const;

type TMethodId = (typeof METHODS)[number]["id"];

export function TopupPaymentModal({
  amountLabel,
  onClose,
}: {
  amountLabel: string;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [method, setMethod] = useState<TMethodId>("sbp");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className={styles["topup-payment-modal__overlay"]}
      role="dialog"
      aria-modal="true"
      aria-labelledby="topup-payment-title"
      onClick={(event) => {
        if (event.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      <div className={styles["topup-payment-modal"]}>
        <div className={styles["topup-payment-modal__head"]}>
          <h2
            id="topup-payment-title"
            className={styles["topup-payment-modal__title"]}
          >
            Оплата
          </h2>
          <button
            className={styles["topup-payment-modal__close"]}
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <img src="/auth/close.svg" alt="" width={20} height={20} />
          </button>
        </div>

        <ul
          className={styles["topup-payment-modal__methods"]}
          role="listbox"
          aria-label="Способ оплаты"
        >
          {METHODS.map((item) => {
            const selected = method === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cx(
                    styles["topup-payment-modal__method"],
                    selected && styles["topup-payment-modal__method--on"],
                  )}
                  onClick={() => setMethod(item.id)}
                >
                  <span className={styles["topup-payment-modal__method-left"]}>
                    <img
                      className={styles["topup-payment-modal__method-icon"]}
                      src={item.icon}
                      alt=""
                      width={36}
                      height={36}
                    />
                    <span
                      className={styles["topup-payment-modal__method-label"]}
                    >
                      {item.label}
                    </span>
                  </span>
                  <span
                    className={cx(
                      styles["topup-payment-modal__radio"],
                      selected && styles["topup-payment-modal__radio--on"],
                    )}
                    aria-hidden
                  >
                    {selected ? (
                      <img
                        src="/assets/checkmark-white.svg"
                        alt=""
                        width={12}
                        height={12}
                      />
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className={styles["topup-payment-modal__redirect-hint"]}>
          Вы будете перемещены на сайт платежной системы
        </p>

        <div className={styles["topup-payment-modal__footer"]}>
          <div className={styles["topup-payment-modal__summary"]}>
            <p className={styles["topup-payment-modal__amount"]}>
              {amountLabel}
            </p>
            <p className={styles["topup-payment-modal__kind"]}>
              <img
                src="/assets/icon-credit-card.svg"
                alt=""
                width={16}
                height={16}
              />
              Пополнение
            </p>
          </div>
          <button
            className={styles["topup-payment-modal__confirm"]}
            type="button"
            onClick={onClose}
          >
            Перейти к оплате
          </button>
        </div>
      </div>
    </div>
  );
}
