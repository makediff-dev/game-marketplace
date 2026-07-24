"use client";

import { RequireAuth } from "@/components/auth/require-auth/require-auth";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
