"use client";

import Link from "next/link";

import { formatMoney, productHref } from "@/lib/catalog";
import styles from "@/styles/product-card.module.scss";
import type { TCatalogProduct } from "@/types/catalog";

function priceToneClass(tone: TCatalogProduct["tone"]): string {
  if (tone === "sale") {
    return styles["product-card__price--error"];
  }

  if (tone === "brand") {
    return styles["product-card__price--accent"];
  }

  return styles["product-card__price--success"];
}

function discountToneClass(tone: TCatalogProduct["tone"]): string {
  return tone === "sale"
    ? styles["product-card__discount-badge--error"]
    : styles["product-card__discount-badge--accent"];
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few;
  }

  return many;
}

export function ProductCard({ product }: { product: TCatalogProduct }) {
  const href = productHref(product);
  const sold = product.soldCount ?? 0;

  return (
    <article className={styles["product-card"]}>
      <Link className={styles["product-card__main"]} href={href}>
        <span className={styles["product-card__image-wrapper"]}>
          <img
            className={styles["product-card__image"]}
            src={product.thumb || product.image}
            alt=""
            width={220}
            height={174}
            loading="lazy"
            decoding="async"
          />
          <span className={styles["product-card__game-name"]}>
            {product.game}
          </span>
        </span>
        <span className={styles["product-card__body"]}>
          {product.productType || product.promoted ? (
            <span className={styles["product-card__chips"]}>
              {product.promoted ? (
                <span className={styles["product-card__top"]}>Топ</span>
              ) : null}
              {product.productType ? (
                <span className={styles["product-card__type"]}>
                  {product.productType}
                </span>
              ) : null}
            </span>
          ) : null}
          <span className={styles["product-card__title"]}>{product.title}</span>
          <span className={styles["product-card__seller"]}>
            <span className={styles["product-card__seller-row"]}>
              {product.seller && (
                <span className={styles["product-card__seller-name"]}>
                  {product.sellerVerified ? (
                    <img
                      src="/assets/seal-check.svg"
                      alt=""
                      width={12}
                      height={12}
                    />
                  ) : null}
                  {product.seller}
                </span>
              )}
              {product.sellerOnline != null ? (
                <span className={styles["product-card__presence"]}>
                  <span
                    className={`${styles["product-card__presence-dot"]} ${
                      product.sellerOnline
                        ? styles["product-card__presence-dot--online"]
                        : styles["product-card__presence-dot--offline"]
                    }`}
                  />
                  <span className={styles["product-card__presence-text"]}>
                    {product.sellerOnline ? "В сети" : "Не в сети"}
                  </span>
                </span>
              ) : null}
            </span>
            {sold > 0 ? (
              <span className={styles["product-card__sold"]}>
                {sold} {plural(sold, "продажа", "продажи", "продаж")}
              </span>
            ) : null}
          </span>
        </span>
      </Link>
      <div className={styles["product-card__footer"]}>
        <span className={styles["product-card__price-row"]}>
          <span className={styles["product-card__price-main"]}>
            <span
              className={`${styles["product-card__price"]} ${priceToneClass(product.tone)}`}
            >
              {formatMoney(product.price)}
            </span>
            {product.unitHint && (
              <span className={styles["product-card__unit-hint"]}>
                {product.unitHint}
              </span>
            )}
            {product.discount && (
              <span className={styles["product-card__discount-row"]}>
                <span
                  className={`${styles["product-card__discount-badge"]} ${discountToneClass(product.tone)}`}
                >
                  {product.discount}
                </span>
                {product.oldPrice != null && (
                  <span className={styles["product-card__old-price"]}>
                    {formatMoney(product.oldPrice)}
                    <span
                      className={styles["product-card__old-price-line"]}
                      aria-hidden
                    />
                  </span>
                )}
              </span>
            )}
          </span>
        </span>
        <Link className={styles["product-card__buy-button"]} href={href}>
          Купить
        </Link>
      </div>
    </article>
  );
}
