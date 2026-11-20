import axios, { type AxiosInstance } from "axios";

import type { TPromoQuote, TValidatePromoPayload } from "@/types/promos";

export class PromosApi {
  private static instance: PromosApi;

  private readonly httpInstance: AxiosInstance;

  private constructor() {
    this.httpInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      withCredentials: true,
    });
  }

  public static getInstance(): PromosApi {
    if (!PromosApi.instance) {
      PromosApi.instance = new PromosApi();
    }

    return PromosApi.instance;
  }

  public async validate(payload: TValidatePromoPayload): Promise<TPromoQuote> {
    const res = await this.httpInstance.post<TPromoQuote>(
      "promos/validate",
      payload,
    );
    return res.data;
  }
}
