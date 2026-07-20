import Image from "next/image";
import Link from "next/link";
import { mockUser } from "@/lib/mock/user";
import styles from "./balance-content.module.css";

export function BalanceContent() {
  return (
    <div className={styles.balance}>
      <div>
        <p className={styles.amount}>{mockUser.balance} ₽</p>
        <p className={styles.amountLabel}>Доступно для вывода и оплаты</p>
      </div>

      <div className={styles.actions}>
        <Link href="/profile/balance/pay" className={styles.actionCard}>
          <span className={styles.actionLabel}>💳 Пополнить баланс</span>
          <Image
            src="/assets/arrow-small.svg"
            alt=""
            width={16}
            height={13}
            className={styles.arrowIcon}
          />
        </Link>
        <button type="button" className={styles.actionCard}>
          <span className={styles.actionLabel}>📤 Вывести средства</span>
          <Image
            src="/assets/arrow-small.svg"
            alt=""
            width={16}
            height={13}
            className={styles.arrowIcon}
          />
        </button>
      </div>

      <div className={styles.history}>
        <h2 className={styles.historyTitle}>История операций</h2>
        <p className={styles.emptyHistory}>Операций пока нет</p>
      </div>
    </div>
  );
}
