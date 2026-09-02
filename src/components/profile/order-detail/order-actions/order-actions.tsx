"use client";

import type { OrderAction, OrderDetail } from "@/lib/mock/orders";
import styles from "./order-actions.module.css";

interface OrderActionsProps {
  order: OrderDetail;
  layout?: "inline" | "stack";
  onCancelDeal?: () => void;
  onCloseDealEarly?: () => void;
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
    onCloseDealEarly?: () => void;
    onOpenDispute?: () => void;
  },
) {
  const className = getActionClassName(action.variant);

  if (action.type === "close_deal_early") {
    return (
      <button
        key={action.type}
        type="button"
        className={className}
        onClick={handlers.onCloseDealEarly}
      >
        {action.label}
      </button>
    );
  }

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

export function OrderActions({
  order,
  layout = "inline",
  onCancelDeal,
  onCloseDealEarly,
  onOpenDispute,
}: OrderActionsProps) {
  if (order.actions.length === 0) {
    return null;
  }

  const sectionTitle =
    order.tab === "purchases" ? "Действия покупателя" : "Действия продавца";

  return (
    <div
      className={`${styles.actionsWrap} ${layout === "stack" ? styles.actionsWrapStack : ""}`}
      aria-label={sectionTitle}
    >
      <div className={`${styles.actions} ${layout === "stack" ? styles.actionsStack : ""}`}>
        {order.actions.map((action) =>
          renderAction(action, { onCancelDeal, onCloseDealEarly, onOpenDispute }),
        )}
      </div>
    </div>
  );
}
