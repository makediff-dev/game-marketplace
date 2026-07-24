"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon/icon";
import { AuthModalPortal } from "@/components/auth/auth-modal/auth-modal-portal";
import { mockUser } from "@/lib/mock/user";
import { useAuthStore } from "@/lib/store/auth-store";
import styles from "./profile-menu-modal.module.css";

interface ProfileMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserMode = "buyer" | "seller";

const userModeLabels: Record<UserMode, string> = {
  buyer: "Покупатель",
  seller: "Продавец",
};

export function ProfileMenuModal({ isOpen, onClose }: ProfileMenuModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [securityEnabled, setSecurityEnabled] = useState(false);
  const [userMode, setUserMode] = useState<UserMode>("buyer");

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

  const handleLogout = () => {
    onClose();
    logout();
    router.push("/");
  };

  return (
    <AuthModalPortal isOpen={isOpen}>
      <div
        ref={overlayRef}
        className={styles.overlay}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-menu-modal-title"
        onClick={(event) => {
          if (event.target === overlayRef.current) {
            onClose();
          }
        }}
      >
        <div className={styles.panel} onClick={(event) => event.stopPropagation()}>
          <header className={styles.header}>
            <h2 id="profile-menu-modal-title" className={styles.title}>
              Меню
            </h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Закрыть"
            >
              <Icon
                src="/assets/modal-close.svg"
                width={24}
                height={24}
                className={styles.closeIcon}
              />
            </button>
          </header>

          <div className={styles.avatarSection}>
            <Icon
              src="/assets/avatar-placeholder.svg"
              width={88}
              height={88}
              className={styles.avatar}
            />
            <button type="button" className={styles.uploadPhoto}>
              Загрузить фото
            </button>
          </div>

          <div className={styles.divider} />

          <div className={styles.menuSection}>
            <Link href="/profile" className={`${styles.menuRow} ${styles.menuRowLink}`} onClick={onClose}>
              <div className={styles.iconSlot}>
                <Icon
                  src="/assets/menu-orders.svg"
                  width={36}
                  height={36}
                  className={styles.rowIcon}
                />
              </div>
              <div className={styles.rowText}>
                <span className={styles.rowTitle}>Мои заказы</span>
              </div>
              <div className={styles.rowControl}>
                <Icon
                  src="/assets/arrow-small.svg"
                  width={16}
                  height={13}
                  className={styles.rowArrow}
                />
              </div>
            </Link>

            <Link href="/favorites" className={`${styles.menuRow} ${styles.menuRowLink}`} onClick={onClose}>
              <div className={styles.iconSlot}>
                <span className={styles.emojiIcon} aria-hidden="true">
                  ❤️
                </span>
              </div>
              <div className={styles.rowText}>
                <span className={styles.rowTitle}>Понравившиеся товары</span>
              </div>
              <div className={styles.rowControl}>
                <Icon
                  src="/assets/arrow-small.svg"
                  width={16}
                  height={13}
                  className={styles.rowArrow}
                />
              </div>
            </Link>

            <div className={styles.menuRow}>
              <div className={styles.iconSlot}>
                <span className={styles.emojiIcon} aria-hidden="true">
                  🔄
                </span>
              </div>
              <div className={styles.rowText}>
                <span className={styles.rowSubtitle}>Режим</span>
                <span className={styles.rowTitle}>{userModeLabels[userMode]}</span>
              </div>
              <div className={styles.modeSwitch} role="group" aria-label="Режим">
                {(Object.keys(userModeLabels) as UserMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`${styles.modeOption} ${userMode === mode ? styles.modeOptionActive : ""}`}
                    onClick={() => setUserMode(mode)}
                    aria-pressed={userMode === mode}
                  >
                    {userModeLabels[mode]}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.menuRow}>
              <div className={styles.iconSlot}>
                <Icon
                  src="/assets/menu-bell.svg"
                  width={36}
                  height={36}
                  className={styles.rowIcon}
                />
              </div>
              <div className={styles.rowText}>
                <span className={styles.rowTitle}>Уведомления</span>
                <span className={styles.rowSubtitle}>Новые сообщения</span>
              </div>
              <div className={styles.rowControl}>
                <button
                  type="button"
                  className={`${styles.statePill} ${notificationsEnabled ? styles.statePillOn : styles.statePillOff}`}
                  onClick={() => setNotificationsEnabled((value) => !value)}
                  aria-label="Уведомления"
                  aria-pressed={notificationsEnabled}
                >
                  {notificationsEnabled ? "Вкл." : "Выкл."}
                </button>
                <Link
                  href="/profile/notifications"
                  className={styles.rowArrowLink}
                  aria-label="Настройки уведомлений"
                  onClick={onClose}
                >
                  <Icon
                    src="/assets/arrow-small.svg"
                    width={16}
                    height={13}
                    className={styles.rowArrow}
                  />
                </Link>
              </div>
            </div>

            <div className={styles.menuRow}>
              <div className={styles.iconSlot}>
                <Icon
                  src="/assets/menu-lock.svg"
                  width={36}
                  height={36}
                  className={styles.rowIcon}
                />
              </div>
              <div className={styles.rowText}>
                <span className={styles.rowTitle}>Защита средств</span>
                <span className={styles.rowSubtitle}>Подтверждение действий</span>
              </div>
              <div className={styles.rowControl}>
                <button
                  type="button"
                  className={`${styles.statePill} ${securityEnabled ? styles.statePillOn : styles.statePillOff}`}
                  onClick={() => setSecurityEnabled((value) => !value)}
                  aria-label="Защита средств"
                  aria-pressed={securityEnabled}
                >
                  {securityEnabled ? "Вкл." : "Выкл."}
                </button>
                <Link
                  href="/profile/security"
                  className={styles.rowArrowLink}
                  aria-label="Подтверждение действий"
                  onClick={onClose}
                >
                  <Icon
                    src="/assets/arrow-small.svg"
                    width={16}
                    height={13}
                    className={styles.rowArrow}
                  />
                </Link>
              </div>
            </div>

            <div className={styles.menuRow}>
              <div className={styles.iconSlot}>
                <Icon
                  src="/assets/menu-envelope.svg"
                  width={24}
                  height={24}
                  className={styles.infoIcon}
                />
              </div>
              <div className={styles.infoText}>
                <span className={styles.infoLabel}>Адрес электронной почты</span>
                <span className={styles.infoValue}>{mockUser.email}</span>
              </div>
            </div>
          </div>

          <div className={styles.actionsSection}>
            <Link href="/contacts" className={`${styles.actionRow} ${styles.supportLink}`} onClick={onClose}>
              <div className={styles.iconSlot}>
                <Icon
                  src="/assets/menu-chat.svg"
                  width={36}
                  height={36}
                  className={styles.rowIcon}
                />
              </div>
              Написать в поддержку
            </Link>

            <button
              type="button"
              className={`${styles.actionRow} ${styles.logoutButton}`}
              onClick={handleLogout}
            >
              <div className={styles.iconSlot}>
                <Icon
                  src="/assets/menu-sign-out.svg"
                  width={36}
                  height={36}
                  className={styles.rowIcon}
                />
              </div>
              Выйти из профиля
            </button>
          </div>
        </div>
      </div>
    </AuthModalPortal>
  );
}
