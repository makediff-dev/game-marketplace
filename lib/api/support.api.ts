import axios, { type AxiosInstance } from "axios";

import type {
  TNewSupportTicket,
  TSupportChatMessage,
  TSupportTicket,
  TSupportTopic,
} from "@/types/support";

export class SupportApi {
  private static instance: SupportApi;

  private readonly httpInstance: AxiosInstance;

  private constructor() {
    this.httpInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      withCredentials: true,
    });
  }

  public static getInstance(): SupportApi {
    if (!SupportApi.instance) {
      SupportApi.instance = new SupportApi();
    }

    return SupportApi.instance;
  }

  public async listTopics(): Promise<TSupportTopic[]> {
    const res = await this.httpInstance.get<TSupportTopic[]>("support/topics");
    return res.data;
  }

  public async listTickets(): Promise<TSupportTicket[]> {
    const res =
      await this.httpInstance.get<TSupportTicket[]>("support/tickets");
    return res.data;
  }

  public async createTicket(
    ticket: TNewSupportTicket,
  ): Promise<TSupportTicket> {
    const res = await this.httpInstance.post<TSupportTicket>(
      "support/tickets",
      ticket,
    );
    return res.data;
  }

  public async listMessages(ticketId: number): Promise<TSupportChatMessage[]> {
    const res = await this.httpInstance.get<TSupportChatMessage[]>(
      `support/tickets/${ticketId}/messages`,
    );
    return res.data;
  }

  public async postMessage(
    ticketId: number,
    text: string,
  ): Promise<TSupportChatMessage> {
    const res = await this.httpInstance.post<TSupportChatMessage>(
      `support/tickets/${ticketId}/messages`,
      { text },
    );
    return res.data;
  }

  public async closeTicket(ticketId: number): Promise<TSupportTicket> {
    const res = await this.httpInstance.post<TSupportTicket>(
      `support/tickets/${ticketId}/close`,
    );
    return res.data;
  }
}
