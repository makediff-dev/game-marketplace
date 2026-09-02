import {
  getOrderById,
  type DealProgressStepId,
  type OrderDetail,
} from "@/lib/mock/orders";
import type { ProfileItemStatus } from "@/lib/mock/profile-items";
import type { DealRuntimeState } from "@/lib/store/deal-store";

const CLOSE_DEAL_EARLY_STEPS: DealProgressStepId[] = [
  "paid",
  "funds_frozen",
  "seller_performing",
];

const COMPLETE_DEAL_STEPS: DealProgressStepId[] = [
  "paid",
  "funds_frozen",
  "seller_performing",
  "awaiting_confirm",
];

export const DEFAULT_DEAL_DURATION_MINUTES = 120;
export const DEFAULT_DEAL_DURATION_SECONDS = 10;

export function getDealDurationMs(
  order?: Pick<OrderDetail, "dealDurationMinutes">,
): number {
  void order;
  return DEFAULT_DEAL_DURATION_SECONDS * 1000;
}

export function getDealDurationMinutes(order: OrderDetail): number {
  return getDealDurationMs(order) / (60 * 1000);
}

const INACTIVE_DEAL_STATUSES: ProfileItemStatus[] = [
  "cancelled",
  "object_confirmed",
  "sale_paid_out",
  "dispute",
];

const PRE_PAYMENT_STEPS: DealProgressStepId[] = ["created", "awaiting_payment"];

function isActiveDealOrder(order: OrderDetail): boolean {
  if (order.progressMode === "summary") {
    return false;
  }

  if (INACTIVE_DEAL_STATUSES.includes(order.status)) {
    return false;
  }

  return true;
}

export function isDealTimerEligible(order: OrderDetail): boolean {
  if (order.tab !== "purchases") {
    return false;
  }

  if (!isActiveDealOrder(order)) {
    return false;
  }

  if (PRE_PAYMENT_STEPS.includes(order.currentStep)) {
    return false;
  }

  return true;
}

export function isDealTimerVisible(
  order: OrderDetail,
  runtime?: Pick<DealRuntimeState, "isCancelled" | "isCompleted">,
): boolean {
  if (runtime?.isCancelled || runtime?.isCompleted) {
    return false;
  }

  return isDealTimerEligible(order);
}

export function shouldKeepDealTimerActive(
  order: OrderDetail | undefined,
  runtime?: DealRuntimeState,
): boolean {
  if (!order || !runtime) {
    return false;
  }

  if (runtime.isCancelled || runtime.isCompleted) {
    return false;
  }

  return isDealTimerEligible(order);
}

export function shouldShowFloatingDealTimer(
  order: OrderDetail,
  runtime: DealRuntimeState,
  pathname: string,
): boolean {
  if (!shouldKeepDealTimerActive(order, runtime)) {
    return false;
  }

  if (isDealTimerExpired(runtime.deadlineAt)) {
    return false;
  }

  const orderPageId = getOrderPageId(pathname);

  if (orderPageId === order.id) {
    return false;
  }

  return true;
}

export function resolveDealRuntimeForOrder(
  orderId: string,
  deals: Record<string, DealRuntimeState>,
  activeDealId: string | null,
): DealRuntimeState | undefined {
  if (deals[orderId]) {
    return deals[orderId];
  }

  if (activeDealId === orderId) {
    return deals[activeDealId];
  }

  return undefined;
}

export function shouldShowInlineDealTimer(
  order: OrderDetail,
  runtime: DealRuntimeState | undefined,
  hydrated: boolean,
): boolean {
  if (!hydrated || !runtime) {
    return false;
  }

  const resolvedOrder = applyDealRuntime(order, runtime);

  return isDealTimerVisible(resolvedOrder, runtime);
}

export function shouldShowExpiredDealModal(
  order: OrderDetail,
  runtime: DealRuntimeState | undefined,
  hydrated: boolean,
): boolean {
  if (!hydrated) {
    return false;
  }

  return shouldKeepDealTimerActive(order, runtime);
}

export function canCloseDealEarly(order: OrderDetail): boolean {
  return (
    order.tab === "sales" &&
    isActiveDealOrder(order) &&
    CLOSE_DEAL_EARLY_STEPS.includes(order.currentStep)
  );
}

export function canCompleteDeal(order: OrderDetail): boolean {
  return (
    order.tab === "purchases" &&
    isDealTimerEligible(order) &&
    COMPLETE_DEAL_STEPS.includes(order.currentStep)
  );
}

function filterOrderActions(order: OrderDetail): OrderDetail["actions"] {
  return order.actions.filter((action) => {
    if (action.type === "close_deal_early") {
      return canCloseDealEarly(order);
    }

    return action.type !== "write_seller";
  });
}

export function isDealTimerExpired(deadlineAt: number, now = Date.now()): boolean {
  return now >= deadlineAt;
}

export function getDealExpiredModalCopy(
  order: Pick<OrderDetail, "tab">,
): { title: string; body: string; chatButtonLabel: string } {
  if (order.tab === "sales") {
    return {
      title: "Время на сделку истекло",
      body: "К сожалению, за отведённое время не удалось выполнить заказ полностью. Напишите покупателю в чате или обратитесь в поддержку — мы поможем решить ситуацию.",
      chatButtonLabel: "Написать покупателю",
    };
  }

  return {
    title: "Время на сделку истекло",
    body: "К сожалению, за отведённое время не удалось завершить все необходимые действия по заказу. Напишите продавцу в чате или обратитесь в поддержку — мы поможем разобраться.",
    chatButtonLabel: "Написать продавцу",
  };
}

