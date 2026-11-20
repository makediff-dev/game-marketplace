"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { OrdersApi } from "@/api/orders.api";
import type { TDisputeGround } from "@/lib/dispute";
import type { TCreateOrderPayload } from "@/types/orders";

export const ORDERS_MINE_KEY = ["orders", "mine"] as const;

export function useMyOrders(enabled = true) {
  return useQuery({
    queryKey: ORDERS_MINE_KEY,
    queryFn: () => OrdersApi.getInstance().listMine(),
    enabled,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => OrdersApi.getInstance().getOne(id),
    enabled: Boolean(id),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TCreateOrderPayload) =>
      OrdersApi.getInstance().create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ORDERS_MINE_KEY });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useFulfillOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      deliveryPayload,
    }: {
      id: string;
      deliveryPayload?: Record<string, string>;
    }) => OrdersApi.getInstance().fulfill(id, deliveryPayload),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: ORDERS_MINE_KEY });
      void queryClient.invalidateQueries({ queryKey: ["orders", order.id] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useConfirmOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => OrdersApi.getInstance().confirm(id),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: ORDERS_MINE_KEY });
      void queryClient.invalidateQueries({ queryKey: ["orders", order.id] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => OrdersApi.getInstance().cancel(id),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: ORDERS_MINE_KEY });
      void queryClient.invalidateQueries({ queryKey: ["orders", order.id] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useDisputeOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ground,
      comment,
    }: {
      id: string;
      ground: TDisputeGround;
      comment?: string;
    }) => OrdersApi.getInstance().dispute(id, ground, comment),
    onSuccess: (order) => {
      void queryClient.invalidateQueries({ queryKey: ORDERS_MINE_KEY });
      void queryClient.invalidateQueries({ queryKey: ["orders", order.id] });
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["support"] });
    },
  });
}

export function useOrderMessages(id: string) {
  return useQuery({
    queryKey: ["orders", id, "messages"],
    queryFn: () => OrdersApi.getInstance().listMessages(id),
    enabled: Boolean(id),
    refetchInterval: 5000,
  });
}

export function usePostOrderMessage(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => OrdersApi.getInstance().postMessage(id, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["orders", id, "messages"],
      });
      void queryClient.invalidateQueries({ queryKey: ORDERS_MINE_KEY });
    },
  });
}
