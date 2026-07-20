"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/icon/icon";
import { ProductCard } from "@/components/products/product-card/product-card";
import type { ProductDetail } from "@/lib/mock/product-details";
import type { Product } from "@/lib/mock/products";
import styles from "./product-detail-content.module.css";

interface ProductDetailContentProps {
  product: ProductDetail;
  similarProducts: Product[];
}

const paymentIcons = [
  "/assets/card-ru.svg",
  "/assets/sbp.svg",
  "/assets/card-by.svg",
  "/assets/card-kz.svg",
  "/assets/visa.svg",
  "/assets/mastercard.svg",
  "/assets/mir.svg",
];

export function ProductDetailContent({ product, similarProducts }: ProductDetailContentProps) {
  return (
    <>
      <section className={styles.section} aria-label="Описание товара">
        <h2 className={styles.title}>{product.descriptionTitle}</h2>
        <p className={styles.subtitle}>{product.descriptionSubtitle}</p>
        <p className={styles.text}>{product.descriptionText}</p>

        <div className={styles.notes}>
          {product.notes.map((note) => (
            <p key={note} className={styles.note}>
              {note}
            </p>
          ))}
        </div>

        <button type="button" className={styles.moreButton}>
          Ещё
        </button>
      </section>

      <section className={styles.sellerSection} aria-label="Информация о продавце">
        <h2 className={styles.title}>Продавец</h2>
        <div className={styles.sellerCard}>
          <div className={styles.sellerLogo}>P</div>
          <div>
            <div className={styles.sellerName}>
              {product.sellerName}
              <Image src="/assets/seal-check.svg" alt="" width={18} height={18} />
            </div>
            <p className={styles.sellerInfo}>{product.sellerStoreInfo}</p>
          </div>
        </div>

        <div>
          <p className={styles.subtitle}>Способы оплаты</p>
          <div className={styles.paymentRow}>
            {paymentIcons.map((icon) => (
              <Icon key={icon} src={icon} width={32} height={32} className={styles.paymentIcon} />
            ))}
          </div>
        </div>

        {product.refundPolicies.map((policy) => (
          <div key={policy} className={styles.policy}>
            <span className={styles.checkBadge} aria-hidden="true" />
            <span>{policy}</span>
          </div>
        ))}

        <p className={styles.chatInfo}>{product.sellerChatInfo}</p>
      </section>

      <section className={styles.reviewsSection} aria-label="Отзывы">
        <div className={styles.reviewsHeader}>
          <h2 className={styles.reviewsTitle}>Отзывы</h2>
          <button type="button" className={styles.reset}>
            Сбросить
          </button>
        </div>
        <ProductCard product={product} />
      </section>

      <section className={styles.similarSection} aria-label="Похожие товары">
        <div className={styles.similarHeader}>
          <Image src="/assets/circles-four.png" alt="" width={24} height={24} />
          <h2 className={styles.similarTitle}>Похожие товары</h2>
        </div>
        <div className={styles.similarGrid}>
          {similarProducts.slice(0, 8).map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
        <button type="button" className={styles.loadMore}>
          Показать еще
        </button>
      </section>
    </>
  );
}
