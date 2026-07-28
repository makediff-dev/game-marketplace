"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle/theme-toggle";
import { SearchField } from "@/components/ui/search-field/search-field";
import styles from "./authenticated-navbar.module.css";

export function AuthenticatedNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  };

  return (
    <nav className={`layoutBlock ${styles.navbar}`} aria-label="Навигация пользователя">
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link href="/" className={styles.logo}>
            Playnox
          </Link>
          <ThemeToggle />
        </div>
        <div className={styles.center}>
          <SearchField value={query} onChange={setQuery} onSubmit={handleSearch} />
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
            href="/profile?tab=purchases"
            className={`${styles.navLink} ${pathname.startsWith("/profile") ? styles.navLinkActive : ""}`}
          >
            Профиль
          </Link>
        </div>
      </div>
    </nav>
  );
}
