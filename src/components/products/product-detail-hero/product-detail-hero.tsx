"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Icon } from "@/components/ui/icon/icon";
import { SafePaymentBlock } from "@/components/products/safe-payment-block/safe-payment-block";
import type { ProductDetail } from "@/lib/mock/product-details";
import { formatPrice } from "@/lib/mock/products";
import { useToastStore } from "@/lib/store/toast-store";
import styles from "./product-detail-hero.module.css";

interface ProductDetailHeroProps {
  product: ProductDetail;
}

const HEART_PATH =
  "M22.5 9.5625C22.5 16.125 12.7697 21.4369 12.3553 21.6562C12.2461 21.715 12.124 21.7458 12 21.7458C11.876 21.7458 11.7539 21.715 11.6447 21.6562C11.2303 21.4369 1.5 16.125 1.5 9.5625C1.50174 8.02146 2.11468 6.54404 3.20436 5.45436C4.29404 4.36468 5.77146 3.75174 7.3125 3.75C9.24844 3.75 10.9434 4.5825 12 5.98969C13.0566 4.5825 14.7516 3.75 16.6875 3.75C18.2285 3.75174 19.706 4.36468 20.7956 5.45436C21.8853 6.54404 22.4983 8.02146 22.5 9.5625Z";

export function ProductDetailHero({ product }: ProductDetailHeroProps) {
  const router = useRouter();
  const showToast = useToastStore((state) => state.show);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteToggle = () => {
    setIsFavorite((current) => {
      const next = !current;
      showToast(next ? "Товар добавлен в избранное" : "Товар удалён из избранного");
      return next;
    });
  };

  return (
    <section className={styles.hero} aria-label="Информация о товаре">
      <div className={styles.imageWrapper}>
        <Image
          src={product.detailImage}
          alt={product.title}
          fill
          priority
          className={styles.image}
          sizes="612px"
        />
      </div>

      <div className={styles.info}>
        <div className={styles.summary}>
          <h1 className={styles.title}>{product.title}</h1>

          <div className={styles.priceRow}>
            <span className={styles.price}>{formatPrice(product.price)} ₽</span>
            {product.discount ? (
              <div className={styles.discountRow}>
                <span className={styles.discountBadge}>-{product.discount}%</span>
                {product.oldPrice ? (
                  <span className={styles.oldPrice}>
                    {formatPrice(product.oldPrice)}
                    <span className={styles.oldPriceLine} />
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {product.verified ? (
          <div className={styles.verified}>
            <Icon
              src="/assets/seal-check.svg"
              width={18}
              height={18}
              className={styles.verifiedIcon}
            />
            Официально от Playnox
          </div>
        ) : null}

        <div className={styles.deliveryCard}>
          <div className={styles.deliveryTitle}>
            <span>📦</span>
            {product.deliveryTitle}
          </div>
          <p className={styles.deliveryMethod}>{product.deliveryMethod}</p>
          <p className={styles.deliveryDescription}>{product.deliveryDescription}</p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteButtonActive : ""}`}
            aria-label={isFavorite ? "Удалить из избранного" : "Добавить в избранное"}
            aria-pressed={isFavorite}
            onClick={handleFavoriteToggle}
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              className={styles.favoriteIcon}
            >
              <path
                d={HEART_PATH}
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={isFavorite ? 0 : 2}
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={styles.buyButton}
            onClick={() => router.push(`/product/${product.id}/checkout`)}
          >
            Купить
          </button>
        </div>

        <SafePaymentBlock />

        <button type="button" className={styles.guarantee}>
          <span>🛡️</span>
          Гарантия Playnox
          <Icon
            src="/assets/arrow-small.svg"
            width={16}
            height={13}
            className={styles.guaranteeArrow}
          />
        </button>
      </div>
    </section>
  );
}
