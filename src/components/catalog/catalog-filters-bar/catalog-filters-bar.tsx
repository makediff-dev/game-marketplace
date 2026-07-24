"use client";

import { Icon } from "@/components/ui/icon/icon";
import { CategoryChip } from "@/components/ui/category-chip/category-chip";
import styles from "./catalog-filters-bar.module.css";

interface CatalogFiltersBarProps {
  subcategories: { id: string; label: string }[];
  activeSubcategory: string;
  onSubcategoryChange: (id: string) => void;
  totalProducts: number;
  onOpenFilters: () => void;
}

export function CatalogFiltersBar({
  subcategories,
  activeSubcategory,
  onSubcategoryChange,
  totalProducts,
  onOpenFilters,
}: CatalogFiltersBarProps) {
  return (
    <section className={`contentBlock ${styles.bar}`} aria-label="Фильтры каталога">
      <div className={styles.chips}>
        {subcategories.map((item) => (
          <CategoryChip
            key={item.id}
            label={item.label}
            active={activeSubcategory === item.id}
            onClick={() => onSubcategoryChange(item.id)}
          />
        ))}
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Открыть фильтры"
            onClick={onOpenFilters}
          >
            <Icon
              src="/assets/faders-horizontal.svg"
              width={20}
              height={20}
              className={styles.icon}
            />
          </button>
          <button type="button" className={styles.iconButton} aria-label="Сортировка">
            <Icon
              src="/assets/arrows-down-up.svg"
              width={20}
              height={20}
              className={styles.icon}
            />
          </button>
          <button type="button" className={styles.priceButton}>
            <span className={styles.priceLabel}>Цена, ₽</span>
          </button>
        </div>
        <span className={styles.total}>Всего {totalProducts} товара</span>
      </div>
    </section>
  );
}
