import Link from "next/link";
import styles from "./order-breadcrumbs.module.css";

interface OrderBreadcrumbsProps {
  section: string;
  dealId: string;
}

export function OrderBreadcrumbs({ section, dealId }: OrderBreadcrumbsProps) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Навигация">
      <Link href="/" className={styles.link}>
        Главная
      </Link>
      <span className={styles.separator}>/</span>
      <Link href="/profile" className={styles.link}>
        {section}
      </Link>
      <span className={styles.separator}>/</span>
      <span className={styles.current}>Сделка #{dealId}</span>
    </nav>
  );
}
