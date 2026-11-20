"use client";

import { useQuery } from "@tanstack/react-query";

import { CatalogApi } from "@/api/catalog.api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type {
  TCatalogCategory,
  TCatalogCategoryPage,
  TCatalogProduct,
  TCatalogSearchResult,
  TCatalogSegment,
  THeroBanner,
} from "@/types/catalog";

export const CATALOG_HERO_BANNERS_KEY = ["catalog", "hero-banners"] as const;
export const CATALOG_SEGMENTS_KEY = ["catalog", "segments"] as const;
export const CATALOG_CATEGORIES_KEY = ["catalog", "categories"] as const;
export const CATALOG_PRODUCTS_KEY = ["catalog", "products"] as const;

export function useHeroBanners() {
  return useQuery<THeroBanner[]>({
    queryKey: CATALOG_HERO_BANNERS_KEY,
    queryFn: () => CatalogApi.getInstance().listHeroBanners(),
  });
}

export function useCatalogSegments() {
  return useQuery<TCatalogSegment[]>({
    queryKey: CATALOG_SEGMENTS_KEY,
    queryFn: () => CatalogApi.getInstance().listSegments(),
  });
}

export function useCatalogFees() {
  return useQuery({
    queryKey: ["catalog", "fees"],
    queryFn: () => CatalogApi.getInstance().getFees(),
  });
}

export function useCatalogCategories(segment?: string | null) {
  return useQuery<TCatalogCategory[]>({
    queryKey: [...CATALOG_CATEGORIES_KEY, segment ?? "all"],
    queryFn: () =>
      CatalogApi.getInstance().listCategories(segment ?? undefined),
  });
}

export function useCatalogProducts() {
  return useQuery<TCatalogProduct[]>({
    queryKey: CATALOG_PRODUCTS_KEY,
    queryFn: () => CatalogApi.getInstance().listProducts(),
  });
}

export function useCategoryPage(
  slug: string,
  params?: Record<string, string | undefined>,
) {
  return useQuery<TCatalogCategoryPage>({
    queryKey: ["catalog", "category", slug, params],
    queryFn: () => CatalogApi.getInstance().getCategoryPage(slug, params),
    enabled: Boolean(slug),
  });
}

export function useCatalogProduct(slug: string) {
  return useQuery<TCatalogProduct>({
    queryKey: ["catalog", "product", slug],
    queryFn: () => CatalogApi.getInstance().getProduct(slug),
    enabled: Boolean(slug),
  });
}

// Waits for a pause in typing, so one word is one request.
export function useCatalogSearch(
  query: string,
  enabled: boolean,
  segment?: string | null,
) {
  const debounced = useDebouncedValue(query, 300);

  return useQuery<TCatalogSearchResult>({
    queryKey: ["catalog", "search", debounced, segment ?? null],
    queryFn: () => CatalogApi.getInstance().search(debounced, segment),
    enabled,
    placeholderData: (previous) => previous,
  });
}
