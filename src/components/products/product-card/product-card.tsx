import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon/icon";
import { formatPrice, formatReviewCount, type Product } from "@/lib/mock/products";
import styles from "./product-card.module.css";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const priceClass =
    product.priceColor === "error"
      ? styles.priceError
      : product.priceColor === "success"
        ? styles.priceSuccess
        : styles.priceAccent;

  const discountClass =
    product.priceColor === "error" ? styles.discountError : styles.discountAccent;

  const showRating = product.rating > 0 || product.reviews > 0;

  return (
    <article className={styles.card}>
      <Link href={`/product/${product.id}`} className={styles.main}>
        <div className={styles.imageWrapper}>
          <Image
            src={product.image}
            alt={product.title}
            fill
            className={styles.image}
            sizes="214px"
          />
        </div>

        <div className={styles.body}>
          <span className={styles.gameName}>{product.game}</span>

          <div className={styles.priceRow}>
            <span className={`${styles.price} ${priceClass}`}>
              {formatPrice(product.price)} ₽
            </span>
            {product.discount ? (
              <div className={styles.discountRow}>
                <span className={`${styles.discountBadge} ${discountClass}`}>
                  -{product.discount}%
                </span>
                {product.oldPrice ? (
                  <span className={styles.oldPrice}>
                    {formatPrice(product.oldPrice)} ₽
                    <span className={styles.oldPriceLine} />
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className={styles.title}>
            {product.titleLines
              ? product.titleLines.map((line) => <p key={line}>{line}</p>)
              : product.title}
          </div>

          {showRating ? (
            <div className={styles.ratingRow}>
              <div
                className={styles.stars}
                aria-label={`Рейтинг ${product.rating} из 5`}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <Icon
                    key={index}
                    src={
                      index < Math.round(product.rating)
                        ? "/assets/star-filled.svg"
                        : "/assets/star-empty.svg"
                    }
                    width={12}
                    height={12}
                    className={styles.star}
                  />
                ))}
              </div>
              <span className={styles.ratingCount}>{formatReviewCount(product.reviews)}</span>
            </div>
          ) : null}
        </div>
      </Link>

      <Link href={`/product/${product.id}/checkout`} className={styles.buyButton}>
        Купить
      </Link>
    </article>
  );
}
