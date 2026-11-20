"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ListingsApi } from "@/api/listings.api";
import type {
  TCreateListingPayload,
  TPromotionMethod,
  TUpdateListingPayload,
} from "@/types/listings";

export const MY_LISTINGS_KEY = ["listings", "mine"] as const;

export function useMyListings(enabled = true) {
  return useQuery({
    queryKey: MY_LISTINGS_KEY,
    queryFn: () => ListingsApi.getInstance().listMine(),
    enabled,
  });
}

export function usePromotionTerms(enabled = true) {
  return useQuery({
    queryKey: ["listings", "promotion"],
    queryFn: () => ListingsApi.getInstance().promotionTerms(),
    enabled,
    staleTime: 60_000,
  });
}

export function usePromoteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, method }: { id: string; method: TPromotionMethod }) =>
      ListingsApi.getInstance().promote(id, method),
    onSuccess: () => {
      // The balance, the profile cards and the catalog order all changed.
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TCreateListingPayload) =>
      ListingsApi.getInstance().create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_LISTINGS_KEY });
      void queryClient.invalidateQueries({ queryKey: ["profile", "items"] });
      void queryClient.invalidateQueries({
        queryKey: ["profile", "sales-stats"],
      });
    },
  });
}

export function useMyListing(id: string) {
  return useQuery({
    queryKey: [...MY_LISTINGS_KEY, id],
    queryFn: () => ListingsApi.getInstance().getMine(id),
    enabled: Boolean(id),
  });
}

export function useUpdateListing(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TUpdateListingPayload) =>
      ListingsApi.getInstance().update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MY_LISTINGS_KEY });
      void queryClient.invalidateQueries({ queryKey: ["profile", "items"] });
    },
  });
}
