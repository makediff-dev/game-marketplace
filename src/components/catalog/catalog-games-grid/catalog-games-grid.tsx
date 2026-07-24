"use client";

import { useMemo, useState } from "react";
import { CategoryChip } from "@/components/ui/category-chip/category-chip";
import { CatalogGameCard } from "@/components/catalog/catalog-game-card/catalog-game-card";
import {
  CATALOG_LOAD_MORE,
  catalogCategories,
  catalogGames,
  INITIAL_CATALOG_VISIBLE,
  type CatalogGame,
} from "@/lib/mock/catalog-games";
import type { GameGroup } from "@/lib/mock/games";
import styles from "./catalog-games-grid.module.css";

export function CatalogGamesGrid() {
  const [activeCategory, setActiveCategory] = useState<GameGroup>("games");
  const [visibleCount, setVisibleCount] = useState(INITIAL_CATALOG_VISIBLE);

  const filteredGames = useMemo(
    () => catalogGames.filter((game) => game.group === activeCategory),
    [activeCategory],
  );

  const visibleGames = filteredGames.slice(0, visibleCount);
  const hasMore = visibleCount < filteredGames.length;

  const handleCategoryChange = (categoryId: GameGroup) => {
    setActiveCategory(categoryId);
    setVisibleCount(INITIAL_CATALOG_VISIBLE);
  };

  return (
    <section className={`contentBlock ${styles.section}`} aria-label="Каталог игр">
      <div className={styles.chips}>
        {catalogCategories.map((category) => (
          <CategoryChip
            key={category.id}
            label={category.label}
            count={category.count}
            active={activeCategory === category.id}
            onClick={() => handleCategoryChange(category.id)}
          />
        ))}
      </div>

      <div className={styles.grid}>
        {visibleGames.map((game: CatalogGame) => (
          <CatalogGameCard key={game.id} game={game} />
        ))}
      </div>

      {hasMore ? (
        <button
          type="button"
          className={styles.loadMore}
          onClick={() => setVisibleCount((count) => count + CATALOG_LOAD_MORE)}
        >
          Показать еще
        </button>
      ) : null}
    </section>
  );
}
