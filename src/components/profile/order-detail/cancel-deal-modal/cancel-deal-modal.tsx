"use client";

import { useEffect, useRef } from "react";
import { ModalCloseButton } from "@/components/ui/modal-close-button/modal-close-button";
import { AuthModalPortal } from "@/components/auth/auth-modal/auth-modal-portal";
import styles from "./cancel-deal-modal.module.css";

interface CancelDealModalProps {
  isOpen: boolean;
  role: "buyer" | "seller";
  onClose: () => void;
  onConfirm: () => void;
}

const copyByRole = {
  buyer: {
    body: "Вы уверены, что хотите отменить сделку? Средства вернутся на ваш баланс.",
    confirm: "Отменить сделку",
  },
  seller: {
    body: "Вы уверены, что хотите отменить сделку? Покупатель получит возврат средств.",
    confirm: "Отменить сделку",
  },
} as const;

export function CancelDealModal({
  isOpen,
  role,
  onClose,
  onConfirm,
}: CancelDealModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const copy = copyByRole[role];

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

  return (
    <AuthModalPortal isOpen={isOpen}>
      <div
        ref={overlayRef}
        className={styles.overlay}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-deal-modal-title"
        onClick={(event) => {
          if (event.target === overlayRef.current) {
            onClose();
          }
        }}
      >
        <div className={styles.panel} onClick={(event) => event.stopPropagation()}>
          <header className={styles.header}>
            <h2 id="cancel-deal-modal-title" className={styles.title}>
              Отменить сделку
            </h2>
            <ModalCloseButton onClick={onClose} />
          </header>
          <p className={styles.body}>{copy.body}</p>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Назад
            </button>
            <button type="button" className={styles.confirmButton} onClick={onConfirm}>
              {copy.confirm}
            </button>
          </div>
        </div>
      </div>
    </AuthModalPortal>
  );
}
