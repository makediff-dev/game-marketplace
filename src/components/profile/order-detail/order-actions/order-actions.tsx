"use client";

import type { OrderAction, OrderDetail } from "@/lib/mock/orders";
import styles from "./order-actions.module.css";

interface OrderActionsProps {
  order: OrderDetail;
  onCancelDeal?: () => void;
  onOpenDispute?: () => void;
}

function getActionClassName(variant: OrderAction["variant"]): string {
  switch (variant) {
    case "secondary":
      return styles.actionSecondary;
    case "accent":
      return styles.actionAccent;
    default:
      return styles.actionGhost;
  }
}

function renderAction(
  action: OrderAction,
  handlers: {
    onCancelDeal?: () => void;
    onOpenDispute?: () => void;
  },
) {
  const className = getActionClassName(action.variant);

  if (action.type === "cancel_deal") {
    return (
      <button
        key={action.type}
        type="button"
        className={className}
        onClick={handlers.onCancelDeal}
      >
        {action.label}
      </button>
    );
  }

  if (action.type === "open_dispute") {
    return (
      <button
        key={action.type}
        type="button"
        className={className}
        onClick={handlers.onOpenDispute}
      >
        {action.label}
      </button>
    );
  }

  return (
    <button key={action.type} type="button" className={className}>
      {action.label}
    </button>
  );
}

export function OrderActions({ order, onCancelDeal, onOpenDispute }: OrderActionsProps) {
  const visibleActions = order.actions.filter(
    (action) => action.type !== "write_seller",
  );

  if (visibleActions.length === 0) {
    return null;
  }

  const sectionTitle =
    order.tab === "purchases" ? "Действия покупателя" : "Действия продавца";

  return (
    <div className={styles.actionsWrap} aria-label={sectionTitle}>
      <div className={styles.actions}>
        {visibleActions.map((action) =>
          renderAction(action, { onCancelDeal, onOpenDispute }),
        )}
      </div>
    </div>
  );
}
