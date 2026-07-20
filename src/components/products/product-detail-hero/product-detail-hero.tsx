"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon/icon";
import type { ProductDetail } from "@/lib/mock/product-details";
import { formatPrice } from "@/lib/mock/products";
import { useToastStore } from "@/lib/store/toast-store";
import styles from "./product-detail-hero.module.css";

interface ProductDetailHeroProps {
  product: ProductDetail;
}

export function ProductDetailHero({ product }: ProductDetailHeroProps) {
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

        <h1 className={styles.title}>{product.title}</h1>

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
            <Icon
              src={isFavorite ? "/assets/heart-brand.svg" : "/assets/heart-white.svg"}
              width={24}
              height={24}
              className={styles.favoriteIcon}
            />
          </button>
          <button
            type="button"
            className={styles.buyButton}
            onClick={() => showToast("Заказ оформлен (прототип)")}
          >
            Купить
          </button>
        </div>

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
