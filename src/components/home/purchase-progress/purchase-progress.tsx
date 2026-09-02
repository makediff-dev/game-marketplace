"use client";

import {
  formatPurchaseAmount,
  formatPurchaseAmountCompact,
  getPurchaseRewardStages,
} from "@/lib/mock/purchase-rewards";
import { useAuthStore } from "@/lib/store/auth-store";
import styles from "./purchase-progress.module.css";

export function PurchaseProgress() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrated = useAuthStore((state) => state.hydrated);

  if (!hydrated || !isAuthenticated) {
    return null;
  }

  const stages = getPurchaseRewardStages();

  return (
    <section className={`contentBlock ${styles.section}`} aria-label="Прогресс покупок">
      <div className={styles.card}>
        <h2 className={styles.title}>Кешбэк от покупок</h2>

        <div className={styles.progressBlock}>
          <div className={styles.markersTop}>
            {stages.map((stage, index) => (
              <div key={`percent-${stage.amount}`} className={styles.markerCell}>
                <span
                  className={styles.stagePercent}
                  style={{ "--segment-index": index, "--segments-count": stages.length } as React.CSSProperties}
                >
                  {stage.percent}%
                </span>
              </div>
            ))}
          </div>

          <div className={styles.segmentsRow} role="list" aria-label="Этапы кешбэка">
            {stages.map((stage, index) => (
              <div key={`segment-${stage.amount}`} className={styles.segment} role="listitem">
                <div
                  className={styles.segmentTrack}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(stage.fillPercent)}
                  aria-label={`Прогресс до ${stage.percent}%`}
                >
                  <div
                    className={styles.segmentFillMask}
                    style={{ width: `${stage.fillPercent}%` }}
                  >
                    <div
                      className={styles.segmentFill}
                      style={
                        {
                          "--segment-index": index,
                          "--segments-count": stages.length,
                          "--fill-fraction": Math.max(stage.fillPercent, 0.01) / 100,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.markersBottom}>
            {stages.map((stage) => (
              <div key={`amount-${stage.amount}`} className={styles.markerCell}>
                <span className={styles.stageAmount}>{formatPurchaseAmount(stage.amount)}</span>
                <span className={styles.stageAmountCompact}>
                  {formatPurchaseAmountCompact(stage.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
