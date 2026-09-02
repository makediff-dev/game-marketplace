"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type RefObject } from "react";
import { NavbarMenuButton } from "@/components/layout/navbar-shell/navbar-menu-button";
import { ThemeToggle } from "@/components/theme/theme-toggle/theme-toggle";
import { SearchField } from "@/components/ui/search-field/search-field";
import shellStyles from "@/components/layout/navbar-shell/navbar-shell.module.css";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const searchFieldDesktop = <SearchField readOnly autoFocus={isSearchPage} />;
  const searchFieldMobile = <SearchField readOnly autoFocus={isSearchPage} width="full" />;

  return (
    <nav
      ref={navbarRef}
      className={`layoutBlock ${styles.navbar}`}
      aria-label="Главная навигация"
    >
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <div className={styles.left}>
            <Link href="/" className={styles.logo}>
              Playnox
            </Link>
            <ThemeToggle />
          </div>

          <NavbarMenuButton
            isOpen={menuOpen}
            controlsId="guest-mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          />
        </div>

        <div className={styles.center}>
          <div ref={searchAnchorRef} className={styles.searchAnchor}>
            {isSearchPage ? searchFieldDesktop : <Link href="/search">{searchFieldDesktop}</Link>}
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

        <div
          id="guest-mobile-nav"
          className={`${shellStyles.mobilePanel} ${menuOpen ? shellStyles.mobilePanelOpen : ""}`}
        >
          <div className={shellStyles.mobileSearch}>
            {isSearchPage ? (
              searchFieldMobile
            ) : (
              <Link href="/search" onClick={() => setMenuOpen(false)}>
                {searchFieldMobile}
              </Link>
            )}
          </div>

          <div className={shellStyles.mobileNavLinks}>
            <Link
              href="/sell"
              className={`${shellStyles.mobileLink} ${pathname.startsWith("/sell") ? shellStyles.mobileLinkActive : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              Продать
            </Link>
            <Link
              href="/login"
              className={`${shellStyles.mobileAuthLink} ${activeAuth === "login" ? styles.authLinkActive : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              Вход
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
