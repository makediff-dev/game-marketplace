"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { NavbarMenuButton } from "@/components/layout/navbar-shell/navbar-menu-button";
import { ThemeToggle } from "@/components/theme/theme-toggle/theme-toggle";
import { SearchField } from "@/components/ui/search-field/search-field";
import shellStyles from "@/components/layout/navbar-shell/navbar-shell.module.css";
import styles from "./authenticated-navbar.module.css";

export function AuthenticatedNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = () => {
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
    setMenuOpen(false);
  };

  const navItems = [
    { href: "/sell", label: "Продать", active: pathname.startsWith("/sell") },
    { href: "/chat", label: "Чаты", active: pathname.startsWith("/chat") },
    {
      href: "/profile?tab=purchases",
      label: "Профиль",
      active: pathname.startsWith("/profile"),
    },
  ];

  return (
    <nav className={`layoutBlock ${styles.navbar}`} aria-label="Навигация пользователя">
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
            controlsId="authenticated-mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          />
        </div>

        <div className={styles.center}>
          <SearchField value={query} onChange={setQuery} onSubmit={handleSearch} />
        </div>

        <div className={styles.navLinks}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${item.active ? styles.navLinkActive : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div
          id="authenticated-mobile-nav"
          className={`${shellStyles.mobilePanel} ${menuOpen ? shellStyles.mobilePanelOpen : ""}`}
        >
          <div className={shellStyles.mobileSearch}>
            <SearchField
              value={query}
              onChange={setQuery}
              onSubmit={handleSearch}
              width="full"
            />
          </div>

          <div className={shellStyles.mobileNavLinks}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${shellStyles.mobileLink} ${item.active ? shellStyles.mobileLinkActive : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
