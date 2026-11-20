"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { FilterModal, type TFilterValues } from "@/components/filter-modal";
import { ProductCard } from "@/components/product-card";
import { CatalogPageSkeleton } from "@/components/skeleton";
import { useCategoryPage } from "@/hooks/use-catalog";
import { formatProductCount } from "@/lib/catalog";
import { cx } from "@/lib/cx";
import styles from "@/styles/category-catalog.module.scss";

const PAGE_SIZE = 8;

type TSortMode =
  | "popular"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "speed"
  | "new";

const SORT_OPTIONS: Array<{ id: TSortMode; label: string }> = [
  { id: "popular", label: "Сначала популярные" },
  { id: "price-asc", label: "Сначала дешёвые" },
  { id: "price-desc", label: "Сначала дорогие" },
  { id: "rating", label: "Высокий рейтинг продавца" },
  { id: "speed", label: "Быстрая выдача" },
  { id: "new", label: "Новые" },
];

function toQueryParams(
  offerType: string | null,
  filters: TFilterValues,
  sort: TSortMode,
): Record<string, string | undefined> {
  const params: Record<string, string | undefined> = {
    offerType: offerType ?? undefined,
    sort: sort === "popular" ? undefined : sort,
  };

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === "" || value === false) {
      continue;
    }

    params[key] = String(value);
  }

  return params;
}

function priceLabel(filters: TFilterValues): string {
  const min = String(filters.priceMin ?? "").trim();
  const max = String(filters.priceMax ?? "").trim();

  if (min && max) {
    return `${min}–${max} ₽`;
  }

  if (min) {
    return `от ${min} ₽`;
  }

  if (max) {
    return `до ${max} ₽`;
  }

  return "Цена, ₽";
}

function sortLabel(sort: TSortMode): string {
  return SORT_OPTIONS.find((item) => item.id === sort)?.label ?? "Сортировка";
}

