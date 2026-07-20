"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon/icon";
import styles from "./authenticated-navbar.module.css";

export function AuthenticatedNavbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar} aria-label="Навигация пользователя">
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link href="/" className={styles.logo}>
            Playnox
          </Link>
          <div className={styles.search}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Поиск товаров..."
              aria-label="Поиск товаров"
            />
            <Link href="/search" className={styles.searchButton} aria-label="Искать">
              <Icon
                src="/assets/magnifying-glass.svg"
                width={20}
                height={20}
                className={styles.searchIcon}
              />
            </Link>
          </div>
        </div>
        <div className={styles.navLinks}>
          <Link
            href="/sell"
            className={`${styles.navLink} ${pathname.startsWith("/sell") ? styles.navLinkActive : ""}`}
          >
            Продать
          </Link>
          <Link
            href="/chat"
            className={`${styles.navLink} ${pathname.startsWith("/chat") ? styles.navLinkActive : ""}`}
          >
            Чаты
          </Link>
          <Link
            href="/profile"
            className={`${styles.navLink} ${pathname.startsWith("/profile") ? styles.navLinkActive : ""}`}
          >
            Профиль
          </Link>
        </div>
      </div>
    </nav>
  );
}
