"use client";

import type { TCashbackProgress } from "@/api/profile.api";
import styles from "@/styles/cashback-progress.module.scss";

function formatThreshold(amount: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(amount)} ₽`;
}

function segmentFill(
  total: number,
  tierThreshold: number,
  nextThreshold: number | null,
): number {
  if (nextThreshold == null) {
    return total >= tierThreshold ? 100 : 0;
  }

  if (total >= nextThreshold) {
    return 100;
  }

  if (total <= tierThreshold) {
    return 0;
  }

  const span = Math.max(1, nextThreshold - tierThreshold);
  return Math.min(100, ((total - tierThreshold) / span) * 100);
}

export function CashbackProgress({ data }: { data: TCashbackProgress }) {
  const tiers = data.tiers;

  if (tiers.length === 0) {
    return null;
  }

  return (
    <section
      className={styles["cashback-progress"]}
      aria-label="Кешбэк от покупок"
    >
      <h2 className={styles["cashback-progress__title"]}>Кешбэк от покупок</h2>
      <div className={styles["cashback-progress__track-wrap"]}>
        <div
          className={styles["cashback-progress__labels"]}
          style={{ gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))` }}
        >
          {tiers.map((tier) => (
            <span
              key={tier.id}
              className={styles["cashback-progress__percent"]}
            >
              {tier.label || `${tier.percent}%`}
            </span>
          ))}
        </div>
        <div
          className={styles["cashback-progress__track"]}
          style={{ gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))` }}
          aria-hidden
        >
          {tiers.map((tier, index) => {
            const next = tiers[index + 1] ?? null;
            const filled = segmentFill(
              data.purchaseTotal,
              tier.thresholdAmount,
              next ? next.thresholdAmount : null,
            );

            return (
              <span
                key={tier.id}
                className={styles["cashback-progress__segment"]}
              >
                <span
                  className={styles["cashback-progress__segment-fill"]}
                  style={{ width: `${filled}%` }}
                />
              </span>
            );
          })}
        </div>
        <div
          className={styles["cashback-progress__thresholds"]}
          style={{ gridTemplateColumns: `repeat(${tiers.length}, minmax(0, 1fr))` }}
        >
          {tiers.map((tier) => (
            <span
              key={tier.id}
              className={styles["cashback-progress__threshold"]}
            >
              {formatThreshold(tier.thresholdAmount)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
