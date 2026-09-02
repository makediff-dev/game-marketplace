"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button/button";
import { Icon } from "@/components/ui/icon/icon";
import { getGameById } from "@/lib/mock/games";
import { getDeliveryMethods, getSellCategories, sellListingTypes } from "@/lib/mock/sell-wizard";
import { useSellWizardStore } from "@/lib/store/sell-wizard-store";
import styles from "../sell-wizard.module.css";

export function SellStepListingType() {
  const gameId = useSellWizardStore((state) => state.gameId);
  const categoryId = useSellWizardStore((state) => state.categoryId);
  const deliveryMethodId = useSellWizardStore((state) => state.deliveryMethodId);
  const listingType = useSellWizardStore((state) => state.listingType);
  const selectListingType = useSellWizardStore((state) => state.selectListingType);
  const proceedFromListingType = useSellWizardStore((state) => state.proceedFromListingType);

  if (!gameId || !categoryId || !deliveryMethodId) {
    return null;
  }

  const game = getGameById(gameId);
  const categories = getSellCategories(gameId);
  const category = categories.find((item) => item.id === categoryId);
  const deliveryMethods = getDeliveryMethods(gameId, categoryId);
  const deliveryMethod = deliveryMethods.find((method) => method.id === deliveryMethodId);

  if (!game || !category || !deliveryMethod) {
    return null;
  }

  const handleNext = () => {
    if (!listingType) {
      return;
    }

    proceedFromListingType();
  };

  return (
    <div className={styles.content}>
      <div className={styles.contextHeader}>
        <Image
          src={game.logo}
          alt={game.name}
          width={40}
          height={40}
          className={styles.contextIcon}
        />
        <div className={styles.contextInfo}>
          <span className={styles.contextGame}>{game.name}</span>
          <span className={styles.contextCategory}>
            {category.label} · {deliveryMethod.label}
          </span>
        </div>
      </div>

      <div className={styles.list} role="list">
        {sellListingTypes.map((option) => {
          const isActive = listingType === option.id;

          return (
            <button
              key={option.id}
              type="button"
              className={styles.listItem}
              onClick={() => selectListingType(option.id)}
              aria-pressed={isActive}
            >
              <div className={styles.listItemContent}>
                <span className={styles.listItemTitle}>{option.label}</span>
                <span className={styles.listItemDescription}>{option.description}</span>
              </div>
              <span
                className={`${styles.listItemIndicator} ${
                  isActive ? styles.listItemIndicatorActive : ""
                }`}
                aria-hidden
              >
                {isActive ? (
                  <Icon
                    src="/assets/checkmark-white.svg"
                    width={14}
                    height={10}
                    className={styles.checkIcon}
                  />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className={styles.footerAction}>
        <Button
          type="button"
          variant="gradient"
          fullWidth
          large
          disabled={!listingType}
          onClick={handleNext}
        >
          Далее
        </Button>
      </div>
    </div>
  );
}
