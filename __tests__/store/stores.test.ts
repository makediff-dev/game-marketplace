import { act, renderHook } from "@testing-library/react";

import {
  useSellWizardHydrated,
  useSellWizardStore,
} from "@/store/sell-wizard.store";
import { useUserStore } from "@/store/user.store";

import { makeUser } from "../fixtures";

const wizard = () => useSellWizardStore.getState();

beforeEach(() => {
  wizard().reset();
  window.sessionStorage.clear();
});

describe("user store", () => {
  it("sets and clears the user", () => {
    const user = makeUser();

    useUserStore.getState().setUser(user);
    expect(useUserStore.getState().user).toBe(user);

    useUserStore.getState().setUser(null);
    expect(useUserStore.getState().user).toBeNull();
  });
});

describe("sell wizard store", () => {
  it("starts a new game from scratch and keeps progress for the same game", () => {
    wizard().initGame("cs2");
    wizard().setTitle("Аккаунт");
    wizard().initGame("cs2");
    expect(wizard().title).toBe("Аккаунт");

    wizard().initGame("roblox");
    expect(wizard()).toMatchObject({ gameId: "roblox", title: "", step: 2, progressStep: 1 });
  });

  it("walks forward only when a choice is made", () => {
    wizard().initGame("cs2");

    wizard().proceedFromCategory();
    expect(wizard().step).toBe(2);
    wizard().selectCategory("accounts");
    wizard().proceedFromCategory();
    expect(wizard()).toMatchObject({ step: 5, progressStep: 2 });

    wizard().proceedFromListingType();
    expect(wizard().step).toBe(5);
    wizard().selectListingType("one-time");
    wizard().proceedFromListingType();
    expect(wizard()).toMatchObject({ step: 6, progressStep: 3 });
  });

  it("drops dependent choices when an earlier one changes", () => {
    wizard().selectCategory("accounts");
    wizard().selectListingType("permanent");

    wizard().selectCategory("items");
    expect(wizard()).toMatchObject({ categoryId: "items", listingType: null });
  });

  it("goes back step by step and clears what it leaves", () => {
    wizard().initGame("cs2");
    wizard().selectCategory("accounts");
    wizard().proceedFromCategory();
    wizard().selectListingType("one-time");
    wizard().proceedFromListingType();

    wizard().goBack();
    expect(wizard()).toMatchObject({ step: 5, progressStep: 2, listingType: "one-time" });
    wizard().goBack();
    expect(wizard()).toMatchObject({ step: 2, categoryId: null, listingType: null });
    wizard().goBack();
    expect(wizard().step).toBe(2);
  });

  it("keeps at most 8 images and removes by index", () => {
    const files = Array.from({ length: 10 }, (_, i) => new File([String(i)], `${i}.png`));

    wizard().addImages(files.slice(0, 5));
    wizard().addImages(files.slice(5));
    expect(wizard().images).toHaveLength(8);

    wizard().removeImage(0);
    expect(wizard().images.map((file) => file.name)[0]).toBe("1.png");
  });

  it("stores form fields", () => {
    wizard().setPrice(250);
    wizard().setDescription("d");
    wizard().setComment("c");
    wizard().setSelectedServer("EU");
    wizard().setSelectedGenre("Шутер");
    wizard().setSelectedRegion("Россия");

    expect(wizard()).toMatchObject({
      price: 250,
      description: "d",
      comment: "c",
      selectedServer: "EU",
      selectedGenre: "Шутер",
      selectedRegion: "Россия",
    });
  });

  it("persists the draft without images in sessionStorage", () => {
    wizard().setTitle("Черновик");
    wizard().addImages([new File(["a"], "a.png")]);

    const saved = JSON.parse(window.sessionStorage.getItem("playnox-sell-wizard") ?? "{}");
    expect(saved.state.title).toBe("Черновик");
    expect(saved.state.images).toBeUndefined();
  });

  it("reports hydration", async () => {
    const { result } = renderHook(() => useSellWizardHydrated());

    await act(async () => {
      await useSellWizardStore.persist.rehydrate();
    });

    expect(result.current).toBe(true);
  });
});
