"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { ListPageSkeleton } from "@/components/skeleton";
import { useCatalogSearch, useCatalogSegments } from "@/hooks/use-catalog";
import { categoryHref } from "@/lib/catalog";
import { cx } from "@/lib/cx";
import styles from "@/styles/search-page.module.scss";
import type { TCatalogSearchHit } from "@/types/catalog";

const RECENT_KEY = "playnox-search-recent";

function readRecent(): TCatalogSearchHit[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as TCatalogSearchHit[]) : [];
  } catch {
    return [];
  }
}

function writeRecent(items: TCatalogSearchHit[]) {
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, 8)));
}

export function SearchScreen() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [recent, setRecent] = useState<TCatalogSearchHit[]>([]);
  const [segment, setSegment] = useState<string | null>(null);
  const segmentsQuery = useCatalogSegments();
  const searchQuery = useCatalogSearch(query, true, segment);
  const segments = segmentsQuery.data ?? [];
  const activeSegment = segment;

  const rows = useMemo(() => {
    if (query.trim()) {
      return searchQuery.data?.recent ?? [];
    }

    return recent.length > 0 ? recent : (searchQuery.data?.popular ?? []);
  }, [query, recent, searchQuery.data]);

  const products = query.trim() ? (searchQuery.data?.products ?? []) : [];

  const sectionTitle = query.trim()
    ? "Игры и приложения"
    : recent.length > 0
      ? "👀 Вы смотрели"
      : "🔥 Популярные";

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  useEffect(() => {
    setQuery(initial);
  }, [initial]);

  function remember(item: TCatalogSearchHit) {
    const next = [item, ...recent.filter((row) => row.slug !== item.slug)];
    setRecent(next);
    writeRecent(next);
  }

  function clearRecent() {
    setRecent([]);
    writeRecent([]);
  }

  return (
    <div className={styles["search-page"]}>
      <label className={styles["search-page__search-field"]}>
        <input
          className={styles["search-page__search-input"]}
          type="search"
          placeholder="Поиск товаров..."
          aria-label="Поиск товаров"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
        />
        <img src="/assets/magnifying-glass.svg" alt="" width={20} height={20} />
      </label>

      {segments.length > 0 && (
        <div className={styles["search-page__chips"]}>
          {segments.map((item) => (
            <button
              key={item.slug}
              className={cx(
                styles["search-page__chip"],
                activeSegment === item.slug && styles["search-page__chip--on"],
              )}
              type="button"
              aria-pressed={activeSegment === item.slug}
              onClick={() =>
                setSegment((current) =>
                  current === item.slug ? null : item.slug,
                )
              }
            >
              {item.name}
            </button>
          ))}
        </div>
      )}

      <section className={styles["search-page__section"]}>
        <div className={styles["search-page__section-header"]}>
          <h1 className={styles["search-page__section-title"]}>
            {sectionTitle}
          </h1>
          {!query.trim() && recent.length > 0 && (
            <button
              className={styles["search-page__reset"]}
              type="button"
              onClick={clearRecent}
            >
              Очистить
            </button>
          )}
        </div>

        {searchQuery.isLoading ? (
          <ListPageSkeleton rows={5} />
        ) : rows.length === 0 ? (
          <p className={styles["search-page__empty"]}>
            {products.length > 0 ? "Игр не нашлось" : "Ничего не найдено"}
          </p>
        ) : (
          <div className={styles["search-page__list"]}>
            {rows.map((item) => (
              <Link
                key={item.slug}
                className={styles["search-page__row"]}
                href={categoryHref(item.slug)}
                onClick={() => remember(item)}
              >
                <span className={styles["search-page__icon-wrap"]}>
                  <img
                    className={styles["search-page__icon"]}
                    src={item.icon}
                    alt=""
                    width={48}
                    height={48}
                  />
                </span>
                <span className={styles["search-page__row-text"]}>
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {products.length > 0 && (
        <section className={styles["search-page__section"]}>
          <div className={styles["search-page__section-header"]}>
            <h2 className={styles["search-page__section-title"]}>Товары</h2>
          </div>
          <div className={styles["search-page__products"]}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
