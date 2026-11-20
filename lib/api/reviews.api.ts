import axios, { type AxiosInstance } from "axios";

export type TReview = {
  id: string;
  orderId: string;
  rating: number;
  text: string;
  buyerName: string;
  createdAt: string;
};

export type TSellerReviews = {
  rating: number;
  count: number;
  items: TReview[];
};

export class ReviewsApi {
  private static instance: ReviewsApi;

  private readonly httpInstance: AxiosInstance;

  private constructor() {
    this.httpInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      withCredentials: true,
    });
  }

  public static getInstance(): ReviewsApi {
    if (!ReviewsApi.instance) {
      ReviewsApi.instance = new ReviewsApi();
    }

    return ReviewsApi.instance;
  }

  public async forSeller(sellerId: number): Promise<TSellerReviews> {
    const res = await this.httpInstance.get<TSellerReviews>(
      `sellers/${sellerId}/reviews`,
    );
    return res.data;
  }

  public async forOrder(orderId: string): Promise<TReview | null> {
    const res = await this.httpInstance.get<TReview | null>(
      `orders/${orderId}/review`,
    );
    return res.data || null;
  }

  public async create(
    orderId: string,
    body: { rating: number; text?: string },
  ): Promise<TReview> {
    const res = await this.httpInstance.post<TReview>(
      `orders/${orderId}/review`,
      body,
    );
    return res.data;
  }
}
