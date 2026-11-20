import { isFundsFrozenStatus } from "@/lib/deal-progress";
import type { TOrder, TOrderStatus } from "@/types/orders";

const CLOSED: TOrderStatus[] = ["cancelled", "refunded"];

export function isChatOrderOpen(order: TOrder): boolean {
  return !CLOSED.includes(order.status);
}

// Money is held only after payment; the deal page answers the same way.
export function isFundsFrozen(status: TOrderStatus): boolean {
  return isFundsFrozenStatus(status);
}

// Buyer and seller can talk until the deal is over, payment or not.
export function canWriteInDeal(status: TOrderStatus): boolean {
  return (
    status !== "completed" &&
    status !== "cancelled" &&
    status !== "refunded"
  );
}

export function counterpartyLabel(order: TOrder): string {
  const nickname = order.counterpartyUsername?.trim();
  if (nickname) {
    return nickname;
  }

  if (order.role === "buyer" && order.sellerId == null) {
    return "Playnox";
  }

  const fallbackId =
    order.role === "seller" ? order.buyerId : order.sellerId;
  return fallbackId ? `user-${fallbackId}` : "Пользователь";
}

export function dealSideLabel(order: TOrder): "Покупка" | "Продажа" {
  return order.role === "seller" ? "Продажа" : "Покупка";
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatSystemStamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("ru-RU");
}

export const ORDER_STATUS_LABEL: Record<TOrderStatus, string> = {
  pending_payment: "Ожидает оплаты",
  paid: "Оплачен",
  awaiting_fulfillment: "Ожидает передачи",
  awaiting_confirm: "Ожидает подтверждения",
  completed: "Завершён",
  disputed: "Спор",
  cancelled: "Отменён",
  refunded: "Возврат",
};

// Messages in a row from one author, each within a minute of the previous
// one, read as one block: the name above the first, the time under the last.
const RUN_GAP_MS = 60_000;

type TRunMessage = {
  authorRole: string;
  authorId?: number;
  createdAt: string;
};

export type TChatRun = { first: boolean; last: boolean };

function sameRun(a: TRunMessage | undefined, b: TRunMessage | undefined) {
  if (!a || !b || a.authorRole === "system") {
    return false;
  }

  const gap = Date.parse(b.createdAt) - Date.parse(a.createdAt);

  return (
    a.authorRole === b.authorRole &&
    a.authorId === b.authorId &&
    Number.isFinite(gap) &&
    gap >= 0 &&
    gap <= RUN_GAP_MS
  );
}

export function chatRuns(messages: TRunMessage[]): TChatRun[] {
  return messages.map((message, index) => ({
    first: !sameRun(messages[index - 1], message),
    last: !sameRun(message, messages[index + 1]),
  }));
}
