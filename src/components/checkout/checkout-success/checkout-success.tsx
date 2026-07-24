"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { Icon } from "@/components/ui/icon/icon";
import { getCheckoutOrderId, getCheckoutPaymentLabel } from "@/lib/mock/checkout";
import type { ProductDetail } from "@/lib/mock/product-details";
import { formatPrice } from "@/lib/mock/products";
import styles from "./checkout-success.module.css";

interface CheckoutSuccessProps {
  product: ProductDetail;
  paymentMethod: string;
}

export function CheckoutSuccess({ product, paymentMethod }: CheckoutSuccessProps) {
  const orderHref = `/profile/orders/${getCheckoutOrderId(product.id, product.title)}`;

  return (
    <section className={styles.page} aria-label="Оплата заказа">
      <div className={styles.panel}>
        <div className={styles.body}>
          <div className={styles.iconWrap} aria-hidden>
            <Icon
              src="/assets/checkmark-white.svg"
              width={32}
              height={32}
              className={styles.checkIcon}
            />
          </div>

          <div className={styles.statusBlock}>
            <h2 className={styles.statusTitle}>Оплата прошла успешно</h2>
            <p className={styles.statusText}>
              Средства заморожены. Продавец может приступить к выполнению заказа.
            </p>
          </div>

          <div className={styles.details}>
            <p className={styles.amount}>{formatPrice(product.price)} ₽</p>
            <p className={styles.detailMuted}>
              Оплачено: {getCheckoutPaymentLabel(paymentMethod)}
            </p>
          </div>

          <div className={styles.actions}>
            <Link href={orderHref} className={styles.actionLink}>
              <Button variant="gradient" fullWidth large>
                Перейти к сделке
              </Button>
            </Link>
            <Link href="/chat" className={styles.secondaryButton}>
              Открыть чаты
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
