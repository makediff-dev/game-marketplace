import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import styles from "@/styles/site-shell.module.scss";

interface SiteShellProps {
  children: ReactNode;
}

export function SiteShell({ children }: SiteShellProps) {
  return (
    <div className={styles["site-shell"]}>
      <SiteHeader />
      <div className={styles["site-shell__column"]}>
        <main className={styles["site-shell__main"]}>{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}
