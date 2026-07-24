"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NICKNAME_STORAGE_KEY } from "@/lib/auth/welcome";
import { mockUser } from "@/lib/mock/user";
import { useAuthStore } from "@/lib/store/auth-store";
import styles from "./profile-menu.module.css";

interface ProfileMenuProps {
  variant?: "page" | "modal";
  onNavigate?: () => void;
}

export function ProfileMenu({ variant = "page", onNavigate }: ProfileMenuProps) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [displayName, setDisplayName] = useState(mockUser.name);

  useEffect(() => {
    setDisplayName(window.localStorage.getItem(NICKNAME_STORAGE_KEY) || mockUser.name);
  }, []);

  const menuItems = [
    { href: "/profile/balance", label: "Баланс", value: `${mockUser.balance} ₽` },
    { href: "/profile", label: "Мои товары", value: "0" },
    { href: "/chat", label: "Чаты", value: "" },
    { href: "/register/profile", label: "Настройки профиля", value: displayName },
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
      <div className={styles.statusBadge}>
        <Image src="/assets/seal-check.svg" alt="" width={20} height={20} />
        <span>Профиль подтверждён</span>
      </div>
      {menuItems.map((item) => (
        <Link key={item.href} href={item.href} className={styles.menuItem} onClick={handleNavigate}>
          <span className={styles.menuLabel}>{item.label}</span>
          {item.value ? <span className={styles.menuValue}>{item.value}</span> : null}
          <Image
            src="/assets/arrow-small.svg"
            alt=""
            width={16}
            height={13}
            className={styles.arrowIcon}
          />
        </Link>
      ))}
      <button type="button" className={`${styles.menuItem} ${styles.logout}`} onClick={handleLogout}>
        <span className={styles.menuLabel}>Выйти</span>
      </button>
    </nav>
  );
}
