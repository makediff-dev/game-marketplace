"use client";

import { useEffect, useRef } from "react";
import type { OrderDetail } from "@/lib/mock/orders";
import { getDealExpiredModalCopy } from "@/lib/deal/deal-timer";
import { Button } from "@/components/ui/button/button";
import { ModalCloseButton } from "@/components/ui/modal-close-button/modal-close-button";
import { AuthModalPortal } from "@/components/auth/auth-modal/auth-modal-portal";
import styles from "./deal-expired-modal.module.css";

interface DealExpiredModalProps {
  isOpen: boolean;
  order: OrderDetail;
  onClose: () => void;
  onChatClick: () => void;
  onSupportClick: () => void;
}

export function DealExpiredModal({
  isOpen,
  order,
  onClose,
  onChatClick,
  onSupportClick,
}: DealExpiredModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const copy = getDealExpiredModalCopy(order);

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
        aria-labelledby="deal-expired-modal-title"
        onClick={(event) => {
          if (event.target === overlayRef.current) {
            onClose();
          }
        }}
      >
        <div className={styles.panel} onClick={(event) => event.stopPropagation()}>
          <header className={styles.header}>
            <h2 id="deal-expired-modal-title" className={styles.title}>
              {copy.title}
            </h2>
            <ModalCloseButton onClick={onClose} />
          </header>

          <p className={styles.body}>{copy.body}</p>

          <div className={styles.actions}>
            <Button
              type="button"
              variant="outline"
              className={styles.actionButton}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onSupportClick();
              }}
            >
              Написать в поддержку
            </Button>

            <Button
              type="button"
              variant="gradient"
              className={styles.actionButton}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onChatClick();
              }}
            >
              {copy.chatButtonLabel}
            </Button>
          </div>
        </div>
      </div>
    </AuthModalPortal>
  );
}
