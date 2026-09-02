"use client";

import { create } from "zustand";
import type { CheckoutOfferType } from "@/lib/mock/checkout";
import type { SellListingType } from "@/lib/mock/sell-wizard";
import { getSellCategories } from "@/lib/mock/sell-wizard";
import {
  getDefaultVariableUnitPricing,
  isVariableUnitCategory,
  type VariableUnitPricing,
} from "@/lib/mock/variable-pricing";

export type SellWizardStep = 2 | 4 | 5 | 6;

interface SellWizardState {
  step: SellWizardStep;
  progressStep: number;
  categoryTermsOpen: boolean;
  deliveryTermsOpen: boolean;
  gameId: string | null;
  categoryId: string | null;
  deliveryMethodId: string | null;
  listingType: SellListingType | null;
  offerType: CheckoutOfferType;
  price: number;
  title: string;
  description: string;
  comment: string;
  selectedServer: string | null;
  selectedGenre: string | null;
  selectedRegion: string | null;
  variablePricing: VariableUnitPricing;
  initGame: (gameId: string) => void;
  selectCategory: (categoryId: string) => void;
  openCategoryTerms: () => void;
  closeCategoryTerms: () => void;
  acceptCategoryTerms: () => void;
  selectDeliveryMethod: (deliveryMethodId: string) => void;
  openDeliveryTerms: () => void;
  closeDeliveryTerms: () => void;
  acceptDeliveryTerms: () => void;
  selectListingType: (listingType: SellListingType) => void;
  selectOfferType: (offerType: CheckoutOfferType) => void;
  proceedFromListingType: () => void;
  goBack: () => void;
  setPrice: (price: number) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setComment: (comment: string) => void;
  setSelectedServer: (server: string | null) => void;
  setSelectedGenre: (genre: string | null) => void;
  setSelectedRegion: (region: string | null) => void;
  setVariablePricing: (pricing: Partial<VariableUnitPricing>) => void;
  reset: () => void;
}

const initialVariablePricing = getDefaultVariableUnitPricing();

const initialState = {
  step: 2 as SellWizardStep,
  progressStep: 1,
  categoryTermsOpen: false,
  deliveryTermsOpen: false,
  gameId: null,
  categoryId: null,
  deliveryMethodId: null,
  listingType: null,
  offerType: "unit" as CheckoutOfferType,
  price: 1000,
  title: "",
  description: "",
  comment: "",
  selectedServer: null,
  selectedGenre: null,
  selectedRegion: null,
  variablePricing: initialVariablePricing,
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
  selectCategory: (categoryId) => {
    const { gameId } = get();
    const categories = gameId ? getSellCategories(gameId) : [];
    const category = categories.find((item) => item.id === categoryId);
    const categoryLabel = category?.label ?? categoryId;
    const isVariableUnit = isVariableUnitCategory(categoryId, categoryLabel);

    set({
      categoryId,
      deliveryMethodId: null,
      listingType: null,
      offerType: isVariableUnit ? "variable-unit" : "unit",
      variablePricing: getDefaultVariableUnitPricing(categoryId, categoryLabel),
    });
  },
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
  selectDeliveryMethod: (deliveryMethodId) =>
    set({
      deliveryMethodId,
      listingType: null,
    }),
  openDeliveryTerms: () => set({ deliveryTermsOpen: true, progressStep: 4 }),
  closeDeliveryTerms: () => set({ deliveryTermsOpen: false, progressStep: 3 }),
  acceptDeliveryTerms: () =>
    set({
      deliveryTermsOpen: false,
      step: 5,
      progressStep: 5,
    }),
  selectListingType: (listingType) => set({ listingType }),
  selectOfferType: (offerType) => set({ offerType }),
  proceedFromListingType: () => {
    const { listingType } = get();

    if (!listingType) {
      return;
    }

    set({
      step: 6,
      progressStep: 6,
    });
  },
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
      set({ step: 5, progressStep: 5 });
      return;
    }

    if (step === 5) {
      set({ step: 4, progressStep: 3, listingType: null });
      return;
    }

    if (step === 4) {
      set({ step: 2, progressStep: 1, categoryId: null, deliveryMethodId: null, listingType: null });
    }
  },
  setPrice: (price) => set({ price }),
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setComment: (comment) => set({ comment }),
  setSelectedServer: (selectedServer) => set({ selectedServer }),
  setSelectedGenre: (selectedGenre) => set({ selectedGenre }),
  setSelectedRegion: (selectedRegion) => set({ selectedRegion }),
  setVariablePricing: (pricing) =>
    set((state) => ({
      variablePricing: {
        ...state.variablePricing,
        ...pricing,
      },
    })),
  reset: () => set(initialState),
}));
