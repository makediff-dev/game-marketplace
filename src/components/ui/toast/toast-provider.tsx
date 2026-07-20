"use client";

import { useEffect } from "react";
import { useToastStore } from "@/lib/store/toast-store";
import styles from "./toast.module.css";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const message = useToastStore((state) => state.message);
  const hide = useToastStore((state) => state.hide);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(hide, 3000);
    return () => clearTimeout(timer);
  }, [message, hide]);

  return (
    <>
      {children}
      {message ? (
        <div className={styles.toast} role="status" aria-live="polite">
          {message}
        </div>
      ) : null}
    </>
  );
}
