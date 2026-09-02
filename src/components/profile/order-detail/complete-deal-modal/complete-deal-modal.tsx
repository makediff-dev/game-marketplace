"use client";

import { useEffect, useRef } from "react";
import { ModalCloseButton } from "@/components/ui/modal-close-button/modal-close-button";
import { AuthModalPortal } from "@/components/auth/auth-modal/auth-modal-portal";
import styles from "../cancel-deal-modal/cancel-deal-modal.module.css";

interface CompleteDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CompleteDealModal({ isOpen, onClose, onConfirm }: CompleteDealModalProps) {
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
        aria-labelledby="complete-deal-modal-title"
        onClick={(event) => {
          if (event.target === overlayRef.current) {
            onClose();
          }
        }}
      >
        <div className={styles.panel} onClick={(event) => event.stopPropagation()}>
          <header className={styles.header}>
            <h2 id="complete-deal-modal-title" className={styles.title}>
              Завершить сделку
            </h2>
            <ModalCloseButton onClick={onClose} />
          </header>
          <p className={styles.body}>
            Вы подтверждаете получение товара. Средства будут переведены продавцу, сделка
            завершится.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Назад
            </button>
            <button type="button" className={styles.confirmButton} onClick={onConfirm}>
              Завершить сделку
            </button>
          </div>
        </div>
      </div>
    </AuthModalPortal>
  );
}
