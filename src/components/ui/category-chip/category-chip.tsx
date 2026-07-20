"use client";

import styles from "./category-chip.module.css";

interface CategoryChipProps {
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}

export function CategoryChip({ label, count, active = false, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      className={`${styles.chip} ${active ? styles.chipActive : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className={styles.inner}>
        <span className={`${styles.label} ${active ? styles.labelActive : ""}`}>{label}</span>
        {count !== undefined ? (
          <span className={`${styles.count} ${active ? styles.countActive : ""}`}>{count}</span>
        ) : null}
      </span>
    </button>
  );
}
