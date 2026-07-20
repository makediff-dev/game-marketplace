"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon/icon";
import Link from "next/link";
import { CategoryChip } from "@/components/ui/category-chip/category-chip";
import { products } from "@/lib/mock/products";
import { searchGameFilters } from "@/lib/mock/games";
import styles from "./search-content.module.css";

export function SearchContent() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(0);

  const filtered = products.filter((product) => {
    const matchesQuery =
      !query ||
      product.title.toLowerCase().includes(query.toLowerCase()) ||
      product.game.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase());
    const filter = searchGameFilters[activeFilter];
    const matchesFilter = filter === "Все" || product.game === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className={styles.search}>
      <div className={styles.searchBar}>
        <Icon src="/assets/magnifying-glass.svg" alt="" width={20} height={20} />
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Поиск товаров..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Поиск товаров"
          autoFocus
        />
      </div>

      <div className={styles.filters}>
        {searchGameFilters.map((chip, index) => (
          <CategoryChip
            key={chip}
            label={chip}
            active={activeFilter === index}
            onClick={() => setActiveFilter(index)}
          />
        ))}
      </div>

      <h2 className={styles.resultsTitle}>
        {filtered.length > 0 ? `Найдено: ${filtered.length}` : "Ничего не найдено"}
      </h2>

      {filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <article style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Image
                  src={product.image}
                  alt={product.title}
                  width={260}
                  height={160}
                  style={{ borderRadius: "12px", objectFit: "cover", width: "100%", height: "auto" }}
                />
                <span style={{ fontSize: "14px", fontWeight: 600 }}>{product.title}</span>
                <span style={{ fontSize: "14px", color: "var(--brand-500)" }}>{product.price} ₽</span>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Попробуйте изменить запрос или фильтр</p>
      )}
    </div>
  );
}
