"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SupportApi } from "@/api/support.api";
import type { TNewSupportTicket } from "@/types/support";

export const SUPPORT_TOPICS_KEY = ["support", "topics"] as const;
export const SUPPORT_TICKETS_KEY = ["support", "tickets"] as const;

export const supportMessagesKey = (ticketId: number) =>
  ["support", "tickets", ticketId, "messages"] as const;

const POLL_MS = 3000;
const LIST_POLL_MS = 15000;

export function useSupportTopics(enabled = true) {
  return useQuery({
    queryKey: SUPPORT_TOPICS_KEY,
    queryFn: () => SupportApi.getInstance().listTopics(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/** Polls faster while the support pane is open. */
export function useSupportTickets(enabled = true, active = false) {
  return useQuery({
    queryKey: SUPPORT_TICKETS_KEY,
    queryFn: () => SupportApi.getInstance().listTickets(),
    enabled,
    staleTime: 0,
    refetchInterval: enabled ? (active ? POLL_MS : LIST_POLL_MS) : false,
    refetchIntervalInBackground: false,
  });
}

export function useSupportMessages(ticketId: number | null) {
  return useQuery({
    queryKey: supportMessagesKey(ticketId ?? 0),
    queryFn: () => SupportApi.getInstance().listMessages(ticketId as number),
    enabled: ticketId != null,
    staleTime: 0,
    refetchInterval: ticketId != null ? POLL_MS : false,
    refetchIntervalInBackground: false,
    refetchOnMount: "always",
  });
}

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticket: TNewSupportTicket) =>
      SupportApi.getInstance().createTicket(ticket),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUPPORT_TICKETS_KEY });
    },
  });
}

export function usePostSupportMessage(ticketId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) =>
      SupportApi.getInstance().postMessage(ticketId, text),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: supportMessagesKey(ticketId),
      });
      void queryClient.invalidateQueries({ queryKey: SUPPORT_TICKETS_KEY });
    },
  });
}

export function useCloseSupportTicket(ticketId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => SupportApi.getInstance().closeTicket(ticketId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SUPPORT_TICKETS_KEY });
    },
  });
}
