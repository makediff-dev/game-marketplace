"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { AuthenticatedNavbar } from "@/components/layout/authenticated-navbar/authenticated-navbar";
import { Navbar, type NavbarProps } from "@/components/layout/navbar/navbar";

export function AppNavbar(props: NavbarProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrated = useAuthStore((state) => state.hydrated);

  if (isAuthenticated && hydrated) {
    return <AuthenticatedNavbar />;
  }

  return <Navbar {...props} />;
}
