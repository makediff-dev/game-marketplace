import axios, { type AxiosInstance } from "axios";

import type {
  TCatalogCategory,
  TCatalogFees,
  TCatalogCategoryPage,
  TCatalogFilterField,
  TCatalogProduct,
  TCatalogSearchResult,
  TCatalogSegment,
  THeroBanner,
} from "@/types/catalog";

export class CatalogApi {
  private static instance: CatalogApi;

  private readonly httpInstance: AxiosInstance;

  private constructor() {
    this.httpInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      withCredentials: true,
    });
  }

  public static getInstance(): CatalogApi {
    if (!CatalogApi.instance) {
      CatalogApi.instance = new CatalogApi();
    }

    return CatalogApi.instance;
  }

  public async listHeroBanners(): Promise<THeroBanner[]> {
    const res = await this.httpInstance.get<THeroBanner[]>(
      "catalog/hero-banners",
    );

    return res.data;
  }

  public async listSegments(): Promise<TCatalogSegment[]> {
    const res = await this.httpInstance.get<TCatalogSegment[]>(
      "catalog/segments",
    );

    return res.data;
  }

  public async getFees(): Promise<TCatalogFees> {
    const res = await this.httpInstance.get<TCatalogFees>("catalog/fees");
    return res.data;
  }

  public async listCategories(segment?: string): Promise<TCatalogCategory[]> {
    const res = await this.httpInstance.get<TCatalogCategory[]>(
      "catalog/categories",
      { params: segment ? { segment } : undefined },
    );

    return res.data;
  }

  public async getCategoryPage(
    slug: string,
    params?: Record<string, string | undefined>,
  ): Promise<TCatalogCategoryPage> {
    const res = await this.httpInstance.get<TCatalogCategoryPage>(
      `catalog/categories/${slug}`,
      { params },
    );

    return res.data;
  }

  public async listFilters(
    category?: string,
    offerType?: string,
  ): Promise<TCatalogFilterField[]> {
    const res = await this.httpInstance.get<TCatalogFilterField[]>(
      "catalog/filters",
      {
        params: {
          ...(category ? { category } : {}),
          ...(offerType ? { offerType } : {}),
        },
      },
    );

    return res.data;
  }

  public async listProducts(categorySlug?: string): Promise<TCatalogProduct[]> {
    const res = await this.httpInstance.get<TCatalogProduct[]>(
      "catalog/products",
      {
        params: categorySlug ? { category: categorySlug } : undefined,
      },
    );

    return res.data;
  }

  public async countView(slug: string): Promise<void> {
    await this.httpInstance.post(`catalog/products/${slug}/view`);
  }

  public async getProduct(slug: string): Promise<TCatalogProduct> {
    const res = await this.httpInstance.get<TCatalogProduct>(
      `catalog/products/${slug}`,
    );

    return res.data;
  }

  public async search(
    query: string,
    segment?: string | null,
  ): Promise<TCatalogSearchResult> {
    const res = await this.httpInstance.get<TCatalogSearchResult>(
      "catalog/search",
      { params: segment ? { q: query, segment } : { q: query } },
    );

    return res.data;
  }
}
