import { formatOrderPrice, type OrderDetail } from "@/lib/mock/orders";
import styles from "./order-details-list.module.css";

interface OrderDetailsListProps {
  order: OrderDetail;
}

export function OrderDetailsList({ order }: OrderDetailsListProps) {
  const counterpartyLabel = order.tab === "purchases" ? "Автор" : "Покупатель";
  const counterpartyValue = order.tab === "purchases" ? order.seller : order.buyer;

  return (
    <dl className={styles.detailsList}>
      <dt className={styles.label}>Товар</dt>
      <dd className={styles.value}>{order.title}</dd>

      <dt className={styles.label}>{counterpartyLabel}</dt>
      <dd className={styles.value}>{counterpartyValue}</dd>

      <dt className={styles.label}>Покупатель</dt>
      <dd className={styles.value}>{order.buyer}</dd>

      <dt className={styles.label}>Сумма</dt>
      <dd className={styles.value}>{formatOrderPrice(order.price)}</dd>

      <dt className={styles.label}>Дата</dt>
      <dd className={styles.value}>{order.date}</dd>
    </dl>
  );
}
