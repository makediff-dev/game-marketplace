"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/products/product-card/product-card";
import {
  INITIAL_VISIBLE_COUNT,
  LOAD_MORE_COUNT,
  products,
} from "@/lib/mock/products";
import styles from "./catalog-product-grid.module.css";

interface CatalogProductGridProps {
  showHeader?: boolean;
  gameId?: string;
  category?: string;
}

export function CatalogProductGrid({
  showHeader = false,
  gameId,
  category,
}: CatalogProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesGame = !gameId || product.gameId === gameId;
      const matchesCategory = !category || product.category === category;
      return matchesGame && matchesCategory;
    });
  }, [gameId, category]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <section className={styles.section} aria-label="Товары">
      {showHeader ? (
        <div className={styles.header}>
          <span className={styles.title}>Самые популярные товары</span>
        </div>
      ) : null}

      {filteredProducts.length > 0 ? (
        <div className={styles.grid}>
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Товары в этой категории скоро появятся</p>
      )}

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
