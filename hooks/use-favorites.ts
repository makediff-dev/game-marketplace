"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { FavoritesApi } from "@/api/favorites.api";
import { useUserStore } from "@/store/user.store";
import type { TCatalogProduct } from "@/types/catalog";

export const FAVORITES_KEY = ["favorites"] as const;
export const FAVORITE_IDS_KEY = ["favorites", "ids"] as const;

export function useFavorites() {
  const user = useUserStore((state) => state.user);

  return useQuery<TCatalogProduct[]>({
    queryKey: FAVORITES_KEY,
    queryFn: () => FavoritesApi.getInstance().list(),
    enabled: Boolean(user),
  });
}

export function useFavoriteIds() {
  const user = useUserStore((state) => state.user);

  return useQuery<number[]>({
    queryKey: FAVORITE_IDS_KEY,
    queryFn: () => FavoritesApi.getInstance().listIds(),
    enabled: Boolean(user),
  });
}

type TToggleContext = {
  previous: number[];
  nextFavorited: boolean;
};

export function useToggleFavorite(options?: {
  onSuccessToast?: (favorited: boolean) => void;
  onErrorToast?: (message: string) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: number) =>
      FavoritesApi.getInstance().toggle(productId),
    onMutate: async (productId): Promise<TToggleContext> => {
      await queryClient.cancelQueries({ queryKey: FAVORITE_IDS_KEY });
      const previous =
        queryClient.getQueryData<number[]>(FAVORITE_IDS_KEY) ?? [];
      const wasFavorited = previous.includes(productId);
      const nextFavorited = !wasFavorited;
      const next = nextFavorited
        ? [...previous, productId]
        : previous.filter((id) => id !== productId);

      queryClient.setQueryData(FAVORITE_IDS_KEY, next);
      return { previous, nextFavorited };
    },
    onError: (_error, _productId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FAVORITE_IDS_KEY, context.previous);
      }

      options?.onErrorToast?.("Не удалось обновить избранное");
    },
    // The heart moves at once, the toast waits for the server.
    onSuccess: (result, _productId, context) => {
      queryClient.setQueryData(FAVORITE_IDS_KEY, result.productIds);
      options?.onSuccessToast?.(context.nextFavorited);
      void queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
    },
  });
}
