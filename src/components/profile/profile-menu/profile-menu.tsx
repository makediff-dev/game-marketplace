import Image from "next/image";
import Link from "next/link";
import { mockUser } from "@/lib/mock/user";
import styles from "./profile-menu.module.css";

const menuItems = [
  { href: "/profile/balance", label: "Баланс", value: `${mockUser.balance} ₽` },
  { href: "/profile", label: "Мои товары", value: "0" },
  { href: "/chat", label: "Чаты", value: "" },
  { href: "/register/profile", label: "Настройки профиля", value: mockUser.name },
];

export function ProfileMenu() {
  return (
    <nav className={styles.menu} aria-label="Меню профиля">
      <div className={styles.statusBadge}>
        <Image src="/assets/seal-check.svg" alt="" width={20} height={20} />
        <span>Профиль подтверждён</span>
      </div>
      {menuItems.map((item) => (
        <Link key={item.href} href={item.href} className={styles.menuItem}>
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
      <Link href="/login" className={`${styles.menuItem} ${styles.logout}`}>
        <span className={styles.menuLabel}>Выйти</span>
      </Link>
    </nav>
  );
}
