"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon/icon";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NICKNAME_STORAGE_KEY } from "@/lib/auth/welcome";
import { mockUser } from "@/lib/mock/user";
import { useAuthStore } from "@/lib/store/auth-store";
import styles from "./profile-menu.module.css";

interface ProfileMenuProps {
  variant?: "page" | "modal";
  compact?: boolean;
  onNavigate?: () => void;
  onProfileClick?: () => void;
}

function formatBalance(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

export function ProfileMenu({
  variant = "page",
  compact = false,
  onNavigate,
  onProfileClick,
}: ProfileMenuProps) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [displayName, setDisplayName] = useState(mockUser.name);

  useEffect(() => {
    setDisplayName(window.localStorage.getItem(NICKNAME_STORAGE_KEY) || mockUser.name);
  }, []);

  const menuItems = compact
    ? [
        {
          type: "link" as const,
          href: "/profile/balance",
          label: "Баланс",
          value: formatBalance(mockUser.balance),
        },
        {
          type: "action" as const,
          label: "Профиль",
          value: displayName,
        },
      ]
    : [
        {
          type: "link" as const,
          href: "/profile/balance",
          label: "Баланс",
          value: formatBalance(mockUser.balance),
        },
        { type: "link" as const, href: "/profile", label: "Мои товары", value: "0" },
        { type: "link" as const, href: "/chat", label: "Чаты", value: "" },
        {
          type: "link" as const,
          href: "/register/profile",
          label: "Настройки профиля",
          value: displayName,
        },
      ];

  const handleNavigate = () => {
    onNavigate?.();
  };

  const handleLogout = () => {
    onNavigate?.();
    logout();
    router.push("/");
  };

  return (
    <nav
      className={[styles.menu, variant === "modal" ? styles.menuModal : ""].filter(Boolean).join(" ")}
      aria-label="Меню профиля"
    >
      {!compact ? (
        <div className={styles.statusBadge}>
          <Image src="/assets/seal-check.svg" alt="" width={20} height={20} />
          <span>Профиль подтверждён</span>
        </div>
      ) : null}
      {menuItems.map((item) =>
        item.type === "action" ? (
          <button
            key={item.label}
            type="button"
            className={styles.menuItem}
            onClick={() => {
              onNavigate?.();
              onProfileClick?.();
            }}
          >
            <span className={styles.menuLabel}>{item.label}</span>
            {item.value ? <span className={styles.menuValue}>{item.value}</span> : null}
            <Icon
              src="/assets/arrow-small.svg"
              width={16}
              height={13}
              tone="muted"
              className={styles.arrowIcon}
            />
          </button>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className={styles.menuItem}
            onClick={handleNavigate}
          >
            <span className={styles.menuLabel}>{item.label}</span>
            {item.value ? <span className={styles.menuValue}>{item.value}</span> : null}
            <Icon
              src="/assets/arrow-small.svg"
              width={16}
              height={13}
              tone="muted"
              className={styles.arrowIcon}
            />
          </Link>
        ),
      )}
      {!compact ? (
        <button type="button" className={`${styles.menuItem} ${styles.logout}`} onClick={handleLogout}>
          <span className={styles.menuLabel}>Выйти</span>
        </button>
      ) : null}
    </nav>
  );
}
