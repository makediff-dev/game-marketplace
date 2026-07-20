import { Icon } from "@/components/ui/icon/icon";
import Link from "next/link";
import styles from "./page-header.module.css";

interface PageHeaderProps {
  title: string;
  backHref?: string;
  menuHref?: string;
}

export function PageHeader({ title, backHref, menuHref }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      {menuHref ? (
        <Link href={menuHref} className={styles.menuButton} aria-label="Меню профиля">
          <Icon
            src="/assets/list-icon.svg"
            width={24}
            height={24}
            className={styles.menuIcon}
          />
        </Link>
      ) : backHref ? (
        <Link href={backHref} className={styles.backLink} aria-label="Назад">
          <Icon
            src="/assets/arrow-small.svg"
            width={16}
            height={13}
            className={styles.backIcon}
          />
        </Link>
      ) : null}
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
}
