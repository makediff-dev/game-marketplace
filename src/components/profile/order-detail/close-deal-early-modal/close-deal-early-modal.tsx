"use client";

import { useEffect, useRef } from "react";
import { ModalCloseButton } from "@/components/ui/modal-close-button/modal-close-button";
import { AuthModalPortal } from "@/components/auth/auth-modal/auth-modal-portal";
import styles from "../cancel-deal-modal/cancel-deal-modal.module.css";

interface CloseDealEarlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CloseDealEarlyModal({ isOpen, onClose, onConfirm }: CloseDealEarlyModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

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
        aria-labelledby="close-deal-early-modal-title"
        onClick={(event) => {
          if (event.target === overlayRef.current) {
            onClose();
          }
        }}
      >
        <div className={styles.panel} onClick={(event) => event.stopPropagation()}>
          <header className={styles.header}>
            <h2 id="close-deal-early-modal-title" className={styles.title}>
              Досрочно закрыть сделку
            </h2>
            <ModalCloseButton onClick={onClose} />
          </header>
          <p className={styles.body}>
            Вы подтверждаете выполнение заказа. Сделка перейдёт к подтверждению покупателем,
            таймер остановится.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Назад
            </button>
            <button type="button" className={styles.confirmButton} onClick={onConfirm}>
              Закрыть сделку
            </button>
          </div>
        </div>
      </div>
    </AuthModalPortal>
  );
}
