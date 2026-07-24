"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

interface GuestOnlyRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function GuestOnlyRoute({ children, redirectTo = "/profile" }: GuestOnlyRouteProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrated = useAuthStore((state) => state.hydrated);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [hydrated, isAuthenticated, redirectTo, router]);

  if (!hydrated || isAuthenticated) {
    return null;
  }

  return children;
}
