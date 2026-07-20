import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon/icon";
import { formatPrice, type Product } from "@/lib/mock/products";
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

  return (
    <Link href={`/product/${product.id}`} className={styles.card}>
      <div className={styles.header}>
        <Image
          src={product.logo}
          alt={product.game}
          width={44}
          height={44}
          className={styles.logo}
        />
        <div className={styles.gameInfo}>
          <span className={styles.gameName}>{product.game}</span>
          <span className={styles.category}>{product.category}</span>
        </div>
      </div>

      <div className={styles.imageWrapper}>
        <Image
          src={product.image}
          alt={product.title}
          fill
          className={styles.image}
          sizes="262px"
        />
      </div>

      <div className={styles.priceRow}>
        <span className={`${styles.price} ${priceClass}`}>
          {formatPrice(product.price)} ₽
        </span>
        {product.discount ? (
          <>
            <span className={`${styles.discountBadge} ${discountClass}`}>
              -{product.discount}%
            </span>
            {product.oldPrice ? (
              <span className={styles.oldPrice}>
                {formatPrice(product.oldPrice)} ₽
                <span className={styles.oldPriceLine} />
              </span>
            ) : null}
          </>
        ) : null}
      </div>

      <div className={styles.title}>
        {product.titleLines
          ? product.titleLines.map((line) => <p key={line}>{line}</p>)
          : product.title}
      </div>

      {product.seller ? (
        <div className={styles.seller}>
          {product.verified ? (
            <Icon
              src="/assets/verified-icon.svg"
              width={12}
              height={12}
              className={styles.verifiedIcon}
            />
          ) : null}
          <span className={styles.sellerName}>{product.seller}</span>
        </div>
      ) : null}

      {product.rating ? (
        <div className={styles.ratingRow}>
          <div className={styles.stars} aria-label="5 звёзд">
            <Icon
              src="/assets/star-filled.svg"
              width={12}
              height={12}
              className={styles.star}
            />
            {Array.from({ length: 4 }).map((_, index) => (
              <Icon
                key={index}
                src="/assets/star-empty.svg"
                width={12}
                height={12}
                className={styles.star}
              />
            ))}
          </div>
          <span className={styles.ratingCount}>{product.rating}</span>
        </div>
      ) : null}
    </Link>
  );
}
