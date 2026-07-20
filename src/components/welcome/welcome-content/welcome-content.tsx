import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import styles from "./welcome-content.module.css";

export function WelcomeContent() {
  return (
    <section className={styles.welcome}>
      <span className={styles.emoji} aria-hidden>
        👋
      </span>
      <h2 className={styles.heading}>Добро пожаловать на Playnox!</h2>
      <p className={styles.description}>
        Ваш аккаунт создан. Теперь вы можете покупать товары, продавать свои предложения и
        общаться с поддержкой в чате.
      </p>
      <div className={styles.actions}>
        <Link href="/">
          <Button variant="gradient" fullWidth large>
            На главную
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="outline" fullWidth large>
            Перейти в профиль
          </Button>
        </Link>
      </div>
    </section>
  );
}
