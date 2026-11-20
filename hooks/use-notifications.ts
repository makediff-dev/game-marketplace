"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  NotificationsApi,
  type TNotificationSetting,
} from "@/api/notifications.api";

export const NOTIFICATIONS_KEY = ["notifications"] as const;
export const NOTIFICATION_SETTINGS_KEY = ["notifications", "settings"] as const;

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: () => NotificationsApi.getInstance().list(),
    enabled,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids?: string[]) =>
      NotificationsApi.getInstance().markRead(ids),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: NOTIFICATION_SETTINGS_KEY,
    queryFn: () => NotificationsApi.getInstance().getSettings(),
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailMuted: string[]) =>
      NotificationsApi.getInstance().updateSettings(emailMuted),
    // The switch moves at once; a failed save puts it back.
    onMutate: async (emailMuted) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_SETTINGS_KEY });
      const previous = queryClient.getQueryData<TNotificationSetting[]>(
        NOTIFICATION_SETTINGS_KEY,
      );

      queryClient.setQueryData<TNotificationSetting[]>(
        NOTIFICATION_SETTINGS_KEY,
        previous?.map((item) => ({
          ...item,
          email: item.critical || !emailMuted.includes(item.type),
        })),
      );
      return { previous };
    },
    onError: (_error, _muted, context) => {
      queryClient.setQueryData(NOTIFICATION_SETTINGS_KEY, context?.previous);
    },
    onSuccess: (types) => {
      queryClient.setQueryData(NOTIFICATION_SETTINGS_KEY, types);
    },
  });
}
