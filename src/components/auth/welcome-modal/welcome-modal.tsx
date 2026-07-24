"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button/button";
import { ModalCloseButton } from "@/components/ui/modal-close-button/modal-close-button";
import { AuthModalPortal } from "@/components/auth/auth-modal/auth-modal-portal";
import { mockUser } from "@/lib/mock/user";
import styles from "./welcome-modal.module.css";
import modalStyles from "../auth-modal/auth-modal.module.css";

interface WelcomeModalProps {
  isOpen: boolean;
  username?: string;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, username = "Client", onClose }: WelcomeModalProps) {
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
        className={modalStyles.overlay}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        onClick={(event) => {
          if (event.target === overlayRef.current) {
            onClose();
          }
        }}
      >
        <div className={modalStyles.panel} onClick={(event) => event.stopPropagation()}>
          <div className={styles.header}>
            <ModalCloseButton onClick={onClose} />
          </div>

          <div className={styles.content}>
            <span className={styles.emoji} aria-hidden>
              👋
            </span>
            <h2 id="welcome-modal-title" className={styles.title}>
              Добро пожаловать, {username}!
            </h2>
            <p className={styles.subtitle}>На Playnox с {mockUser.memberSince}</p>
          </div>

          <div className={modalStyles.footer}>
            <Button
              type="button"
              variant="gradient"
              fullWidth
              large
              className={modalStyles.primaryButton}
              onClick={onClose}
            >
              Начать
            </Button>
          </div>
        </div>
      </div>
    </AuthModalPortal>
  );
}
