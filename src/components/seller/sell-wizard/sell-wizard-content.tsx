"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getGameById } from "@/lib/mock/games";
import { getCategoryTerms, getDeliveryTerms } from "@/lib/mock/sell-wizard";
import { useSellWizardStore } from "@/lib/store/sell-wizard-store";
import { SellWizardHeader } from "./sell-wizard-header";
import { SellWizardProgress } from "./sell-wizard-progress";
import { SellWizardTermsModal } from "./sell-wizard-terms-modal";
import { SellStepCategorySelect } from "./steps/sell-step-category-select";
import { SellStepDeliveryMethod } from "./steps/sell-step-delivery-method";
import { SellStepProductForm } from "./steps/sell-step-product-form";
import styles from "./sell-wizard.module.css";

const STEP_TITLES = {
  2: "Выберите категорию",
  4: "Способ передачи",
  6: "Страница товара",
} as const;

export function SellWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameParam = searchParams.get("game");

  const step = useSellWizardStore((state) => state.step);
  const progressStep = useSellWizardStore((state) => state.progressStep);
  const gameId = useSellWizardStore((state) => state.gameId);
  const categoryId = useSellWizardStore((state) => state.categoryId);
  const deliveryMethodId = useSellWizardStore((state) => state.deliveryMethodId);
  const categoryTermsOpen = useSellWizardStore((state) => state.categoryTermsOpen);
  const deliveryTermsOpen = useSellWizardStore((state) => state.deliveryTermsOpen);
  const initGame = useSellWizardStore((state) => state.initGame);
  const closeCategoryTerms = useSellWizardStore((state) => state.closeCategoryTerms);
  const acceptCategoryTerms = useSellWizardStore((state) => state.acceptCategoryTerms);
  const closeDeliveryTerms = useSellWizardStore((state) => state.closeDeliveryTerms);
  const acceptDeliveryTerms = useSellWizardStore((state) => state.acceptDeliveryTerms);
  const goBack = useSellWizardStore((state) => state.goBack);
  const reset = useSellWizardStore((state) => state.reset);

  useEffect(() => {
    if (!gameParam || !getGameById(gameParam)) {
      router.replace("/sell");
      return;
    }

    initGame(gameParam);
  }, [gameParam, initGame, router]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  if (!gameId) {
    return null;
  }

  const categoryTerms =
    gameId && categoryId ? getCategoryTerms(gameId, categoryId) : null;
  const deliveryTerms =
    gameId && categoryId && deliveryMethodId
      ? getDeliveryTerms(gameId, categoryId, deliveryMethodId)
      : null;

  const handleBack = () => {
    if (step === 2 && !categoryTermsOpen) {
      router.push("/sell");
      return;
    }

    goBack();
  };

  return (
    <div className={styles.wizard}>
      <SellWizardHeader title={STEP_TITLES[step]} showBack onBack={handleBack} />

      <SellWizardProgress currentStep={progressStep} />

      {step === 2 ? <SellStepCategorySelect /> : null}
      {step === 4 ? <SellStepDeliveryMethod /> : null}
      {step === 6 ? <SellStepProductForm /> : null}

      {categoryTerms ? (
        <SellWizardTermsModal
          isOpen={categoryTermsOpen}
          title="Условия категории"
          terms={categoryTerms}
          onClose={closeCategoryTerms}
          onAccept={acceptCategoryTerms}
        />
      ) : null}

      {deliveryTerms ? (
        <SellWizardTermsModal
          isOpen={deliveryTermsOpen}
          title="Условия способа передачи"
          terms={deliveryTerms}
          onClose={closeDeliveryTerms}
          onAccept={acceptDeliveryTerms}
        />
      ) : null}
    </div>
  );
}
