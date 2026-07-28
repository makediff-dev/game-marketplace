import Image from "next/image";
import Link from "next/link";
import {
  formatOrderPrice,
  getProductDetailForOrder,
  getProductForOrder,
  type OrderDetail,
} from "@/lib/mock/orders";
import styles from "./order-product-card.module.css";

interface OrderProductCardProps {
  order: OrderDetail;
}

export function OrderProductCard({ order }: OrderProductCardProps) {
  const product = getProductForOrder(order);
  const productDetail = getProductDetailForOrder(order);
  const counterpartyLabel = order.tab === "purchases" ? "Продавец" : "Покупатель";
  const counterpartyValue = order.tab === "purchases" ? order.seller : order.buyer;

  return (
    <article className={styles.card} aria-label="Товар в сделке">
      <Link href={`/product/${product.id}`} className={styles.imageLink}>
        <Image
          src={productDetail.detailImage ?? product.image}
          alt=""
          fill
          className={styles.image}
          sizes="120px"
        />
      </Link>

      <div className={styles.info}>
        <span className={styles.game}>{product.game}</span>
        <span className={styles.price}>{formatOrderPrice(order.price)}</span>
        <p className={styles.title}>{order.title}</p>
        <span className={styles.meta}>
          {counterpartyLabel}: {counterpartyValue} · {productDetail.deliveryMethod}
        </span>
      </div>

      <div className={styles.actions}>
        <Link href={`/product/${product.id}`} className={styles.openButton}>
          Открыть товар
        </Link>
      </div>
    </article>
  );
}
