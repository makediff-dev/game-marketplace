import Link from "next/link";
import styles from "./stub-page.module.css";

interface StubPageProps {
  title: string;
  description?: string;
}

export function StubPage({ title, description }: StubPageProps) {
  return (
    <div className={styles.stub}>
      <div className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>
          {description ?? "Прототип — страница в разработке"}
        </p>
        <Link href="/" className={styles.backLink}>
          На главную
        </Link>
      </div>
    </div>
  );
}
