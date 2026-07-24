"use client";

import { useEffect, useRef } from "react";
import { ModalCloseButton } from "@/components/ui/modal-close-button/modal-close-button";
import { AuthModalPortal } from "@/components/auth/auth-modal/auth-modal-portal";
import styles from "./open-dispute-modal.module.css";

interface OpenDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function OpenDisputeModal({ isOpen, onClose, onConfirm }: OpenDisputeModalProps) {
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
        aria-labelledby="open-dispute-modal-title"
        onClick={(event) => {
          if (event.target === overlayRef.current) {
            onClose();
          }
        }}
      >
        <div className={styles.panel} onClick={(event) => event.stopPropagation()}>
          <header className={styles.header}>
            <h2 id="open-dispute-modal-title" className={styles.title}>
              Открыть спор
            </h2>
            <ModalCloseButton onClick={onClose} />
          </header>
          <p className={styles.body}>
            Вы уверены, что хотите открыть спор по этой сделке? Модератор рассмотрит обращение
            и примет решение.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Отмена
            </button>
            <button type="button" className={styles.confirmButton} onClick={onConfirm}>
              Открыть спор
            </button>
          </div>
        </div>
      </div>
    </AuthModalPortal>
  );
}
