import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { SellerPresenceBadge } from "@/components/products/seller-presence-badge/seller-presence-badge";
import {
  formatOrderPrice,
  getProductDetailForOrder,
  getProductForOrder,
  type OrderDetail,
} from "@/lib/mock/orders";
import styles from "./order-product-card.module.css";

interface OrderProductCardProps {
  order: OrderDetail;
  dealActions?: ReactNode;
}

export function OrderProductCard({ order, dealActions }: OrderProductCardProps) {
  const product = getProductForOrder(order);
  const productDetail = getProductDetailForOrder(order);
  const counterpartyLabel = order.tab === "purchases" ? "Продавец" : "Покупатель";
  const counterpartyValue = order.tab === "purchases" ? order.seller : order.buyer;
  const isSellerOnline = order.sellerOnline ?? false;

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
        <p className={styles.meta}>
          <span>
            {counterpartyLabel}: {counterpartyValue}
          </span>
          <span className={styles.metaSeparator} aria-hidden>
            ·
          </span>
          <SellerPresenceBadge
            sellerName={order.seller}
            isOnline={isSellerOnline}
            viewerRole={order.tab}
          />
          <span className={styles.metaSeparator} aria-hidden>
            ·
          </span>
          <span>{productDetail.deliveryMethod}</span>
        </p>
      </div>

      <div className={styles.actions}>
        {dealActions}
        <Link href={`/product/${product.id}`} className={styles.openButton}>
          Открыть товар
        </Link>
      </div>
    </article>
  );
}
