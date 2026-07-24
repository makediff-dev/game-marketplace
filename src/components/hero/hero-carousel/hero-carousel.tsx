"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowButton } from "@/components/ui/arrow-button/arrow-button";
import { banners } from "@/lib/mock/banners";
import styles from "./hero-carousel.module.css";

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + banners.length) % banners.length);
  }, []);

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [goNext]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  const current = banners[activeIndex];

  return (
    <section
      className={`layoutBlock ${styles.carousel}`}
      aria-label="Рекламный баннер"
      aria-roledescription="carousel"
    >
      <div className={styles.frame}>
        <div className={styles.slideWrapper}>
          <Image
            src={current.image}
            alt={current.alt}
            fill
            priority
            className={styles.slideImage}
            sizes="(max-width: 768px) 100vw, (max-width: 1440px) 1136px, 100vw"
          />
          <div className={styles.dots} role="tablist" aria-label="Выбор слайда">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Слайд ${index + 1}`}
                className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ""}`}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
        </div>
        <div className={styles.arrowLeft}>
          <ArrowButton direction="left" onClick={goPrev} ariaLabel="Предыдущий слайд" />
        </div>
        <div className={styles.arrowRight}>
          <ArrowButton direction="right" onClick={goNext} ariaLabel="Следующий слайд" />
        </div>
      </div>
    </section>
  );
}
