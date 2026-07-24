import { formatOrderPrice, type OrderDetail } from "@/lib/mock/orders";
import styles from "./order-money-box.module.css";

interface OrderMoneyBoxProps {
  order: OrderDetail;
}

export function OrderMoneyBox({ order }: OrderMoneyBoxProps) {
  return (
    <div className={styles.box}>
      <p className={styles.label}>Где сейчас деньги</p>
      <p className={styles.title}>{order.moneyStatusTitle}</p>
      <div className={styles.footer}>
        <p className={styles.footerItem}>
          Сумма сделки:{" "}
          <span className={styles.footerValue}>{formatOrderPrice(order.price)}</span>
        </p>
        <p className={styles.footerItem}>
          Комиссия платформы:{" "}
          <span className={styles.footerValue}>{formatOrderPrice(order.commission)}</span>
        </p>
        {order.showSellerPayout && order.sellerPayout ? (
          <p className={styles.footerItem}>
            Продавцу:{" "}
            <span className={styles.footerValue}>{formatOrderPrice(order.sellerPayout)}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
