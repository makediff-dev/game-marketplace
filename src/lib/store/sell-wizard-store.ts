"use client";

import { create } from "zustand";

export type SellWizardStep = 2 | 4 | 6;

interface SellWizardState {
  step: SellWizardStep;
  progressStep: number;
  categoryTermsOpen: boolean;
  deliveryTermsOpen: boolean;
  gameId: string | null;
  categoryId: string | null;
  deliveryMethodId: string | null;
  price: number;
  title: string;
  description: string;
  comment: string;
  selectedServer: string | null;
  selectedGenre: string | null;
  selectedRegion: string | null;
  initGame: (gameId: string) => void;
  selectCategory: (categoryId: string) => void;
  openCategoryTerms: () => void;
  closeCategoryTerms: () => void;
  acceptCategoryTerms: () => void;
  selectDeliveryMethod: (deliveryMethodId: string) => void;
  openDeliveryTerms: () => void;
  closeDeliveryTerms: () => void;
  acceptDeliveryTerms: () => void;
  goBack: () => void;
  setPrice: (price: number) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setComment: (comment: string) => void;
  setSelectedServer: (server: string | null) => void;
  setSelectedGenre: (genre: string | null) => void;
  setSelectedRegion: (region: string | null) => void;
  reset: () => void;
}

const initialState = {
  step: 2 as SellWizardStep,
  progressStep: 1,
  categoryTermsOpen: false,
  deliveryTermsOpen: false,
  gameId: null,
  categoryId: null,
  deliveryMethodId: null,
  price: 1000,
  title: "",
  description: "",
  comment: "",
  selectedServer: null,
  selectedGenre: null,
  selectedRegion: null,
};

export const useSellWizardStore = create<SellWizardState>((set, get) => ({
  ...initialState,
  initGame: (gameId) =>
    set({
      ...initialState,
      gameId,
      step: 2,
      progressStep: 1,
    }),
  selectCategory: (categoryId) =>
    set({
      categoryId,
      deliveryMethodId: null,
    }),
  openCategoryTerms: () => {
    const { categoryId } = get();

    if (!categoryId) {
      return;
    }

    set({ categoryTermsOpen: true, progressStep: 2 });
  },
  closeCategoryTerms: () => set({ categoryTermsOpen: false, progressStep: 1 }),
  acceptCategoryTerms: () =>
    set({
      categoryTermsOpen: false,
      step: 4,
      progressStep: 3,
    }),
  selectDeliveryMethod: (deliveryMethodId) => set({ deliveryMethodId }),
  openDeliveryTerms: () => set({ deliveryTermsOpen: true, progressStep: 4 }),
  closeDeliveryTerms: () => set({ deliveryTermsOpen: false, progressStep: 3 }),
  acceptDeliveryTerms: () =>
    set({
      deliveryTermsOpen: false,
      step: 6,
      progressStep: 5,
    }),
  goBack: () => {
    const { step, categoryTermsOpen, deliveryTermsOpen } = get();

    if (deliveryTermsOpen) {
      set({ deliveryTermsOpen: false, progressStep: 3 });
      return;
    }

    if (categoryTermsOpen) {
      set({ categoryTermsOpen: false, progressStep: 1 });
      return;
    }

    if (step === 6) {
      set({ step: 4, progressStep: 3, deliveryMethodId: null });
      return;
    }

    if (step === 4) {
      set({ step: 2, progressStep: 1, categoryId: null, deliveryMethodId: null });
    }
  },
  setPrice: (price) => set({ price }),
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setComment: (comment) => set({ comment }),
  setSelectedServer: (selectedServer) => set({ selectedServer }),
  setSelectedGenre: (selectedGenre) => set({ selectedGenre }),
  setSelectedRegion: (selectedRegion) => set({ selectedRegion }),
  reset: () => set(initialState),
}));
