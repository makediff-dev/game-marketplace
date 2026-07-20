"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { Icon } from "@/components/ui/icon/icon";
import styles from "./navbar.module.css";

export function Navbar() {
  return (
    <nav className={styles.navbar} aria-label="Главная навигация">
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link href="/" className={styles.logo}>
            Playnox
          </Link>
          <div className={styles.searchGroup}>
            <Link href="/search" className={styles.search}>
              <input
                type="search"
                className={styles.searchInput}
                placeholder="Поиск товаров..."
                aria-label="Поиск товаров"
                readOnly
              />
              <span className={styles.searchButton} aria-hidden>
                <Icon
                  src="/assets/magnifying-glass.svg"
                  width={20}
                  height={20}
                  className={styles.searchIcon}
                />
              </span>
            </Link>
            <Link href="/sell" className={styles.sellLink}>
              Продать
            </Link>
          </div>
        </div>
        <div className={styles.auth}>
          <Link href="/login">
            <Button variant="primary">Вход</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Регистрация</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
