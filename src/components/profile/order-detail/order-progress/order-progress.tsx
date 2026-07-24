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

  return (
    <ol className={styles.list}>
      {DEAL_PROGRESS_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === DEAL_PROGRESS_STEPS.length - 1;
        const stepDate = getDealStepDate(order, step.id);

        let dotClass = styles.dot;
        if (isCurrent) {
          dotClass = styles.dotCurrent;
        } else if (isCompleted) {
          dotClass = styles.dotCompleted;
        }

        let labelClass = styles.labelMuted;
        if (isCurrent) {
          labelClass = styles.labelCurrent;
        } else if (isCompleted) {
          labelClass = styles.labelCompleted;
        }

        const lineClass = index < currentIndex ? styles.line : styles.linePending;

        return (
          <li
            key={step.id}
            className={`${styles.item} ${isCurrent ? styles.itemCurrent : ""}`}
          >
            <div className={styles.track}>
              <span className={dotClass} aria-hidden />
              {!isLast ? <span className={lineClass} aria-hidden /> : null}
            </div>

            <div className={styles.labelRow}>
              <span className={labelClass}>{step.label}</span>
              {stepDate ? (
                <time className={styles.stepDate} dateTime={stepDate}>
                  {stepDate}
                </time>
              ) : null}
            </div>

            {isCurrent ? (
              <p className={styles.stepDescription}>
                {getDealStepDescription(step.id, order)}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
