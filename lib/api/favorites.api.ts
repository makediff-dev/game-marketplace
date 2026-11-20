import axios, { type AxiosInstance } from "axios";

import type { TCatalogProduct } from "@/types/catalog";

export type TFavoriteToggleResult = {
  favorited: boolean;
  productIds: number[];
};

export class FavoritesApi {
  private static instance: FavoritesApi;

  private readonly httpInstance: AxiosInstance;

  private constructor() {
    this.httpInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      withCredentials: true,
    });
  }

  public static getInstance(): FavoritesApi {
    if (!FavoritesApi.instance) {
      FavoritesApi.instance = new FavoritesApi();
    }

    return FavoritesApi.instance;
  }

  public async list(): Promise<TCatalogProduct[]> {
    const res = await this.httpInstance.get<TCatalogProduct[]>("favorites");
    return res.data;
  }

  public async listIds(): Promise<number[]> {
    const res = await this.httpInstance.get<{ productIds: number[] }>(
      "favorites/ids",
    );
    return res.data.productIds;
  }

  public async add(productId: number): Promise<TFavoriteToggleResult> {
    const res = await this.httpInstance.post<TFavoriteToggleResult>(
      "favorites",
      { productId },
    );
    return res.data;
  }

  public async remove(productId: number): Promise<TFavoriteToggleResult> {
    const res = await this.httpInstance.delete<TFavoriteToggleResult>(
      `favorites/${productId}`,
    );
    return res.data;
  }

  public async toggle(productId: number): Promise<TFavoriteToggleResult> {
    const res = await this.httpInstance.post<TFavoriteToggleResult>(
      "favorites/toggle",
      { productId },
    );
    return res.data;
  }
}
