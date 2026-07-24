"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button/button";
import { Icon } from "@/components/ui/icon/icon";
import { getGameById } from "@/lib/mock/games";
import { getSellCategories } from "@/lib/mock/sell-wizard";
import { useSellWizardStore } from "@/lib/store/sell-wizard-store";
import styles from "../sell-wizard.module.css";

export function SellStepCategorySelect() {
  const gameId = useSellWizardStore((state) => state.gameId);
  const categoryId = useSellWizardStore((state) => state.categoryId);
  const selectCategory = useSellWizardStore((state) => state.selectCategory);
  const openCategoryTerms = useSellWizardStore((state) => state.openCategoryTerms);

  if (!gameId) {
    return null;
  }

  const game = getGameById(gameId);
  const categories = getSellCategories(gameId);

  if (!game) {
    return null;
  }

  const handleNext = () => {
    if (!categoryId) {
      return;
    }

    openCategoryTerms();
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
        </div>
      </div>

      <div className={styles.list} role="list">
        {categories.map((category) => {
          const isActive = categoryId === category.id;

          return (
            <button
              key={category.id}
              type="button"
              className={styles.listItem}
              onClick={() => selectCategory(category.id)}
              aria-pressed={isActive}
            >
              <div className={styles.listItemContent}>
                <div className={styles.listItemTitleRow}>
                  <span className={styles.listItemTitle}>{category.label}</span>
                  {category.hasDiscount ? (
                    <span className={styles.discountBadge}>10%</span>
                  ) : null}
                </div>
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
          disabled={!categoryId}
          onClick={handleNext}
        >
          Далее
        </Button>
      </div>
    </div>
  );
}