export function formatDealCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function getDealTimerHint(
  order: Pick<OrderDetail, "tab" | "currentStep">,
  isExpired: boolean,
): string {
  if (isExpired) {
    return order.tab === "purchases"
      ? "Время истекло. Вы можете открыть спор или дождаться решения поддержки."
      : "Время истекло. Завершите заказ или свяжитесь с покупателем.";
  }

  if (order.tab === "sales") {
    if (order.currentStep === "created" || order.currentStep === "awaiting_payment") {
      return "Ожидается оплата покупателя. Вы можете отменить сделку до оплаты.";
    }

    return "Выполните заказ до окончания таймера. Покупатель может отменить сделку.";
  }

  if (order.currentStep === "awaiting_payment") {
    return "Оплатите заказ до окончания таймера, иначе сделка будет отменена.";
  }

  if (order.currentStep === "awaiting_confirm") {
    return "Проверьте получение товара. При проблемах можно открыть спор.";
  }

  return "Продавец выполняет заказ. При необходимости вы можете отменить сделку.";
}

export function getDealTimerDockHint(
  order: Pick<OrderDetail, "tab" | "currentStep">,
  isExpired: boolean,
): [string, string] {
  if (isExpired) {
    return order.tab === "purchases"
      ? ["Время истекло", "Откройте спор или ждите поддержку"]
      : ["Время истекло", "Завершите заказ или напишите покупателю"];
  }

  if (order.tab === "sales") {
    if (order.currentStep === "created" || order.currentStep === "awaiting_payment") {
      return ["Ждём оплату покупателя", "Отмена доступна до оплаты"];
    }

    if (
      order.currentStep === "paid" ||
      order.currentStep === "funds_frozen" ||
      order.currentStep === "seller_performing"
    ) {
      return ["Выполните заказ в срок", "Можно закрыть сделку досрочно"];
    }

    return ["Выполните заказ в срок", "Покупатель может отменить"];
  }

  if (order.currentStep === "awaiting_payment") {
    return ["Оплатите заказ в срок", "Иначе сделка отменится"];
  }

  if (order.currentStep === "awaiting_confirm") {
    return ["Проверьте получение товара", "При проблемах откройте спор"];
  }

  return ["Продавец выполняет заказ", "Можно отменить сделку"];
}

export function getOrderPageId(pathname: string): string | null {
  const match = pathname.match(/^\/profile\/orders\/([^/]+)$/);
  return match?.[1] ?? null;
}

export function resolveOrderById(
  id: string,
  getCreatedSaleOrder?: (id: string) => OrderDetail | undefined,
): OrderDetail | undefined {
  if (id.startsWith("sell-created-")) {
    return getCreatedSaleOrder?.(id);
  }

  return getOrderById(id);
}

export function isOrderDetailPathname(pathname: string): boolean {
  return getOrderPageId(pathname) !== null;
}

export function isPurchaseOrderPathname(
  pathname: string,
  getCreatedSaleOrder?: (id: string) => OrderDetail | undefined,
): boolean {
  const orderId = getOrderPageId(pathname);

  if (!orderId) {
    return false;
  }

  const order = resolveOrderById(orderId, getCreatedSaleOrder);
  return order?.tab === "purchases";
}

export function isSaleOrderPathname(
  pathname: string,
  getCreatedSaleOrder?: (id: string) => OrderDetail | undefined,
): boolean {
  const orderId = getOrderPageId(pathname);

  if (!orderId) {
    return false;
  }

  const order = resolveOrderById(orderId, getCreatedSaleOrder);
  return order?.tab === "sales";
}

export function getSellerPresenceLabel(
  sellerName: string,
  isOnline: boolean,
  viewerRole: "purchases" | "sales" = "purchases",
): string {
  if (viewerRole === "sales") {
    return isOnline ? "Вы в сети" : "Вы не в сети";
  }

  return isOnline ? `${sellerName} в сети` : `${sellerName} не в сети`;
}

export function applyDealRuntime(
  order: OrderDetail,
  runtime?: Pick<
    DealRuntimeState,
    "isCancelled" | "isClosedEarly" | "isCompleted" | "cancelledBy" | "sellerOnline"
  >,
): OrderDetail {
  if (runtime?.isCompleted) {
    return {
      ...order,
      status: "object_confirmed",
      dealStatusLabel: "Завершена",
      currentStep: "completed",
      progressMode: "summary",
      progressSummary: "Завершена",
      moneyStatusTitle: "Сделка завершена — средства переведены продавцу",
      actions: [],
      sellerOnline: runtime.sellerOnline ?? order.sellerOnline,
    };
  }

  if (runtime?.isClosedEarly) {
    return {
      ...order,
      status: "awaiting_confirm",
      dealStatusLabel: "Ожидает подтверждения",
      currentStep: "awaiting_confirm",
      moneyStatusTitle: "Заказ выполнен — ожидается подтверждение покупателя",
      actions: [{ type: "open_dispute", label: "Открыть спор", variant: "secondary" }],
      sellerOnline: runtime.sellerOnline ?? order.sellerOnline,
    };
  }

  if (runtime?.isCancelled) {
    const cancelledByLabel =
      runtime.cancelledBy === "seller"
        ? "Отменена продавцом"
        : "Отменена покупателем";

    return {
      ...order,
      status: "cancelled",
      dealStatusLabel: "Отменена",
      progressMode: "summary",
      progressSummary: cancelledByLabel,
      moneyStatusTitle: "Сделка отменена — средства возвращены на баланс",
      actions: [],
      sellerOnline: runtime.sellerOnline ?? order.sellerOnline,
    };
  }

  return {
    ...order,
    actions: filterOrderActions(order),
    sellerOnline: runtime?.sellerOnline ?? order.sellerOnline,
  };
}
