"use client";

import { CheckoutOrderItem } from "@/components/checkout/checkout-order-item/checkout-order-item";
import type { CheckoutCartItem } from "@/lib/mock/checkout";
import { formatPrice } from "@/lib/mock/products";
import styles from "./checkout-order-summary.module.css";

interface CheckoutOrderSummaryProps {
  items: CheckoutCartItem[];
  totalPrice: number;
  onQuantityChange: (itemId: string, delta: number) => void;
  onRemove: (itemId: string) => void;
}

export function CheckoutOrderSummary({
  items,
  totalPrice,
  onQuantityChange,
  onRemove,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className={styles.summary} aria-label="Ваш заказ">
      <h2 className={styles.title}>Ваш заказ</h2>

      <div className={styles.items}>
        {items.map((item) => (
          <CheckoutOrderItem
            key={item.id}
            item={item}
            onIncrease={() => onQuantityChange(item.id, 1)}
            onDecrease={() => onQuantityChange(item.id, -1)}
            onRemove={() => onRemove(item.id)}
          />
        ))}
      </div>

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>К оплате</span>
        <span className={styles.totalValue}>{formatPrice(totalPrice)} ₽</span>
      </div>

      <p className={styles.note}>
        Комиссия платформы удерживается с продавца после завершения сделки. Покупатель
        оплачивает только цену товара.
      </p>
    </aside>
  );
}
