"use client";

import { create } from "zustand";

export type DealCancelledBy = "buyer" | "seller";

export interface DealRuntimeState {
  deadlineAt: number;
  sellerOnline: boolean;
  isCancelled: boolean;
  isClosedEarly?: boolean;
  isCompleted?: boolean;
  expiredModalAcknowledged?: boolean;
  cancelledBy?: DealCancelledBy;
}

interface InitDealOptions {
  durationMs: number;
  sellerOnline: boolean;
  forceRestart?: boolean;
}

interface PersistedDealState {
  activeDealId: string | null;
  deals: Record<string, DealRuntimeState>;
}

interface DealStoreState extends PersistedDealState {
  hydrated: boolean;
  hydrate: () => void;
  initDeal: (orderId: string, options: InitDealOptions) => void;
  setActiveDeal: (orderId: string) => void;
  clearActiveDeal: () => void;
  cancelDeal: (orderId: string, cancelledBy: DealCancelledBy) => void;
  closeDealEarly: (orderId: string) => void;
  completeDeal: (orderId: string) => void;
  acknowledgeDealExpired: (orderId: string) => void;
  dismissExpiredDealTimer: (orderId: string) => void;
  setSellerOnline: (orderId: string, sellerOnline: boolean) => void;
  getDealRuntime: (orderId: string) => DealRuntimeState | undefined;
}

const DEAL_STORAGE_KEY = "playnox-deal-state";

function readPersistedState(): PersistedDealState {
  if (typeof window === "undefined") {
    return { activeDealId: null, deals: {} };
  }

  try {
    const raw = window.sessionStorage.getItem(DEAL_STORAGE_KEY);

    if (!raw) {
      return { activeDealId: null, deals: {} };
    }

    const parsed = JSON.parse(raw) as PersistedDealState;

    return {
      activeDealId: parsed.activeDealId ?? null,
      deals: parsed.deals ?? {},
    };
  } catch {
    return { activeDealId: null, deals: {} };
  }
}

function persistState(state: PersistedDealState) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(DEAL_STORAGE_KEY, JSON.stringify(state));
}

function resolveActiveDealId(state: PersistedDealState): string | null {
  if (state.activeDealId) {
    const activeRuntime = state.deals[state.activeDealId];

    if (activeRuntime && !activeRuntime.isCancelled && !activeRuntime.isCompleted) {
      return state.activeDealId;
    }
  }

  for (const [orderId, runtime] of Object.entries(state.deals)) {
    if (!runtime.isCancelled && !runtime.isCompleted) {
      return orderId;
    }
  }

  return null;
}

export const useDealStore = create<DealStoreState>((set, get) => ({
  activeDealId: null,
  deals: {},
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) {
      return;
    }

    const persisted = readPersistedState();
    const activeDealId = resolveActiveDealId(persisted);
    const nextState = { ...persisted, activeDealId, hydrated: true };

    set(nextState);

    if (activeDealId !== persisted.activeDealId) {
      persistState({ activeDealId, deals: persisted.deals });
    }
  },
  initDeal: (orderId, options) => {
    const currentDeals = get().deals;
    const existing = currentDeals[orderId];

    if (existing && !options.forceRestart) {
      const isInactive = existing.isCancelled || existing.isCompleted;

      const nextState = {
        activeDealId: isInactive ? null : orderId,
        deals: currentDeals,
      };

      set(nextState);
      persistState(nextState);
      return;
    }

    const nextDeals = {
      ...currentDeals,
      [orderId]: {
        deadlineAt: Date.now() + options.durationMs,
        sellerOnline: options.sellerOnline,
        isCancelled: false,
        isClosedEarly: false,
        isCompleted: false,
        expiredModalAcknowledged: false,
      },
    };

    const nextState = {
      activeDealId: orderId,
      deals: nextDeals,
    };

    set(nextState);
    persistState(nextState);
  },
  setActiveDeal: (orderId) => {
    if (get().activeDealId === orderId) {
      return;
    }

    const nextState = {
      activeDealId: orderId,
      deals: get().deals,
    };

    set(nextState);
    persistState(nextState);
  },
  clearActiveDeal: () => {
    if (!get().activeDealId) {
      return;
    }

    const nextState = {
      activeDealId: null,
      deals: get().deals,
    };

    set(nextState);
    persistState(nextState);
  },
  cancelDeal: (orderId, cancelledBy) => {
    const current = get().deals[orderId];

    if (!current) {
      return;
    }

    const nextState = {
      activeDealId: null,
      deals: {
        ...get().deals,
        [orderId]: {
          ...current,
          isCancelled: true,
          cancelledBy,
        },
      },
    };

    set(nextState);
    persistState(nextState);
  },
  closeDealEarly: (orderId) => {
    const current = get().deals[orderId];

    if (!current || current.isCancelled || current.isClosedEarly) {
      return;
    }

    const nextState = {
      activeDealId: orderId,
      deals: {
        ...get().deals,
        [orderId]: {
          ...current,
          isClosedEarly: true,
        },
      },
    };

    set(nextState);
    persistState(nextState);
  },
  completeDeal: (orderId) => {
    const current = get().deals[orderId];

    if (!current || current.isCancelled || current.isCompleted) {
      return;
    }

    const nextState = {
      activeDealId: null,
      deals: {
        ...get().deals,
        [orderId]: {
          ...current,
          isCompleted: true,
        },
      },
    };

    set(nextState);
    persistState(nextState);
  },
  acknowledgeDealExpired: (orderId) => {
    const current = get().deals[orderId];

    if (!current || current.expiredModalAcknowledged) {
      return;
    }

    const nextState = {
      activeDealId: get().activeDealId,
      deals: {
        ...get().deals,
        [orderId]: {
          ...current,
          expiredModalAcknowledged: true,
        },
      },
    };

    set(nextState);
    persistState(nextState);
  },
  dismissExpiredDealTimer: (orderId) => {
    const current = get().deals[orderId];

    if (!current) {
      get().acknowledgeDealExpired(orderId);
      return;
    }

    const nextState = {
      activeDealId: get().activeDealId,
      deals: {
        ...get().deals,
        [orderId]: {
          ...current,
          expiredModalAcknowledged: true,
        },
      },
    };

    set(nextState);
    persistState(nextState);
  },
  setSellerOnline: (orderId, sellerOnline) => {
    const current = get().deals[orderId];

    if (!current) {
      return;
    }

    const nextState = {
      activeDealId: get().activeDealId,
      deals: {
        ...get().deals,
        [orderId]: {
          ...current,
          sellerOnline,
        },
      },
    };

    set(nextState);
    persistState(nextState);
  },
  getDealRuntime: (orderId) => get().deals[orderId],
}));
