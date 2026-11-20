import axios, { type AxiosInstance } from "axios";

import type { TDisputeGround } from "@/lib/dispute";
import type {
  TCreateOrderPayload,
  TOrder,
  TOrderChatMessage,
} from "@/types/orders";

export class OrdersApi {
  private static instance: OrdersApi;

  private readonly httpInstance: AxiosInstance;

  private constructor() {
    this.httpInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      withCredentials: true,
    });
  }

  public static getInstance(): OrdersApi {
    if (!OrdersApi.instance) {
      OrdersApi.instance = new OrdersApi();
    }

    return OrdersApi.instance;
  }

  public async create(payload: TCreateOrderPayload): Promise<TOrder> {
    const res = await this.httpInstance.post<TOrder>("orders", payload);
    return res.data;
  }

  public async listMine(): Promise<TOrder[]> {
    const res = await this.httpInstance.get<TOrder[]>("orders/mine");
    return res.data;
  }

  public async getOne(id: string): Promise<TOrder> {
    const res = await this.httpInstance.get<TOrder>(`orders/${id}`);
    return res.data;
  }

  public async fulfill(
    id: string,
    deliveryPayload?: Record<string, string>,
  ): Promise<TOrder> {
    const res = deliveryPayload
      ? await this.httpInstance.post<TOrder>(`orders/${id}/fulfill`, {
          deliveryPayload,
        })
      : await this.httpInstance.post<TOrder>(`orders/${id}/fulfill`);
    return res.data;
  }

  public async confirm(id: string): Promise<TOrder> {
    const res = await this.httpInstance.post<TOrder>(`orders/${id}/confirm`);
    return res.data;
  }

  public async cancel(id: string): Promise<TOrder> {
    const res = await this.httpInstance.post<TOrder>(`orders/${id}/cancel`);
    return res.data;
  }

  public async dispute(
    id: string,
    ground: TDisputeGround,
    comment?: string,
  ): Promise<TOrder> {
    const res = await this.httpInstance.post<TOrder>(`orders/${id}/dispute`, {
      ground,
      comment,
    });
    return res.data;
  }

  public async listMessages(id: string): Promise<TOrderChatMessage[]> {
    const res = await this.httpInstance.get<TOrderChatMessage[]>(
      `orders/${id}/messages`,
    );
    return res.data;
  }

  public async postMessage(
    id: string,
    text: string,
  ): Promise<TOrderChatMessage> {
    const res = await this.httpInstance.post<TOrderChatMessage>(
      `orders/${id}/messages`,
      { text },
    );
    return res.data;
  }
}
