"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useCatalogSearch, useCatalogSegments } from "@/hooks/use-catalog";
import { categoryHref, formatMoney, productHref } from "@/lib/catalog";
import { cx } from "@/lib/cx";
import { segmentIconSrc } from "@/lib/segment-icons";
import styles from "@/styles/search-overlay.module.scss";
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

export function SearchOverlay({
  query,
  onClose,
}: {
  query: string;
  onClose: () => void;
}) {
  const [recent, setRecent] = useState<TCatalogSearchHit[]>([]);
  const [segment, setSegment] = useState<string | null>(null);
  const segmentsQuery = useCatalogSegments();
  // No chip means every section; a chip narrows the results, a second click clears it.
  const searchQuery = useCatalogSearch(query, true, segment);
  const segments = segmentsQuery.data;
  const activeSegment = segment;
  const products = query.trim()
    ? (searchQuery.data?.products ?? []).slice(0, 4)
    : [];
  const rows = useMemo(() => {
    if (query.trim()) {
      return searchQuery.data?.recent ?? [];
    }

    // Recent ones have their own block above.
    return searchQuery.data?.popular ?? [];
  }, [query, searchQuery.data]);

  useEffect(() => {
    setRecent(readRecent());
  }, []);

  function remember(item: TCatalogSearchHit) {
    const next = [item, ...recent.filter((row) => row.slug !== item.slug)];
    setRecent(next);
    writeRecent(next);
    onClose();
  }

  function clearRecent() {
    setRecent([]);
    writeRecent([]);
  }

  return (
    <div
      className={styles["search-overlay"]}
      role="listbox"
      aria-label="Результаты поиска"
    >
      {(segments?.length ?? 0) > 0 && (
        <div className={styles["search-overlay__chips"]}>
          {(segments ?? []).map((item) => (
            <button
              key={item.slug}
              className={cx(
                styles["search-overlay__chip"],
                activeSegment === item.slug &&
                  styles["search-overlay__chip--on"],
              )}
              type="button"
              aria-pressed={activeSegment === item.slug}
              onClick={() =>
                setSegment((current) =>
                  current === item.slug ? null : item.slug,
                )
              }
            >
              <img
                src={segmentIconSrc(item.icon)}
                alt=""
                width={18}
                height={18}
              />
              {item.name}
              <span className={styles["search-overlay__count"]}>
                {item.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {!query.trim() && recent.length > 0 && (
        <section className={styles["search-overlay__section"]}>
          <div className={styles["search-overlay__section-head"]}>
            <h3 className={styles["search-overlay__section-title"]}>
              👀 Вы смотрели
            </h3>
            <button
              className={styles["search-overlay__reset"]}
              type="button"
              onClick={clearRecent}
            >
              Сбросить
            </button>
          </div>
          {recent.map((item) => (
            <div key={item.slug} className={styles["search-overlay__row-wrap"]}>
              <Link
                className={styles["search-overlay__row"]}
                href={categoryHref(item.slug)}
                onClick={() => remember(item)}
              >
                <img src={item.icon} alt="" width={48} height={48} />
                <span className={styles["search-overlay__row-copy"]}>
                  <span className={styles["search-overlay__row-name"]}>
                    {item.name}
                  </span>
                  <span className={styles["search-overlay__row-meta"]}>
                    {item.offerTypes.join(", ") || "Категория"}
                  </span>
                </span>
              </Link>
              <button
                className={styles["search-overlay__remove"]}
                type="button"
                aria-label="Удалить"
                onClick={() => {
                  const next = recent.filter((row) => row.slug !== item.slug);
                  setRecent(next);
                  writeRecent(next);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </section>
      )}

      <section className={styles["search-overlay__section"]}>
        <div className={styles["search-overlay__section-head"]}>
          <h3 className={styles["search-overlay__section-title"]}>
            {query.trim() ? "Игры и приложения" : "🔥 Популярные"}
          </h3>
        </div>
        {searchQuery.isLoading && !query.trim() && recent.length === 0 ? (
          <div
            className={styles["search-overlay__spinner"]}
            aria-label="Загрузка"
          />
        ) : rows.length === 0 ? (
          <p className={styles["search-overlay__row-meta"]}>
            {products.length > 0 ? "Игр не нашлось" : "Ничего не найдено"}
          </p>
        ) : (
          rows.map((item) => (
            <Link
              key={item.slug}
              className={styles["search-overlay__row"]}
              href={categoryHref(item.slug)}
              onClick={() => remember(item)}
            >
              <img src={item.icon} alt="" width={48} height={48} />
              <span className={styles["search-overlay__row-copy"]}>
                <span className={styles["search-overlay__row-name"]}>
                  {item.name}
                </span>
                <span className={styles["search-overlay__row-meta"]}>
                  {item.offerTypes.join(", ") || "Категория"}
                </span>
              </span>
            </Link>
          ))
        )}
      </section>

      {products.length > 0 && (
        <section className={styles["search-overlay__section"]}>
          <div className={styles["search-overlay__section-head"]}>
            <h3 className={styles["search-overlay__section-title"]}>Товары</h3>
            <Link
              className={styles["search-overlay__reset"]}
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              onClick={onClose}
            >
              Все результаты
            </Link>
          </div>
          {products.map((product) => (
            <Link
              key={product.id}
              className={styles["search-overlay__row"]}
              href={productHref(product)}
              onClick={onClose}
            >
              <img
                src={product.thumb || product.image}
                alt=""
                width={48}
                height={48}
              />
              <span className={styles["search-overlay__row-copy"]}>
                <span className={styles["search-overlay__row-name"]}>
                  {product.title}
                </span>
                <span className={styles["search-overlay__row-meta"]}>
                  {product.game} · {formatMoney(product.price)}
                </span>
              </span>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
