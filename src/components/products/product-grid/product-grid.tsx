"use client";

import { useState } from "react";
import { ProductCard } from "@/components/products/product-card/product-card";
import { Icon } from "@/components/ui/icon/icon";
import {
  INITIAL_VISIBLE_COUNT,
  LOAD_MORE_COUNT,
  products,
} from "@/lib/mock/products";
import styles from "./product-grid.module.css";

export function ProductGrid() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  return (
    <section className={`contentBlock ${styles.section}`} aria-label="Самые популярные товары">
      <div className={styles.header}>
        <Icon
          src="/assets/heart.svg"
          width={24}
          height={24}
          className={styles.heartIcon}
        />
        <h2 className={styles.title}>Самые популярные товары</h2>
      </div>

      <div className={styles.grid}>
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore ? (
        <button
          type="button"
          className={styles.loadMore}
          onClick={() => setVisibleCount((count) => count + LOAD_MORE_COUNT)}
        >
          Показать еще
        </button>
      ) : null}
    </section>
  );
}
