import axios, { type AxiosInstance } from "axios";

export type TNotification = {
  id: string;
  type: string;
  title: string;
  text: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export type TNotificationSetting = {
  type: string;
  label: string;
  /** Payment, dispute and refused payout e-mails cannot be turned off. */
  critical: boolean;
  email: boolean;
};

export class NotificationsApi {
  private static instance: NotificationsApi;

  private readonly httpInstance: AxiosInstance;

  private constructor() {
    this.httpInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      withCredentials: true,
    });
  }

  public static getInstance(): NotificationsApi {
    if (!NotificationsApi.instance) {
      NotificationsApi.instance = new NotificationsApi();
    }

    return NotificationsApi.instance;
  }

  public async list(): Promise<{ items: TNotification[]; unread: number }> {
    const res = await this.httpInstance.get<{
      items: TNotification[];
      unread: number;
    }>("notifications");
    return res.data;
  }

  public async markRead(ids?: string[]): Promise<void> {
    await this.httpInstance.post("notifications/read", { ids });
  }

  public async getSettings(): Promise<TNotificationSetting[]> {
    const res = await this.httpInstance.get<{ types: TNotificationSetting[] }>(
      "notifications/settings",
    );
    return res.data.types;
  }

  public async updateSettings(
    emailMuted: string[],
  ): Promise<TNotificationSetting[]> {
    const res = await this.httpInstance.put<{ types: TNotificationSetting[] }>(
      "notifications/settings",
      { emailMuted },
    );
    return res.data.types;
  }
}
