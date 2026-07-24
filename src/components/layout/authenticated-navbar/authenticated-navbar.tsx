"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ProfileMenuModal } from "@/components/profile/profile-menu-modal/profile-menu-modal";
import { Icon } from "@/components/ui/icon/icon";
import { SearchField } from "@/components/ui/search-field/search-field";
import { mockUser } from "@/lib/mock/user";
import styles from "./authenticated-navbar.module.css";

function formatBalance(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

export function AuthenticatedNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = () => {
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  };

  const handleOpenProfileMenu = () => {
    setMenuOpen(true);
  };

  const handleCloseProfileMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <nav className={`layoutBlock ${styles.navbar}`} aria-label="Навигация пользователя">
        <div className={styles.inner}>
          <div className={styles.left}>
            <Link href="/" className={styles.logo}>
              Playnox
            </Link>
          </div>
          <div className={styles.center}>
            <SearchField
              value={query}
              onChange={setQuery}
              onSubmit={handleSearch}
            />
          </div>
          <div className={styles.navLinks}>
            <Link
              href="/profile/balance"
              className={`${styles.balanceLink} ${pathname.startsWith("/profile/balance") ? styles.balanceLinkActive : ""}`}
            >
              <Icon
                src="/assets/icon-wallet-brand.svg"
                alt=""
                width={20}
                height={20}
                className={styles.balanceIcon}
              />
              <span className={styles.balanceAmount}>{formatBalance(mockUser.balance)}</span>
            </Link>
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
            <button
              type="button"
              className={`${styles.navLink} ${styles.navLinkButton} ${pathname.startsWith("/profile") && !pathname.startsWith("/profile/balance") ? styles.navLinkActive : ""}`}
              onClick={handleOpenProfileMenu}
            >
              Профиль
            </button>
          </div>
        </div>
      </nav>
      <ProfileMenuModal isOpen={menuOpen} onClose={handleCloseProfileMenu} />
    </>
  );
}
