import type { ReactNode } from "react";

// Personal pages: never let a shared cache (proxy, browser VPN) keep them.
export const dynamic = "force-dynamic";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
