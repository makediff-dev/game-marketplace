import axios, { type AxiosInstance } from "axios";

import type {
  TBalanceHistoryItem,
  TProfileFilter,
  TProfileItem,
  TProfileTab,
  TSalesStatsData,
  TSalesStatsPeriod,
} from "@/lib/profile-data";

export type TProfileOverview = {
  balance: number;
  /** Held in active deals and payouts. */
  heldBalance?: number;
  rating: number;
  purchaseTotal?: number;
};

export type TWithdrawal = {
  id: string;
  amount: number;
  status: "pending" | "paid" | "rejected";
  bank: string;
  phone: string;
  rejectReason: string | null;
  createdAt: string;
  processedAt: string | null;
};

export type TWithdrawPayload = {
  amount: number;
  phone: string;
  bank: string;
};

export type TCashbackTier = {
  id: number;
  label: string;
  percent: number;
  thresholdAmount: number;
  sortOrder: number;
};

export type TCashbackProgress = {
  tiers: TCashbackTier[];
  purchaseTotal: number;
  currentPercent: number;
  progress: number;
  nextThreshold: number | null;
  nextPercent: number | null;
};

export class ProfileApi {
  private static instance: ProfileApi;

  private readonly httpInstance: AxiosInstance;

  private constructor() {
    this.httpInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      withCredentials: true,
    });
  }

  public static getInstance(): ProfileApi {
    if (!ProfileApi.instance) {
      ProfileApi.instance = new ProfileApi();
    }

    return ProfileApi.instance;
  }

  public async getOverview(): Promise<TProfileOverview> {
    const res = await this.httpInstance.get<TProfileOverview>("profile/overview");
    return res.data;
  }

  public async getCashback(): Promise<TCashbackProgress> {
    const res = await this.httpInstance.get<TCashbackProgress>("profile/cashback");
    return res.data;
  }

  public async listItems(
    tab: TProfileTab,
    filter: TProfileFilter,
  ): Promise<TProfileItem[]> {
    const res = await this.httpInstance.get<TProfileItem[]>("profile/items", {
      params: { tab, filter },
    });
    return res.data;
  }

  public async getBalanceHistory(): Promise<TBalanceHistoryItem[]> {
    const res = await this.httpInstance.get<TBalanceHistoryItem[]>(
      "profile/balance/history",
    );
    return res.data;
  }

  public async deposit(amount: number): Promise<TProfileOverview> {
    const res = await this.httpInstance.post<{ balance: number }>(
      "profile/balance/deposit",
      { amount },
    );
    return { balance: res.data.balance, rating: 0 };
  }

  public async listWithdrawals(): Promise<TWithdrawal[]> {
    const res = await this.httpInstance.get<TWithdrawal[]>(
      "profile/withdrawals",
    );
    return res.data;
  }

  public async withdraw(body: TWithdrawPayload): Promise<TWithdrawal> {
    const res = await this.httpInstance.post<TWithdrawal>(
      "profile/withdrawals",
      body,
    );
    return res.data;
  }

  public async getSalesStats(
    period: TSalesStatsPeriod,
  ): Promise<TSalesStatsData> {
    const res = await this.httpInstance.get<TSalesStatsData>(
      "profile/sales-stats",
      { params: { period } },
    );
    return res.data;
  }
}
