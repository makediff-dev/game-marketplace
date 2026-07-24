"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { RefObject } from "react";
import { SearchField } from "@/components/ui/search-field/search-field";
import styles from "./navbar.module.css";

export interface NavbarProps {
  isSearchPage?: boolean;
  activeAuth?: "login" | "register";
  searchAnchorRef?: RefObject<HTMLDivElement | null>;
  navbarRef?: RefObject<HTMLElement | null>;
}

export function Navbar({
  isSearchPage = false,
  activeAuth,
  searchAnchorRef,
  navbarRef,
}: NavbarProps) {
  const pathname = usePathname();
  const searchField = <SearchField readOnly autoFocus={isSearchPage} />;

  return (
    <nav
      ref={navbarRef}
      className={`layoutBlock ${styles.navbar}`}
      aria-label="Главная навигация"
    >
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link href="/" className={styles.logo}>
            Playnox
          </Link>
        </div>
        <div className={styles.center}>
          <div ref={searchAnchorRef} className={styles.searchAnchor}>
            {isSearchPage ? searchField : <Link href="/search">{searchField}</Link>}
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
            href="/login"
            className={`${styles.authLink} ${activeAuth === "login" ? styles.authLinkActive : ""}`}
          >
            Вход
          </Link>
        </div>
      </div>
    </nav>
  );
}
