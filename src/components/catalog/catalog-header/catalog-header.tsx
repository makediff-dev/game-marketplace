import Link from "next/link";
import { Icon } from "@/components/ui/icon/icon";
import styles from "./catalog-header.module.css";

export function CatalogHeader() {
  return (
    <section className={styles.header} aria-label="Каталог цифровых товаров">
      <div className={styles.textBlock}>
        <h2 className={styles.title}>Каталог цифровых товаров</h2>
        <p className={styles.subtitle}>Аккаунты, валюта, ключ, буст и подписки</p>
      </div>
      <Link href="/categories" className={styles.categoriesButton}>
        <Icon
          src="/assets/grid-four.svg"
          width={24}
          height={24}
          className={styles.gridIcon}
        />
        Все категории
      </Link>
    </section>
  );
}
