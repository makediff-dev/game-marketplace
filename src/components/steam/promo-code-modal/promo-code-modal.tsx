"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button/button";
import { ModalCloseButton } from "@/components/ui/modal-close-button/modal-close-button";
import styles from "./promo-code-modal.module.css";

interface PromoCodeModalProps {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onActivate: () => void;
}

export function PromoCodeModal({
  isOpen,
  value,
  onChange,
  onClose,
  onActivate,
}: PromoCodeModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    inputRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onActivate();
  };

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-code-title"
      onClick={(event) => {
        if (event.target === overlayRef.current) {
          onClose();
        }
      }}
    >
      <form className={styles.panel} onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h2 id="promo-code-title" className={styles.title}>
            Активация промокода
          </h2>
          <ModalCloseButton onClick={onClose} />
        </div>

        <div className={styles.body}>
          <input
            ref={inputRef}
            className={styles.input}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Ввести промокод"
            aria-label="Промокод"
          />
        </div>

        <div className={styles.footer}>
          <Button
            type="submit"
            variant="gradient"
            fullWidth
            large
            className={styles.activateButton}
          >
            Активировать
          </Button>
        </div>
      </form>
    </div>
  );
}
