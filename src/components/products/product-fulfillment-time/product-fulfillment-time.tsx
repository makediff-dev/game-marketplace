import { getProductFulfillmentTime } from "@/lib/mock/fulfillment-time";
import type { Product } from "@/lib/mock/products";
import styles from "./product-fulfillment-time.module.css";

interface ProductFulfillmentTimeProps {
  product: Product;
  variant?: "card" | "detail";
  className?: string;
}

export function ProductFulfillmentTime({
  product,
  variant = "card",
  className,
}: ProductFulfillmentTimeProps) {
  const time = getProductFulfillmentTime(product);

  return (
    <div
      className={[
        styles.root,
        variant === "detail" ? styles.detail : styles.card,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={styles.label}>Выполнение заказа</span>
      <span className={styles.value}>{time}</span>
    </div>
  );
}
