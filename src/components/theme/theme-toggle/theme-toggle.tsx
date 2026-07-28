"use client";

import { useThemeStore } from "@/lib/store/theme-store";
import styles from "./theme-toggle.module.css";

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
      className={styles.toggle}
      onClick={toggleTheme}
    >
      <span className={styles.track}>
        <span className={styles.thumb} aria-hidden>
          {isDark ? (
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
              <path
                d="M21 14.5A7.5 7.5 0 0 1 9.5 3 6.5 6.5 0 1 0 21 14.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
              <path
                d="M12 2.5V5M12 19V21.5M4.22 4.22L6.04 6.04M17.96 17.96L19.78 19.78M2.5 12H5M19 12H21.5M4.22 19.78L6.04 17.96M17.96 6.04L19.78 4.22"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      </span>
    </button>
  );
}
