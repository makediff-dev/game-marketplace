"use client";

import { create } from "zustand";

export type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "playnox-theme";

interface ThemeState {
  theme: ThemeMode;
  hydrated: boolean;
  hydrate: () => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

function readThemeFromStorage(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  hydrated: false,
  hydrate: () => {
    const theme = readThemeFromStorage();
    applyTheme(theme);
    set({ theme, hydrated: true });
  },
  toggleTheme: () => {
    const nextTheme: ThemeMode = get().theme === "light" ? "dark" : "light";

    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    }

    applyTheme(nextTheme);
    set({ theme: nextTheme, hydrated: true });
  },
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }

    applyTheme(theme);
    set({ theme, hydrated: true });
  },
}));
