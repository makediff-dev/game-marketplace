import type { CSSProperties } from "react";
import {
  DEAL_PROGRESS_STEPS,
  getDealProgressIndex,
  getDealStepDate,
  getDealStepDescription,
  type OrderDetail,
} from "@/lib/mock/orders";
import styles from "./order-progress.module.css";

interface OrderProgressProps {
  order: OrderDetail;
}

export function OrderProgress({ order }: OrderProgressProps) {
  if (order.progressMode === "summary") {
    return (
      <div className={styles.summaryCard}>
        <p className={styles.summaryLabel}>Статус сделки</p>
        <p className={styles.summaryTitle}>
          Сделка завершена со статусом:{" "}
          <span className={styles.summaryStatus}>{order.progressSummary}</span>
        </p>
      </div>
    );
  }

  const currentIndex = getDealProgressIndex(order.currentStep);
  const isDealCompleted = order.currentStep === "completed";
  const lastStepIndex = Math.max(DEAL_PROGRESS_STEPS.length - 1, 1);
  const fillPercent = isDealCompleted ? 100 : (currentIndex / lastStepIndex) * 100;

  return (
    <div
      className={styles.root}
      style={
        {
          "--fill-percent": fillPercent,
        } as CSSProperties
      }
    >
      <div className={styles.rail} aria-hidden>
        <span className={styles.railLine} />
        <span
          className={styles.railLineFilled}
          style={{ height: `${fillPercent}%` }}
        />
      </div>

      <ol className={styles.list}>
        {DEAL_PROGRESS_STEPS.map((step, index) => {
          const isCompleted = isDealCompleted
            ? index <= currentIndex
            : index < currentIndex;
          const isCurrent = !isDealCompleted && index === currentIndex;
          const isFinalCompletedStep = isDealCompleted && step.id === "completed";
          const stepDate = getDealStepDate(order, step.id);

          let dotClass = styles.dot;
          if (isFinalCompletedStep || isCompleted) {
            dotClass = styles.dotCompleted;
          } else if (isCurrent) {
            dotClass = styles.dotCurrent;
          }

          let labelClass = styles.labelMuted;
          if (isFinalCompletedStep) {
            labelClass = styles.labelCompletedFinal;
          } else if (isCurrent) {
            labelClass = styles.labelCurrent;
          } else if (isCompleted) {
            labelClass = styles.labelCompleted;
          }

          return (
            <li
              key={step.id}
              className={`${styles.item} ${isCurrent ? styles.itemCurrent : ""}`}
            >
              <span className={styles.marker} aria-hidden>
                <span className={dotClass} />
              </span>

              <div className={styles.content}>
                <span className={labelClass}>{step.label}</span>
                {stepDate && !isFinalCompletedStep ? (
                  <time className={styles.stepDate} dateTime={stepDate}>
                    {stepDate}
                  </time>
                ) : null}
                {isCurrent ? (
                  <p className={styles.stepDescription}>
                    {getDealStepDescription(step.id, order)}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
