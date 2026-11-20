"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { TListingType } from "@/lib/sell-wizard";

type TSellWizardPersisted = {
  step: number;
  progressStep: number;
  gameId: string | null;
  categoryId: string | null;
  listingType: TListingType["id"] | null;
  price: number;
  title: string;
  description: string;
  comment: string;
  deliveryInstruction: string;
  selectedServer: string | null;
  selectedGenre: string | null;
  selectedRegion: string | null;
};

type TSellWizardState = TSellWizardPersisted & {
  images: File[];
  initGame: (gameId: string) => void;
  selectCategory: (categoryId: string) => void;
  proceedFromCategory: () => void;
  selectListingType: (listingType: TListingType["id"]) => void;
  proceedFromListingType: () => void;
  goBack: () => void;
  setPrice: (price: number) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setComment: (comment: string) => void;
  setDeliveryInstruction: (deliveryInstruction: string) => void;
  setSelectedServer: (value: string | null) => void;
  setSelectedGenre: (value: string | null) => void;
  setSelectedRegion: (value: string | null) => void;
  addImages: (files: File[]) => void;
  removeImage: (index: number) => void;
  reset: () => void;
};

const initialPersisted: TSellWizardPersisted = {
  step: 2,
  progressStep: 1,
  gameId: null,
  categoryId: null,
  listingType: null,
  price: 1000,
  title: "",
  description: "",
  comment: "",
  deliveryInstruction: "",
  selectedServer: null,
  selectedGenre: null,
  selectedRegion: null,
};

const initialState = {
  ...initialPersisted,
  images: [] as File[],
};

export const useSellWizardStore = create<TSellWizardState>()(
  persist(
    (set, get) => ({
      ...initialState,
      initGame: (gameId) => {
        const current = get();

        // Same game — keep progress (reload / revisit).
        if (current.gameId === gameId) {
          return;
        }

        set({
          ...initialState,
          gameId,
          step: 2,
          progressStep: 1,
        });
      },
      selectCategory: (categoryId) =>
        set({
          categoryId,
          listingType: null,
        }),
      proceedFromCategory: () => {
        const { categoryId } = get();
        if (categoryId) {
          set({ step: 5, progressStep: 2 });
        }
      },
      selectListingType: (listingType) => set({ listingType }),
      proceedFromListingType: () => {
        const { listingType } = get();
        if (listingType) {
          set({ step: 6, progressStep: 3 });
        }
      },
      goBack: () => {
        const { step } = get();

        if (step === 6) {
          set({ step: 5, progressStep: 2 });
          return;
        }

        if (step === 5) {
          set({
            step: 2,
            progressStep: 1,
            categoryId: null,
            listingType: null,
          });
        }
      },
      setPrice: (price) => set({ price }),
      setTitle: (title) => set({ title }),
      setDescription: (description) => set({ description }),
      setComment: (comment) => set({ comment }),
      setDeliveryInstruction: (deliveryInstruction) =>
        set({ deliveryInstruction }),
      setSelectedServer: (selectedServer) => set({ selectedServer }),
      setSelectedGenre: (selectedGenre) => set({ selectedGenre }),
      setSelectedRegion: (selectedRegion) => set({ selectedRegion }),
      addImages: (files) =>
        set((state) => ({
          images: [...state.images, ...files].slice(0, 8),
        })),
      removeImage: (index) =>
        set((state) => ({
          images: state.images.filter((_, current) => current !== index),
        })),
      reset: () => set(initialState),
    }),
    {
      name: "playnox-sell-wizard",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state): TSellWizardPersisted => ({
        step: state.step,
        progressStep: state.progressStep,
        gameId: state.gameId,
        categoryId: state.categoryId,
        listingType: state.listingType,
        price: state.price,
        title: state.title,
        description: state.description,
        comment: state.comment,
        deliveryInstruction: state.deliveryInstruction,
        selectedServer: state.selectedServer,
        selectedGenre: state.selectedGenre,
        selectedRegion: state.selectedRegion,
      }),
    },
  ),
);

export function useSellWizardHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(useSellWizardStore.persist.hasHydrated());
    return useSellWizardStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}
