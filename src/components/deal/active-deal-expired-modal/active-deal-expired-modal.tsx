"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DealExpiredModal } from "@/components/profile/order-detail/deal-expired-modal/deal-expired-modal";
import {
  applyDealRuntime,
  getOrderPageId,
  isOrderDetailPathname,
  resolveDealRuntimeForOrder,
  shouldKeepDealTimerActive,
} from "@/lib/deal/deal-timer";
import { useDealExpiredModal } from "@/lib/deal/use-deal-expired-modal";
import { getOrderById } from "@/lib/mock/orders";
import { useDealStore } from "@/lib/store/deal-store";
import { useProfileProductsStore } from "@/lib/store/profile-products-store";

export function ActiveDealExpiredModal() {
  const pathname = usePathname();
  const router = useRouter();
  const dealHydrated = useDealStore((state) => state.hydrated);
  const activeDealId = useDealStore((state) => state.activeDealId);
  const deals = useDealStore((state) => state.deals);
  const dealRuntime = activeDealId ? deals[activeDealId] : undefined;
  const getCreatedSaleOrder = useProfileProductsStore((state) => state.getCreatedSaleOrder);
  const dismissExpiredDealTimer = useDealStore((state) => state.dismissExpiredDealTimer);

  const order = useMemo(() => {
    if (!activeDealId) {
      return undefined;
    }

    if (activeDealId.startsWith("sell-created-")) {
      return getCreatedSaleOrder(activeDealId);
    }

    return getOrderById(activeDealId);
  }, [activeDealId, getCreatedSaleOrder]);

  const resolvedOrder = useMemo(
    () => (order ? applyDealRuntime(order, dealRuntime) : undefined),
    [dealRuntime, order],
  );

  const isOrderDetailPage = isOrderDetailPathname(pathname);
  const orderPageId = getOrderPageId(pathname);
  const pageOrder = useMemo(() => {
    if (!orderPageId) {
      return undefined;
    }

    if (orderPageId.startsWith("sell-created-")) {
      return getCreatedSaleOrder(orderPageId);
    }

    return getOrderById(orderPageId);
  }, [getCreatedSaleOrder, orderPageId]);
  const pageDealRuntime = orderPageId
    ? resolveDealRuntimeForOrder(orderPageId, deals, activeDealId)
    : undefined;
  const isOrderPageWithDealTimer = Boolean(
    isOrderDetailPage &&
      pageOrder &&
      pageDealRuntime &&
      shouldKeepDealTimerActive(pageOrder, pageDealRuntime),
  );
  const isActiveOrderPage = Boolean(
    isOrderDetailPage && activeDealId && orderPageId === activeDealId,
  );

  const {
    isOpen: isDealExpiredModalOpen,
    dismiss: dismissDealExpiredModal,
    order: expiredModalOrder,
  } = useDealExpiredModal({
    orderId: activeDealId ?? undefined,
    order: resolvedOrder,
    deadlineAt: dealRuntime?.deadlineAt,
    enabled: Boolean(
      dealHydrated &&
        activeDealId &&
        !isOrderPageWithDealTimer &&
        order &&
        dealRuntime &&
        resolvedOrder &&
        shouldKeepDealTimerActive(order, dealRuntime),
    ),
  });

  const handleClose = () => {
    if (!activeDealId) {
      dismissDealExpiredModal();
      return;
    }

    dismissExpiredModal(activeDealId);
  };

  const dismissExpiredModal = (orderId: string) => {
    dismissExpiredDealTimer(orderId);
    dismissDealExpiredModal();
  };

  const handleChatClick = () => {
    if (!activeDealId) {
      return;
    }

    const orderId = activeDealId;
    dismissExpiredModal(orderId);

    window.setTimeout(() => {
      if (isActiveOrderPage) {
        document.getElementById("order-chat-title")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }

      router.push(`/profile/orders/${orderId}#order-chat-title`);
    }, 0);
  };

  const handleSupportClick = () => {
    if (!activeDealId) {
      return;
    }

    dismissExpiredModal(activeDealId);

    window.setTimeout(() => {
      router.push("/support");
    }, 0);
  };

  if (!expiredModalOrder) {
    return null;
  }

  return (
    <DealExpiredModal
      isOpen={isDealExpiredModalOpen}
      order={expiredModalOrder}
      onClose={handleClose}
      onChatClick={handleChatClick}
      onSupportClick={handleSupportClick}
    />
  );
}
