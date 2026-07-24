"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Icon } from "@/components/ui/icon/icon";
import { AuthModalPortal } from "@/components/auth/auth-modal/auth-modal-portal";
import {
  balancePaymentMethods,
  getBalanceOperationLabel,
  type BalanceOperation,
} from "@/lib/mock/balance-payment";
import styles from "./balance-payment-modal.module.css";

interface BalancePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  operation: BalanceOperation;
  onProceed?: () => void;
}

function formatAmount(value: string): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "0";
  }

  return new Intl.NumberFormat("ru-RU").format(numeric);
}

export function BalancePaymentModal({
  isOpen,
  onClose,
  amount,
  operation,
  onProceed,
}: BalancePaymentModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [selectedMethod, setSelectedMethod] = useState(balancePaymentMethods[0]?.id ?? "sbp");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleProceed = () => {
    if (onProceed) {
      onProceed();
      return;
    }

    onClose();
  };

  return (
    <AuthModalPortal isOpen={isOpen}>
      <div
        ref={overlayRef}
        className={styles.overlay}
        role="dialog"
        aria-modal="true"
        aria-labelledby="balance-payment-modal-title"
        onClick={(event) => {
          if (event.target === overlayRef.current) {
            onClose();
          }
        }}
      >
        <div className={styles.panel} onClick={(event) => event.stopPropagation()}>
          <header className={styles.header}>
            <h2 id="balance-payment-modal-title" className={styles.title}>
              Оплата
            </h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Закрыть"
            >
              <Icon
                src="/assets/modal-close.svg"
                width={24}
                height={24}
                className={styles.closeIcon}
              />
            </button>
          </header>

          <div className={styles.methods}>
            {balancePaymentMethods.map((method) => {
              const isSelected = selectedMethod === method.id;

              return (
                <button
                  key={method.id}
                  type="button"
                  className={styles.methodRow}
                  onClick={() => setSelectedMethod(method.id)}
                  aria-pressed={isSelected}
                >
                  {method.icon ? (
                    <Icon
                      src={method.icon}
                      alt=""
                      width={18}
                      height={18}
                      className={styles.methodIcon}
                    />
                  ) : (
                    <span className={styles.methodIconPlaceholder} aria-hidden />
                  )}
                  <span className={styles.methodLabel}>{method.label}</span>
                  <span
                    className={[styles.radio, isSelected ? styles.radioSelected : ""]
                      .filter(Boolean)
                      .join(" ")}
                    aria-hidden
                  >
                    {isSelected ? (
                      <Icon
                        src="/assets/checkmark-white.svg"
                        alt=""
                        width={14}
                        height={10}
                        className={styles.radioCheck}
                      />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          <p className={styles.notice}>Вы будете перемещены на сайт платежной системы</p>

          <div className={styles.footer}>
            <div className={styles.footerInfo}>
              <span className={styles.footerAmount}>{formatAmount(amount)} ₽</span>
              <span className={styles.footerType}>{getBalanceOperationLabel(operation)}</span>
            </div>
            <Button variant="gradient" large className={styles.payButton} onClick={handleProceed}>
              Перейти к оплате
            </Button>
          </div>
        </div>
      </div>
    </AuthModalPortal>
  );
}
