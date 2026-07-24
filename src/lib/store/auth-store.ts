"use client";

import { create } from "zustand";

const AUTH_STORAGE_KEY = "playnox-authenticated";
const SELLER_TERMS_STORAGE_KEY = "playnox-seller-terms-accepted";

interface AuthState {
  isAuthenticated: boolean;
  sellerTermsAccepted: boolean;
  hydrated: boolean;
  hydrate: () => void;
  login: () => void;
  logout: () => void;
  acceptSellerTerms: () => void;
}

function readAuthFromStorage() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY) === "1";
}

function readSellerTermsFromStorage() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(SELLER_TERMS_STORAGE_KEY) === "1";
}

export { readAuthFromStorage };

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  sellerTermsAccepted: false,
  hydrated: false,
  hydrate: () => {
    const isAuthenticated = readAuthFromStorage();

    set({
      isAuthenticated,
      sellerTermsAccepted: isAuthenticated && readSellerTermsFromStorage(),
      hydrated: true,
    });
  },
  login: () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(AUTH_STORAGE_KEY, "1");
    }

    set({
      isAuthenticated: true,
      sellerTermsAccepted: readSellerTermsFromStorage(),
      hydrated: true,
    });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      window.localStorage.removeItem(SELLER_TERMS_STORAGE_KEY);
    }

    set({ isAuthenticated: false, sellerTermsAccepted: false, hydrated: true });
  },
  acceptSellerTerms: () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SELLER_TERMS_STORAGE_KEY, "1");
    }

    set({ sellerTermsAccepted: true });
  },
}));
