"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button/button";
import { ModalCloseButton } from "@/components/ui/modal-close-button/modal-close-button";
import styles from "./sell-product-success-modal.module.css";

interface SellProductSuccessModalProps {
  isOpen: boolean;
  productTitle: string;
  onClose: () => void;
  onGoToProfile: () => void;
}

export function SellProductSuccessModal({
  isOpen,
  productTitle,
  onClose,
  onGoToProfile,
}: SellProductSuccessModalProps) {
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

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sell-product-success-title"
      onClick={(event) => {
        if (event.target === overlayRef.current) {
          onClose();
        }
      }}
    >
        <div className={styles.panel} onClick={(event) => event.stopPropagation()}>
          <ModalCloseButton onClick={onClose} />

          <div className={styles.content}>
          <span className={styles.emoji} aria-hidden>
            ✅
          </span>
          <h2 id="sell-product-success-title" className={styles.title}>
            Продажа успешно создана
          </h2>
          <p className={styles.subtitle}>
            «{productTitle}» опубликован. Продажа доступна в личном кабинете
          </p>
        </div>

        <div className={styles.footer}>
          <Button type="button" variant="gradient" fullWidth large onClick={onGoToProfile}>
            Перейти к продаже
          </Button>
        </div>
      </div>
    </div>
  );
}
