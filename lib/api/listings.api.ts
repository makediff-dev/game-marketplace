import axios, { type AxiosInstance } from "axios";

import { compressImage } from "@/lib/compress-image";
import type {
  TCreateListingPayload,
  TPromotionMethod,
  TPromotionResult,
  TPromotionTerms,
  TSellerListing,
  TUpdateListingPayload,
} from "@/types/listings";

export class ListingsApi {
  private static instance: ListingsApi;

  private readonly httpInstance: AxiosInstance;

  private constructor() {
    this.httpInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      withCredentials: true,
    });
  }

  public static getInstance(): ListingsApi {
    if (!ListingsApi.instance) {
      ListingsApi.instance = new ListingsApi();
    }

    return ListingsApi.instance;
  }

  public async create(payload: TCreateListingPayload): Promise<TSellerListing> {
    const imageIds: number[] = [];

    for (const file of payload.images ?? []) {
      const compressed = await compressImage(file);
      const uploaded = await this.uploadImage(compressed);
      imageIds.push(uploaded.id);
    }

    const res = await this.httpInstance.post<TSellerListing>("listings", {
      gameId: payload.gameId,
      gameName: payload.gameName,
      categoryId: payload.categoryId,
      categoryLabel: payload.categoryLabel,
      listingType: payload.listingType,
      title: payload.title,
      description: payload.description || undefined,
      comment: payload.comment || undefined,
      deliveryInstruction: payload.deliveryInstruction,
      price: payload.price,
      server: payload.server || undefined,
      genre: payload.genre || undefined,
      region: payload.region || undefined,
      imageIds: imageIds.length > 0 ? imageIds : undefined,
    });

    return res.data;
  }

  public async uploadImage(file: File): Promise<{ id: number }> {
    const body = new FormData();
    body.append("file", file);

    const res = await this.httpInstance.post<{ id: number }>(
      "listings/images",
      body,
    );
    return res.data;
  }

  public async listMine(): Promise<TSellerListing[]> {
    const res = await this.httpInstance.get<TSellerListing[]>("listings/mine");
    return res.data;
  }

  public async getMine(id: string): Promise<TSellerListing> {
    const res = await this.httpInstance.get<TSellerListing>(
      `listings/mine/${id}`,
    );
    return res.data;
  }

  public async update(
    id: string,
    { photos, ...payload }: TUpdateListingPayload,
  ): Promise<TSellerListing> {
    let imageIds: number[] | undefined;

    if (photos) {
      imageIds = [];

      for (const photo of photos) {
        if (typeof photo === "number") {
          imageIds.push(photo);
          continue;
        }

        const uploaded = await this.uploadImage(await compressImage(photo));
        imageIds.push(uploaded.id);
      }
    }

    const res = await this.httpInstance.patch<TSellerListing>(
      `listings/mine/${id}`,
      { ...payload, imageIds },
    );
    return res.data;
  }

  public async promotionTerms(): Promise<TPromotionTerms> {
    const res = await this.httpInstance.get<TPromotionTerms>(
      "listings/promotion",
    );
    return res.data;
  }

  public async promote(
    id: string,
    method: TPromotionMethod,
  ): Promise<TPromotionResult> {
    const res = await this.httpInstance.post<TPromotionResult>(
      `listings/mine/${id}/promote`,
      { method },
    );
    return res.data;
  }

  public async archive(id: string): Promise<TSellerListing> {
    const res = await this.httpInstance.patch<TSellerListing>(
      `listings/mine/${id}/archive`,
    );
    return res.data;
  }
}
