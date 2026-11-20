"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ReviewsApi } from "@/api/reviews.api";

export function useSellerReviews(sellerId?: number) {
  return useQuery({
    queryKey: ["reviews", "seller", sellerId],
    queryFn: () => ReviewsApi.getInstance().forSeller(sellerId ?? 0),
    enabled: Boolean(sellerId),
  });
}

export function useOrderReview(orderId: string, enabled = true) {
  return useQuery({
    queryKey: ["reviews", "order", orderId],
    queryFn: () => ReviewsApi.getInstance().forOrder(orderId),
    enabled,
  });
}

export function useCreateReview(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { rating: number; text?: string }) =>
      ReviewsApi.getInstance().create(orderId, body),
    onSuccess: (review) => {
      queryClient.setQueryData(["reviews", "order", orderId], review);
      void queryClient.invalidateQueries({ queryKey: ["reviews", "seller"] });
    },
  });
}
