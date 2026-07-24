"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Icon } from "@/components/ui/icon/icon";
import { ModalCloseButton } from "@/components/ui/modal-close-button/modal-close-button";
import { AuthModalPortal } from "@/components/auth/auth-modal/auth-modal-portal";
import styles from "./profile-intro-modal.module.css";
import modalStyles from "../auth-modal/auth-modal.module.css";

interface ProfileIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nickname: string) => void;
}

export function ProfileIntroModal({ isOpen, onClose, onSave }: ProfileIntroModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setNickname("");

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(nickname.trim() || "Client");
  };

  return (
    <AuthModalPortal isOpen={isOpen}>
      <div
        ref={overlayRef}
        className={modalStyles.overlay}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-intro-title"
        onClick={(event) => {
          if (event.target === overlayRef.current) {
            onClose();
          }
        }}
      >
        <div className={modalStyles.panel} onClick={(event) => event.stopPropagation()}>
          <ModalCloseButton onClick={onClose} />

          <div className={modalStyles.header}>
            <h2 id="profile-intro-title" className={modalStyles.title}>
              Знакомство
            </h2>
          </div>

          <form className={modalStyles.body} onSubmit={handleSubmit}>
            <div className={styles.avatarBlock}>
              <div className={styles.avatarCircle}>
                <Icon
                  src="/assets/avatar-placeholder.svg"
                  width={88}
                  height={88}
                  className={styles.avatarImage}
                />
              </div>
              <button type="button" className={styles.uploadLink}>
                Загрузить фото
              </button>
            </div>

            <div className={styles.field}>
              <input
                type="text"
                className={styles.input}
                placeholder="Nickname"
                aria-label="Nickname"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
              />
              <p className={styles.hint}>От 3 до 16 символов, латиница и цифры</p>
            </div>

            <div className={modalStyles.inlineFooter}>
              <Button type="submit" variant="gradient" fullWidth large className={modalStyles.primaryButton}>
                Сохранить
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AuthModalPortal>
  );
}