export function CategoryCatalogScreen({ slug }: { slug: string }) {
  const [offerType, setOfferType] = useState<string | null>(null);
  const [filters, setFilters] = useState<TFilterValues>({});
  const [sort, setSort] = useState<TSortMode>("popular");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortWrapRef = useRef<HTMLDivElement>(null);
  const [priceMinDraft, setPriceMinDraft] = useState("");
  const [priceMaxDraft, setPriceMaxDraft] = useState("");
  const [expanded, setExpanded] = useState(false);
  const priceWrapRef = useRef<HTMLDivElement>(null);
  const params = useMemo(
    () => toQueryParams(offerType, filters, sort),
    [offerType, filters, sort],
  );
  const pageQuery = useCategoryPage(slug, params);
  const page = pageQuery.data;
  const products = page?.products ?? [];
  const visible = expanded ? products : products.slice(0, PAGE_SIZE);
  const activeOffer = page?.offerTypes.find(
    (item) => item.slug === offerType,
  );
  const modalFilters = (page?.filters ?? []).filter(
    (field) => field.key !== "price",
  );
  const priceActive = Boolean(filters.priceMin || filters.priceMax);
  const sortActive = sort !== "popular";

  useEffect(() => {
    if (!priceOpen) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!priceWrapRef.current?.contains(target)) {
        setPriceOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPriceOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [priceOpen]);

  useEffect(() => {
    if (!sortOpen) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (!sortWrapRef.current?.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSortOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [sortOpen]);

  function openPriceMenu() {
    setPriceMinDraft(String(filters.priceMin ?? ""));
    setPriceMaxDraft(String(filters.priceMax ?? ""));
    setPriceOpen((current) => !current);
  }

  function applyPrice() {
    const min = priceMinDraft.trim();
    const max = priceMaxDraft.trim();

    setFilters((current) => ({
      ...current,
      priceMin: min || undefined,
      priceMax: max || undefined,
    }));
    setPriceOpen(false);
    setExpanded(false);
  }

  function clearPrice() {
    setPriceMinDraft("");
    setPriceMaxDraft("");
    setFilters((current) => {
      const next = { ...current };
      delete next.priceMin;
      delete next.priceMax;
      return next;
    });
    setPriceOpen(false);
    setExpanded(false);
  }

  if (pageQuery.isLoading) {
    return <CatalogPageSkeleton />;
  }

  if (pageQuery.isError || !page) {
    return (
      <p className={styles["category-catalog__empty"]}>Категория не найдена</p>
    );
  }

  return (
    <div className={styles["category-catalog"]}>
      <section
        className={styles["category-catalog__banner"]}
        aria-label={page.category.name}
      >
        <img
          className={styles["category-catalog__banner-image"]}
          src={page.category.banner || "/catalog/banner-cs2.png"}
          alt=""
        />
        <div
          className={styles["category-catalog__banner-gradient"]}
          aria-hidden
        />
        <h1 className={styles["category-catalog__banner-label"]}>
          <img src={page.category.icon} alt="" width={56} height={56} />
          {page.category.name}
        </h1>
      </section>

      <div className={styles["category-catalog__chips"]}>
        {/* The chip that looks chosen is the one sent to the server. */}
        {[{ slug: null, name: "Все" }, ...page.offerTypes].map((item) => (
          <button
            key={item.slug ?? "all"}
            className={cx(
              styles["category-catalog__chip"],
              offerType === item.slug && styles["category-catalog__chip--on"],
            )}
            type="button"
            aria-pressed={offerType === item.slug}
            onClick={() => {
              setOfferType(item.slug);
              setExpanded(false);
            }}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div className={styles["category-catalog__toolbar"]}>
        <div className={styles["category-catalog__tools"]}>
          <button
            className={cx(
              styles["category-catalog__tool"],
              filtersOpen && styles["category-catalog__tool--on"],
            )}
            type="button"
            aria-label="Фильтры"
            onClick={() => setFiltersOpen(true)}
          >
            <img src="/catalog/faders.svg" alt="" width={20} height={20} />
          </button>
          <div
            className={styles["category-catalog__price-wrap"]}
            ref={sortWrapRef}
          >
            <button
              className={cx(
                styles["category-catalog__tool-wide"],
                (sortOpen || sortActive) &&
                  styles["category-catalog__tool-wide--on"],
              )}
              type="button"
              aria-label={`Сортировка: ${sortLabel(sort).toLowerCase()}`}
              aria-expanded={sortOpen}
              aria-haspopup="menu"
              onClick={() => setSortOpen((current) => !current)}
            >
              <img
                src="/catalog/arrows-down-up.svg"
                alt=""
                width={18}
                height={18}
              />
              <span className={styles["category-catalog__sort-label"]}>
                {sortLabel(sort)}
              </span>
              <img
                src="/catalog/chevron-down.svg"
                alt=""
                width={16}
                height={16}
              />
            </button>
            {sortOpen ? (
              <div
                className={styles["category-catalog__sort-menu"]}
                role="menu"
                aria-label="Сортировка"
              >
                {SORT_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    className={cx(
                      styles["category-catalog__sort-option"],
                      sort === item.id &&
                        styles["category-catalog__sort-option--on"],
                    )}
                    type="button"
                    role="menuitemradio"
                    aria-checked={sort === item.id}
                    onClick={() => {
                      setSort(item.id);
                      setSortOpen(false);
                      setExpanded(false);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div
            className={styles["category-catalog__price-wrap"]}
            ref={priceWrapRef}
          >
            <button
              className={cx(
                styles["category-catalog__tool-wide"],
                (priceOpen || priceActive) &&
                  styles["category-catalog__tool-wide--on"],
              )}
              type="button"
              aria-expanded={priceOpen}
              aria-haspopup="dialog"
              onClick={openPriceMenu}
            >
              {priceLabel(filters)}
              <img
                src="/catalog/chevron-down.svg"
                alt=""
                width={16}
                height={16}
              />
            </button>
            {priceOpen ? (
              <div
                className={styles["category-catalog__price-menu"]}
                role="dialog"
                aria-label="Фильтр по цене"
              >
                <div className={styles["category-catalog__price-range"]}>
                  <input
                    className={styles["category-catalog__price-input"]}
                    value={priceMinDraft}
                    placeholder="От"
                    inputMode="numeric"
                    aria-label="Цена от"
                    onChange={(event) => setPriceMinDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        applyPrice();
                      }
                    }}
                  />
                  <span
                    className={styles["category-catalog__price-dash"]}
                    aria-hidden
                  >
                    —
                  </span>
                  <input
                    className={styles["category-catalog__price-input"]}
                    value={priceMaxDraft}
                    placeholder="До"
                    inputMode="numeric"
                    aria-label="Цена до"
                    onChange={(event) => setPriceMaxDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        applyPrice();
                      }
                    }}
                  />
                </div>
                <div className={styles["category-catalog__price-actions"]}>
                  <button
                    className={styles["category-catalog__price-clear"]}
                    type="button"
                    onClick={clearPrice}
                  >
                    Сбросить
                  </button>
                  <button
                    className={styles["category-catalog__price-apply"]}
                    type="button"
                    onClick={applyPrice}
                  >
                    Применить
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <p className={styles["category-catalog__total"]}>
          Всего {formatProductCount(page.total)}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className={styles["category-catalog__empty"]}>Нет товаров</p>
      ) : (
        <div className={styles["category-catalog__grid"]}>
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {products.length > PAGE_SIZE && (
        <button
          className={styles["category-catalog__more"]}
          type="button"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Скрыть" : "Показать еще"}
        </button>
      )}

      {filtersOpen && (
        <FilterModal
          title={activeOffer?.name ?? "Фильтры"}
          filters={modalFilters}
          initialValues={filters}
          onClose={() => setFiltersOpen(false)}
          onApply={(next) => {
            setFilters((current) => ({
              ...next,
              priceMin: current.priceMin,
              priceMax: current.priceMax,
            }));
            setFiltersOpen(false);
            setExpanded(false);
          }}
        />
      )}
    </div>
  );
}
