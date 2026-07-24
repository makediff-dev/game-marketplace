"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button/button";
import { ModalCloseButton } from "@/components/ui/modal-close-button/modal-close-button";
import styles from "./modal.module.css";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function Modal({
  isOpen,
  title,
  onClose,
  children,
  actions,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(event) => {
        if (event.target === overlayRef.current) onClose();
      }}
    >
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
          <ModalCloseButton onClick={onClose} />
        </div>
        <div className={styles.content}>{children}</div>
        {actions ?? (
          <div className={styles.actions}>
            <Button variant="outline" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export { styles as modalStyles };
