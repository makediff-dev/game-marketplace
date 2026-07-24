"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AppIconLabel } from "@/components/ui/app-icon-label/app-icon-label";
import type { GameGroup } from "@/lib/mock/games";
import {
  getSellWizardAppGrid,
  SELL_WIZARD_MAX_VISIBLE,
} from "@/lib/mock/sell-wizard";
import styles from "./seller-app-grid.module.css";

const INITIAL_VISIBLE = 30;
const LOAD_MORE_COUNT = 10;

interface SellerAppGridProps {
  group: GameGroup;
  onSelect: (gameId: string) => void;
}

export function SellerAppGrid({ group, onSelect }: SellerAppGridProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const items = useMemo(
    () => getSellWizardAppGrid(group, visibleCount),
    [group, visibleCount],
  );

  const hasMore = visibleCount < SELL_WIZARD_MAX_VISIBLE;

  return (
    <>
      <div className={styles.grid} aria-label="Игры и приложения">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={styles.item}
            onClick={() => onSelect(item.gameId)}
          >
            <div className={styles.iconWrapper}>
              <Image
                src={item.image}
                alt={item.name}
                width={80}
                height={80}
                className={styles.icon}
              />
            </div>
            {item.badge ? (
              <span
                className={`${styles.badge} ${item.badge === "👀" ? styles.badgeEmoji : ""}`}
              >
                {item.badge}
              </span>
            ) : null}
            <AppIconLabel name={item.name} />
          </button>
        ))}
      </div>

      {hasMore ? (
        <button
          type="button"
          className={styles.loadMore}
          onClick={() => setVisibleCount((count) => count + LOAD_MORE_COUNT)}
        >
          Показать еще
        </button>
      ) : null}
    </>
  );
}
