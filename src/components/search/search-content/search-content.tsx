"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CategoryChip } from "@/components/ui/category-chip/category-chip";
import { Icon } from "@/components/ui/icon/icon";
import { catalogGroupFilters, getGameById, type GameGroup } from "@/lib/mock/games";
import {
  searchPopularItems,
  searchViewedItems,
  type SearchSuggestionItem,
} from "@/lib/mock/search";
import styles from "./search-content.module.css";

function filterByGroup(items: SearchSuggestionItem[], group: GameGroup | null) {
  if (!group) {
    return items;
  }

  return items.filter((item) => getGameById(item.gameId)?.group === group);
}

interface SearchSuggestionListProps {
  items: SearchSuggestionItem[];
  removable?: boolean;
  onRemove?: (id: string) => void;
}

function SearchSuggestionList({ items, removable = false, onRemove }: SearchSuggestionListProps) {
  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const game = getGameById(item.gameId);

        return (
          <li key={item.id} className={styles.row}>
            <Link href={item.href} className={styles.rowLink}>
              <span className={styles.iconWrap}>
                {game ? (
                  <Image
                    src={game.catalogIcon}
                    alt=""
                    width={48}
                    height={48}
                    className={styles.icon}
                  />
                ) : null}
              </span>
              <span className={styles.rowText}>{item.categories}</span>
            </Link>
            {removable ? (
              <button
                type="button"
                className={styles.removeButton}
                aria-label="Удалить из истории"
                onClick={() => onRemove?.(item.id)}
              >
                <Icon
                  src="/assets/modal-close.svg"
                  width={24}
                  height={24}
                  className={styles.removeIcon}
                />
              </button>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function SearchContent() {
  const [activeGroup, setActiveGroup] = useState<GameGroup | null>(null);
  const [viewedItems, setViewedItems] = useState(searchViewedItems);

  const filteredViewedItems = useMemo(
    () => filterByGroup(viewedItems, activeGroup),
    [viewedItems, activeGroup],
  );

  const filteredPopularItems = useMemo(
    () => filterByGroup(searchPopularItems, activeGroup),
    [activeGroup],
  );

  const handleRemoveViewedItem = (id: string) => {
    setViewedItems((items) => items.filter((item) => item.id !== id));
  };

  const handleResetViewed = () => {
    setViewedItems([]);
  };

  return (
    <div className={styles.page}>
      <div className={styles.chips}>
        {catalogGroupFilters.map((filter) => (
          <CategoryChip
            key={filter.id}
            label={filter.label}
            count={filter.count}
            active={activeGroup === filter.id}
            onClick={() =>
              setActiveGroup((current) => (current === filter.id ? null : filter.id))
            }
          />
        ))}
      </div>

      {filteredViewedItems.length > 0 ? (
        <section className={styles.section} aria-label="Вы смотрели">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>👀 Вы смотрели</h2>
            <button type="button" className={styles.resetButton} onClick={handleResetViewed}>
              Сбросить
            </button>
          </div>
          <SearchSuggestionList
            items={filteredViewedItems}
            removable
            onRemove={handleRemoveViewedItem}
          />
        </section>
      ) : null}

      <section className={styles.section} aria-label="Популярные">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🔥 Популярные</h2>
        </div>
        <SearchSuggestionList items={filteredPopularItems} />
      </section>

      <div className={styles.loader} aria-hidden />
    </div>
  );
}
