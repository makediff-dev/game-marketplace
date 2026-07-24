"use client";

import {
  getBuyerFieldsAfterPayment,
  sellAfterSaleInstructions,
} from "@/lib/mock/sell-wizard";
import styles from "../sell-wizard.module.css";

interface SellProductInfoBlocksProps {
  gameId: string;
  categoryId: string;
}

export function SellProductInfoBlocks({ gameId, categoryId }: SellProductInfoBlocksProps) {
  const buyerFields = getBuyerFieldsAfterPayment(gameId, categoryId);

  return (
    <div className={styles.infoBlocks}>
      <section className={styles.infoBlock} aria-label="Данные покупателя после оплаты">
        <div className={styles.infoBlockHeader}>
          <span className={styles.infoBlockEmoji} aria-hidden>
            📦
          </span>
          <h2 className={styles.infoBlockTitle}>Покупатель укажет после оплаты</h2>
        </div>
        <p className={styles.infoBlockSubtitle}>Данные необходимые для выполнения заказа</p>
        <ul className={styles.infoList}>
          {buyerFields.map((field) => (
            <li key={field} className={styles.infoListItem}>
              {field}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.infoBlock} aria-label="Инструкция после продажи">
        <div className={styles.infoBlockHeader}>
          <span className={styles.infoBlockEmoji} aria-hidden>
            ℹ️
          </span>
          <h2 className={styles.infoBlockTitle}>Инструкция после продажи</h2>
        </div>
        <ul className={styles.infoList}>
          {sellAfterSaleInstructions.map((item) => (
            <li key={item.id} className={styles.infoListItem}>
              <strong className={styles.infoListTerm}>{item.term}</strong>
              {item.text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
