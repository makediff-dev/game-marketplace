"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { DealTimer } from "@/components/profile/order-detail/deal-timer/deal-timer";
import { CloseDealEarlyModal } from "@/components/profile/order-detail/close-deal-early-modal/close-deal-early-modal";
import { CompleteDealModal } from "@/components/profile/order-detail/complete-deal-modal/complete-deal-modal";
import {
  applyDealRuntime,
  canCloseDealEarly,
  shouldShowFloatingDealTimer,
} from "@/lib/deal/deal-timer";
import { getOrderById } from "@/lib/mock/orders";
import { useDealStore } from "@/lib/store/deal-store";
import { useProfileProductsStore } from "@/lib/store/profile-products-store";
import { useToastStore } from "@/lib/store/toast-store";
import styles from "./active-deal-timer-dock.module.css";

export function ActiveDealTimerDock() {
  const pathname = usePathname();
  const [isCloseDealEarlyModalOpen, setIsCloseDealEarlyModalOpen] = useState(false);
  const [isCompleteDealModalOpen, setIsCompleteDealModalOpen] = useState(false);
  const dealHydrated = useDealStore((state) => state.hydrated);
  const activeDealId = useDealStore((state) => state.activeDealId);
  const deals = useDealStore((state) => state.deals);
  const dealRuntime = activeDealId ? deals[activeDealId] : undefined;
  const closeDealEarly = useDealStore((state) => state.closeDealEarly);
  const completeDeal = useDealStore((state) => state.completeDeal);
  const getCreatedSaleOrder = useProfileProductsStore((state) => state.getCreatedSaleOrder);
  const showToast = useToastStore((state) => state.show);

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

  const isTimerActive = Boolean(
    dealHydrated &&
      order &&
      dealRuntime &&
      resolvedOrder &&
      shouldShowFloatingDealTimer(order, dealRuntime, pathname),
  );

  const handleCloseDealEarlyConfirm = () => {
    if (!activeDealId) {
      return;
    }

    closeDealEarly(activeDealId);
    setIsCloseDealEarlyModalOpen(false);
    showToast("Сделка закрыта досрочно. Ожидается подтверждение покупателя.");
  };

  const handleCompleteDealConfirm = () => {
    if (!activeDealId) {
      return;
    }

    completeDeal(activeDealId);
    setIsCompleteDealModalOpen(false);
    showToast("Сделка завершена. Спасибо за покупку!");
  };

  const showCloseDealEarly =
    resolvedOrder?.tab === "sales" && resolvedOrder && canCloseDealEarly(resolvedOrder);
  const showCompleteDeal = resolvedOrder?.tab === "purchases";

  return (
    <>
      {isTimerActive && resolvedOrder && dealRuntime && activeDealId ? (
        <aside className={styles.dock} aria-label="Активная сделка">
          <DealTimer
            order={resolvedOrder}
            deadlineAt={dealRuntime.deadlineAt}
            sellerOnline={dealRuntime.sellerOnline}
            variant="dock"
            orderHref={`/profile/orders/${activeDealId}`}
            onCloseDealEarly={
              showCloseDealEarly ? () => setIsCloseDealEarlyModalOpen(true) : undefined
            }
            onCompleteDeal={showCompleteDeal ? () => setIsCompleteDealModalOpen(true) : undefined}
          />
        </aside>
      ) : null}

      <CloseDealEarlyModal
        isOpen={isCloseDealEarlyModalOpen}
        onClose={() => setIsCloseDealEarlyModalOpen(false)}
        onConfirm={handleCloseDealEarlyConfirm}
      />

      <CompleteDealModal
        isOpen={isCompleteDealModalOpen}
        onClose={() => setIsCompleteDealModalOpen(false)}
        onConfirm={handleCompleteDealConfirm}
      />
    </>
  );
}
