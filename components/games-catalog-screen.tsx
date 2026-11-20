"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ListPageSkeleton } from "@/components/skeleton";
import { useCatalogCategories, useCatalogSegments } from "@/hooks/use-catalog";
import { categoryHref } from "@/lib/catalog";
import { cx } from "@/lib/cx";
import { segmentIconSrc } from "@/lib/segment-icons";
import styles from "@/styles/games-catalog.module.scss";

const PAGE_SIZE = 40;

export function GamesCatalogScreen() {
  const segmentsQuery = useCatalogSegments();
  const [segment, setSegment] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const segments = segmentsQuery.data;
  const firstSegmentSlug = segments?.[0]?.slug ?? null;
  const activeSegment = segment ?? firstSegmentSlug;
  const categoriesQuery = useCatalogCategories(activeSegment);
  const categories = categoriesQuery.data;
  const visible = useMemo(() => {
    const list = categories ?? [];
    return expanded ? list : list.slice(0, PAGE_SIZE);
  }, [categories, expanded]);

  useEffect(() => {
    if (!segment && firstSegmentSlug) {
      setSegment(firstSegmentSlug);
    }
  }, [segment, firstSegmentSlug]);

  return (
    <div className={styles["games-catalog"]}>
      <div className={styles["games-catalog__chips"]}>
        {(segments ?? []).map((item) => (
          <button
            key={item.slug}
            className={cx(
              styles["games-catalog__chip"],
              activeSegment === item.slug && styles["games-catalog__chip--on"],
            )}
            type="button"
            onClick={() => {
              setSegment(item.slug);
              setExpanded(false);
            }}
          >
            <img
              className={styles["games-catalog__chip-icon"]}
              src={segmentIconSrc(item.icon)}
              alt=""
              width={20}
              height={20}
            />
            {item.name}{" "}
            <span className={styles["games-catalog__count"]}>{item.count}</span>
          </button>
        ))}
      </div>

      {categoriesQuery.isLoading || segmentsQuery.isLoading ? (
        <ListPageSkeleton rows={6} />
      ) : visible.length === 0 ? (
        <p className={styles["games-catalog__empty"]}>Нет категорий</p>
      ) : (
        <div className={styles["games-catalog__grid"]}>
          {visible.map((app) => (
            <Link
              key={app.slug}
              className={styles["games-catalog__app"]}
              href={categoryHref(app.slug)}
            >
              <span className={styles["games-catalog__app-icon"]}>
                <span className={styles["games-catalog__app-icon-inner"]}>
                  <img src={app.icon} alt="" width={80} height={80} />
                </span>
                {app.badge && (
                  <span className={styles["games-catalog__badge"]}>
                    {app.badge}
                  </span>
                )}
              </span>
              <span className={styles["games-catalog__app-name"]}>
                {app.name}
              </span>
            </Link>
          ))}
        </div>
      )}

      {(categories?.length ?? 0) > PAGE_SIZE && (
        <button
          className={styles["games-catalog__more"]}
          type="button"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Скрыть" : "Показать еще"}
        </button>
      )}
    </div>
  );
}
