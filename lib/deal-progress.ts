import type { TOrder, TOrderStatus } from "@/types/orders";

export type TDealStep = {
  key: string;
  label: string;
  at: string | null;
  description?: string;
  state: "done" | "current" | "todo";
};

const FROZEN_DESC =
  "Средства заморожены на escrow-счёте до завершения сделки.";

function stamp(value: string | null | undefined): string | null {
  return value || null;
}

export function isDealActive(status: TOrderStatus): boolean {
  return (
    status === "pending_payment" ||
    status === "paid" ||
    status === "awaiting_fulfillment" ||
    status === "awaiting_confirm"
  );
}

export function isFundsFrozenStatus(status: TOrderStatus): boolean {
  return (
    status === "paid" ||
    status === "awaiting_fulfillment" ||
    status === "awaiting_confirm" ||
    status === "disputed"
  );
}

export function buildDealSteps(order: TOrder): TDealStep[] {
  const status = order.status;
  const closed =
    status === "completed" ||
    status === "cancelled" ||
    status === "refunded" ||
    status === "disputed";

  const raw: Omit<TDealStep, "state">[] = [
    { key: "created", label: "Создана", at: stamp(order.createdAt) },
    {
      key: "pending_payment",
      label: "Ожидает оплаты",
      at: stamp(order.createdAt),
    },
    { key: "paid", label: "Оплачена", at: stamp(order.paidAt) },
    {
      key: "frozen",
      label: "Средства заморожены",
      at: stamp(order.paidAt),
      description: FROZEN_DESC,
    },
    {
      key: "fulfill",
      label: "Продавец выполняет",
      at: stamp(order.fulfilledAt),
    },
    {
      key: "confirm",
      label: "Ожидает подтверждения",
      at:
        stamp(order.fulfilledAt) ||
        (status === "awaiting_confirm" ? stamp(order.updatedAt) : null),
    },
    {
      key: "done",
      label: "Завершена",
      at: stamp(order.confirmedAt),
    },
  ];

  let currentIndex = 0;
  switch (status) {
    case "pending_payment":
      currentIndex = 1;
      break;
    case "paid":
      currentIndex = 3;
      break;
    case "awaiting_fulfillment":
      currentIndex = 4;
      break;
    case "awaiting_confirm":
      currentIndex = 5;
      break;
    case "completed":
      currentIndex = 6;
      break;
    case "disputed":
    case "cancelled":
    case "refunded":
      currentIndex = 3;
      break;
    default:
      currentIndex = 0;
  }

  return raw.map((step, index) => {
    if (closed && status === "completed") {
      return { ...step, state: index <= 6 ? "done" : "todo" };
    }

    if (index < currentIndex) {
      return { ...step, state: "done" };
    }

    if (index === currentIndex && !closed) {
      return { ...step, state: "current" };
    }

    if (index === currentIndex && closed) {
      return { ...step, state: "done" };
    }

    return { ...step, state: "todo" };
  });
}

export function formatDealStamp(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
