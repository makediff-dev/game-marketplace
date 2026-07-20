"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowButton } from "@/components/ui/arrow-button/arrow-button";
import { categories } from "@/lib/mock/categories";
import styles from "./app-icon-grid.module.css";

export function AppIconGrid() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  };

  return (
    <section className={styles.grid} aria-label="Категории игр">
      <div ref={scrollRef} className={styles.scrollContainer}>
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
              {category.badge ? (
                <span
                  className={`${styles.badge} ${category.badge === "👀" ? styles.badgeEmoji : ""}`}
                >
                  {category.badge}
                </span>
              ) : null}
            </div>
            <span className={styles.name}>{category.name}</span>
          </Link>
        ))}
      </div>
      <div className={styles.arrow}>
        <ArrowButton onClick={scrollRight} ariaLabel="Прокрутить категории" />
      </div>
    </section>
  );
}
