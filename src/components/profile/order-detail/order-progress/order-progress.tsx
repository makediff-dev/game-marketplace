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

function isStepCompleted(
  index: number,
  currentIndex: number,
  isDealCompleted: boolean,
): boolean {
  return isDealCompleted ? index <= currentIndex : index < currentIndex;
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

  return (
    <ol className={styles.list}>
      {DEAL_PROGRESS_STEPS.map((step, index) => {
        const completed = isStepCompleted(index, currentIndex, isDealCompleted);
        const isCurrent = !isDealCompleted && index === currentIndex;
        const isFinalCompletedStep = isDealCompleted && step.id === "completed";
        const isLast = index === DEAL_PROGRESS_STEPS.length - 1;
        const stepDate = getDealStepDate(order, step.id);

        let dotClass = styles.dotPending;
        if (isFinalCompletedStep || completed) {
          dotClass = styles.dotCompleted;
        } else if (isCurrent) {
          dotClass = styles.dotCurrent;
        }

        let labelClass = styles.labelPending;
        if (isFinalCompletedStep) {
          labelClass = styles.labelCompletedFinal;
        } else if (isCurrent) {
          labelClass = styles.labelCurrent;
        } else if (completed) {
          labelClass = styles.labelCompleted;
        }

        const connectorClass = completed
          ? `${styles.connector} ${styles.connectorCompleted}`
          : styles.connector;

        return (
          <li
            key={step.id}
            className={`${styles.item} ${isCurrent ? styles.itemCurrent : ""}`}
          >
            <div className={styles.track}>
              <span className={dotClass} aria-hidden />
              {!isLast ? <span className={connectorClass} aria-hidden /> : null}
            </div>

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
  );
}
