"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  ProfileApi,
  type TProfileOverview,
  type TWithdrawPayload,
} from "@/api/profile.api";
import type {
  TProfileFilter,
  TProfileTab,
  TSalesStatsPeriod,
} from "@/lib/profile-data";

export const PROFILE_OVERVIEW_KEY = ["profile", "overview"] as const;
export const PROFILE_CASHBACK_KEY = ["profile", "cashback"] as const;
export const PROFILE_WITHDRAWALS_KEY = ["profile", "withdrawals"] as const;

export function useProfileOverview(enabled = true) {
  return useQuery({
    queryKey: PROFILE_OVERVIEW_KEY,
    queryFn: () => ProfileApi.getInstance().getOverview(),
    enabled,
  });
}

export function useCashbackProgress(enabled = true) {
  return useQuery({
    queryKey: PROFILE_CASHBACK_KEY,
    queryFn: () => ProfileApi.getInstance().getCashback(),
    enabled,
  });
}

export function useProfileItems(tab: TProfileTab, filter: TProfileFilter) {
  return useQuery({
    queryKey: ["profile", "items", tab, filter],
    queryFn: () => ProfileApi.getInstance().listItems(tab, filter),
    placeholderData: keepPreviousData,
  });
}

export function useBalanceHistory() {
  return useQuery({
    queryKey: ["profile", "balance", "history"],
    queryFn: () => ProfileApi.getInstance().getBalanceHistory(),
  });
}

export function useSalesStats(period: TSalesStatsPeriod) {
  return useQuery({
    queryKey: ["profile", "sales-stats", period],
    queryFn: () => ProfileApi.getInstance().getSalesStats(period),
  });
}

export function useDepositBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amount: number) => ProfileApi.getInstance().deposit(amount),
    onSuccess: (overview) => {
      queryClient.setQueryData(
        PROFILE_OVERVIEW_KEY,
        (current: TProfileOverview | undefined) => ({
          rating: 0,
          ...current,
          balance: overview.balance,
        }),
      );
      void queryClient.invalidateQueries({
        queryKey: ["profile", "balance", "history"],
      });
    },
  });
}

export function useWithdrawals() {
  return useQuery({
    queryKey: PROFILE_WITHDRAWALS_KEY,
    queryFn: () => ProfileApi.getInstance().listWithdrawals(),
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: TWithdrawPayload) =>
      ProfileApi.getInstance().withdraw(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROFILE_WITHDRAWALS_KEY });
      void queryClient.invalidateQueries({ queryKey: PROFILE_OVERVIEW_KEY });
      void queryClient.invalidateQueries({
        queryKey: ["profile", "balance", "history"],
      });
    },
  });
}
