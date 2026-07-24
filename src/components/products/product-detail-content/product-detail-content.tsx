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

export function ProductDetailContent({ product, similarProducts }: ProductDetailContentProps) {
  return (
    <div className="contentBlock">
      <section className={styles.section} aria-label="Описание товара">
        <h2 className={styles.title}>{product.descriptionTitle}</h2>

        <div className={styles.attributeBlock}>
          <p className={styles.subtitle}>{product.descriptionSubtitle}</p>
          <p className={styles.attributeValue}>{product.descriptionText}</p>
        </div>

        <div className={styles.notesWrapper}>
          <div className={styles.notes}>
            {product.notes.map((note, index) => {
              const isLast = index === product.notes.length - 1;
              const noteClass = `${styles.note} ${index === 0 ? styles.noteWarning : styles.noteBold}`;

              if (isLast) {
                return (
                  <div key={note} className={styles.noteRow}>
                    <p className={noteClass}>{note}</p>
                    <button type="button" className={styles.moreButton}>
                      ещё
                    </button>
                  </div>
                );
              }

              return (
                <p key={note} className={noteClass}>
                  {note}
                </p>
              );
            })}
          </div>
        </div>
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

        <div className={styles.policyList}>
          {product.refundPolicies.map((policy) => (
            <div key={policy} className={styles.policy}>
              <span className={styles.checkBadge} aria-hidden="true">
                <Icon
                  src="/assets/check-brand.svg"
                  width={24}
                  height={24}
                  className={styles.checkIcon}
                />
              </span>
              <span className={styles.policyText}>{policy}</span>
            </div>
          ))}
        </div>

        <p className={styles.chatInfo}>{product.sellerChatInfo}</p>
      </section>

      <section className={styles.viewedSection} aria-label="Вы смотрели">
        <div className={styles.viewedHeader}>
          <h2 className={styles.viewedTitle}>👀 Вы смотрели</h2>
          <button type="button" className={styles.reset}>
            Сбросить
          </button>
        </div>
        <div className={styles.viewedCard}>
          <ProductCard product={product} />
        </div>
      </section>

      <section className={styles.similarSection} aria-label="Похожие товары">
        <div className={styles.similarHeader}>
          <Icon
            src="/assets/circles-four.svg"
            width={24}
            height={24}
            className={styles.similarIcon}
          />
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
    </div>
  );
}
