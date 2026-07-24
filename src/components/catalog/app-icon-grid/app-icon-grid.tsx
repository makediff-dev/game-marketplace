"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppIconLabel } from "@/components/ui/app-icon-label/app-icon-label";
import { ArrowButton } from "@/components/ui/arrow-button/arrow-button";
import { categories } from "@/lib/mock/categories";
import styles from "./app-icon-grid.module.css";

const VISIBLE_ITEMS = 10;
const ITEM_WIDTH = 80;
const ARROW_SIZE = 48;

export function AppIconGrid() {
  const gridRef = useRef<HTMLElement>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [gridWidth, setGridWidth] = useState(0);

  const hasOverflow = categories.length > VISIBLE_ITEMS;
  const maxStartIndex = Math.max(0, categories.length - VISIBLE_ITEMS);
  const canScrollLeft = hasOverflow && startIndex > 0;
  const canScrollRight = hasOverflow && startIndex < maxStartIndex;

  const visibleSlotCount = hasOverflow ? VISIBLE_ITEMS : categories.length;
  const itemGap =
    gridWidth > 0 && visibleSlotCount > 1
      ? Math.max(0, (gridWidth - visibleSlotCount * ITEM_WIDTH) / (visibleSlotCount - 1))
      : 0;
  const stepSize = ITEM_WIDTH + itemGap;
  const lastVisibleIconLeft = (VISIBLE_ITEMS - 1) * stepSize;
  const arrowLeftPosition = ITEM_WIDTH - ARROW_SIZE / 2 - ARROW_SIZE;
  const arrowRightPosition = lastVisibleIconLeft + ITEM_WIDTH - ARROW_SIZE / 2;

  const measureGrid = useCallback(() => {
    if (!gridRef.current) {
      return;
    }

    setGridWidth(gridRef.current.clientWidth);
  }, []);

  useEffect(() => {
    measureGrid();

    const grid = gridRef.current;
    if (!grid) {
      return;
    }

    const resizeObserver = new ResizeObserver(measureGrid);
    resizeObserver.observe(grid);
    window.addEventListener("resize", measureGrid);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureGrid);
    };
  }, [measureGrid]);

  useEffect(() => {
    setStartIndex((current) => Math.min(current, maxStartIndex));
  }, [maxStartIndex]);

  const scrollBy = (direction: "left" | "right") => {
    setStartIndex((current) => {
      if (direction === "right") {
        return Math.min(current + 1, maxStartIndex);
      }

      return Math.max(current - 1, 0);
    });
  };

  return (
    <section ref={gridRef} className={`contentBlock ${styles.grid}`} aria-label="Категории игр">
      <div className={styles.viewport}>
        <div
          className={styles.track}
          style={{
            gap: `${itemGap}px`,
            transform: `translateX(-${startIndex * stepSize}px)`,
          }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={
                category.id === "steam" || category.id === "cs2"
                  ? "/categories/counter-strike-2"
                  : `/categories?game=${category.id}`
              }
              className={styles.item}
            >
              <div className={styles.iconWrapper}>
                <Image
                  src={category.image}
                  alt={category.name}
                  width={80}
                  height={80}
                  className={styles.icon}
                />
              </div>
              {category.badge ? (
                <span
                  className={`${styles.badge} ${category.badge === "👀" ? styles.badgeEmoji : ""}`}
                >
                  {category.badge}
                </span>
              ) : null}
              <AppIconLabel name={category.name} />
            </Link>
          ))}
        </div>
      </div>
      {canScrollLeft ? (
        <div className={styles.arrowLeft} style={{ left: `${arrowLeftPosition}px` }}>
          <ArrowButton
            direction="left"
            onClick={() => scrollBy("left")}
            ariaLabel="Прокрутить категории назад"
          />
        </div>
      ) : null}
      {canScrollRight ? (
        <div className={styles.arrowRight} style={{ left: `${arrowRightPosition}px` }}>
          <ArrowButton
            direction="right"
            onClick={() => scrollBy("right")}
            ariaLabel="Прокрутить категории вперёд"
          />
        </div>
      ) : null}
    </section>
  );
}
