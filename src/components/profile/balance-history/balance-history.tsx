"use client";

import {
  formatHistoryAmount,
  isPositiveHistoryAmount,
  mockBalanceHistory,
} from "@/lib/mock/balance-history";
import styles from "./balance-history.module.css";

export function BalanceHistory() {
  return (
    <section className={styles.history} aria-label="История операций">
      <h2 className={styles.title}>История</h2>

      <div className={styles.table}>
        <div className={styles.headerRow}>
          <span className={styles.headerCell}>Операция</span>
          <span className={styles.headerCell}>Сумма</span>
          <span className={styles.headerCell}>Состояние</span>
        </div>

        <ul className={styles.list}>
          {mockBalanceHistory.map((item, index) => (
            <li
              key={item.id}
              className={[styles.row, index % 2 === 1 ? styles.rowAlt : ""].filter(Boolean).join(" ")}
            >
              <span className={styles.cell}>{item.label}</span>
              <span
                className={[
                  styles.cell,
                  styles.amountCell,
                  isPositiveHistoryAmount(item.amount) ? styles.amountPositive : styles.amountNegative,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {formatHistoryAmount(item.amount)}
              </span>
              <span className={[styles.cell, styles.statusCell].join(" ")}>{item.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
