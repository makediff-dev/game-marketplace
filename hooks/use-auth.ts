"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AuthApi } from "@/api/auth.api";
import { useUserStore } from "@/store/user.store";
import type { TCredentials, TUser } from "@/types/auth";

export const CURRENT_USER_KEY = ["current-user"];

function getAuthReturnUrl(): string {
  if (typeof window === "undefined") {
    return "/profile";
  }

  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get("returnUrl") ?? params.get("from");

  if (!returnUrl || !returnUrl.startsWith("/") || returnUrl.startsWith("//")) {
    return "/profile";
  }

  return returnUrl;
}

function redirectAfterAuth(router: ReturnType<typeof useRouter>) {
  router.replace(getAuthReturnUrl());
  router.refresh();
}

export function useCurrentUser(initialUser?: TUser | null) {
  const setUser = useUserStore((state) => state.setUser);

  const query = useQuery<TUser | null>({
    queryKey: CURRENT_USER_KEY,
    queryFn: async () => {
      try {
        return await AuthApi.getInstance().getProfile();
      } catch {
        return null;
      }
    },
    initialData: initialUser === undefined ? undefined : initialUser,
    staleTime: 60_000,
    retry: false,
  });

  useEffect(() => {
    setUser(query.data ?? null);
  }, [query.data, setUser]);

  return query;
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: (body: TCredentials) => AuthApi.getInstance().register(body),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(CURRENT_USER_KEY, user);
      redirectAfterAuth(router);
    },
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: (body: TCredentials) => AuthApi.getInstance().login(body),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(CURRENT_USER_KEY, user);
      redirectAfterAuth(router);
    },
  });
}

export function useRequestEmailCode() {
  return useMutation({
    mutationFn: (email: string) =>
      AuthApi.getInstance().requestEmailCode(email),
  });
}

export function useVerifyEmailCode() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: (body: { email: string; code: string }) =>
      AuthApi.getInstance().verifyEmailCode(body.email, body.code),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(CURRENT_USER_KEY, user);
      redirectAfterAuth(router);
    },
  });
}

export function useVkLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: (accessToken: string) =>
      AuthApi.getInstance().loginWithVk(accessToken),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(CURRENT_USER_KEY, user);
      redirectAfterAuth(router);
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: (file: File) => AuthApi.getInstance().uploadAvatar(file),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(CURRENT_USER_KEY, user);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: (username: string) =>
      AuthApi.getInstance().updateProfile(username),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(CURRENT_USER_KEY, user);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: () => AuthApi.getInstance().logout(),
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
  });
}
