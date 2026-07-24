"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon/icon";
import { ArrowButton } from "@/components/ui/arrow-button/arrow-button";
import type { SellerCategory } from "@/lib/mock/seller";
import styles from "./seller-category-bar.module.css";

interface SellerCategoryBarProps {
  categories: SellerCategory[];
}

export function SellerCategoryBar({ categories }: SellerCategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    setCanScrollLeft(element.scrollLeft > 1);
    setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const measure = () => {
      updateScrollState();
    };

    measure();
    requestAnimationFrame(measure);

    element.addEventListener("scroll", measure, { passive: true });

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(element);
    window.addEventListener("resize", measure);

    return () => {
      element.removeEventListener("scroll", measure);
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [updateScrollState, categories]);

  const scrollBy = (direction: "left" | "right") => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }

    const scrollAmount = Math.max(element.clientWidth * 0.75, 160);

    element.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.bar}>
      {canScrollLeft ? (
        <ArrowButton
          direction="left"
          onClick={() => scrollBy("left")}
          ariaLabel="Предыдущие категории"
        />
      ) : null}

      <div ref={scrollRef} className={styles.viewport}>
        {categories.map((category) => (
          <span key={category.id} className={styles.link}>
            <Icon src={category.icon} width={24} height={24} className={styles.icon} />
            {category.label}
          </span>
        ))}
      </div>

      {canScrollRight ? (
        <ArrowButton
          direction="right"
          onClick={() => scrollBy("right")}
          ariaLabel="Следующие категории"
        />
      ) : null}
    </div>
  );
}
