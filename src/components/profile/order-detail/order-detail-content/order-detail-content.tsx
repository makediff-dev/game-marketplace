"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import type { OrderDetail } from "@/lib/mock/orders";
import {
  applyDealRuntime,
  resolveDealRuntimeForOrder,
  shouldShowExpiredDealModal,
  shouldShowInlineDealTimer,
} from "@/lib/deal/deal-timer";
import { useDealExpiredModal } from "@/lib/deal/use-deal-expired-modal";
import { useDealStore } from "@/lib/store/deal-store";
import { useToastStore } from "@/lib/store/toast-store";
import { DealExpiredModal } from "@/components/profile/order-detail/deal-expired-modal/deal-expired-modal";
import { OrderActions } from "@/components/profile/order-detail/order-actions/order-actions";
import { OrderBreadcrumbs } from "@/components/profile/order-detail/order-breadcrumbs/order-breadcrumbs";
import { OrderDealChat } from "@/components/profile/order-detail/order-deal-chat/order-deal-chat";
import { OrderProductCard } from "@/components/profile/order-detail/order-product-card/order-product-card";
import { OrderProgress } from "@/components/profile/order-detail/order-progress/order-progress";
import { DealTimer } from "@/components/profile/order-detail/deal-timer/deal-timer";
import { CancelDealModal } from "@/components/profile/order-detail/cancel-deal-modal/cancel-deal-modal";
import { CloseDealEarlyModal } from "@/components/profile/order-detail/close-deal-early-modal/close-deal-early-modal";
import { CompleteDealModal } from "@/components/profile/order-detail/complete-deal-modal/complete-deal-modal";
import { OpenDisputeModal } from "@/components/profile/order-detail/open-dispute-modal/open-dispute-modal";
import styles from "./order-detail-content.module.css";

interface OrderDetailContentProps {
  order: OrderDetail;
}

export function OrderDetailContent({ order }: OrderDetailContentProps) {
  const router = useRouter();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCloseDealEarlyModalOpen, setIsCloseDealEarlyModalOpen] = useState(false);
  const [isCompleteDealModalOpen, setIsCompleteDealModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const cancelDeal = useDealStore((state) => state.cancelDeal);
  const closeDealEarly = useDealStore((state) => state.closeDealEarly);
  const completeDeal = useDealStore((state) => state.completeDeal);
  const dismissExpiredDealTimer = useDealStore((state) => state.dismissExpiredDealTimer);
  const setActiveDeal = useDealStore((state) => state.setActiveDeal);
  const { dealHydrated, dealRuntime, showInlineTimer } = useDealStore(
    useShallow((state) => {
      const runtime = resolveDealRuntimeForOrder(order.id, state.deals, state.activeDealId);

      return {
        dealHydrated: state.hydrated,
        dealRuntime: runtime,
        showInlineTimer: shouldShowInlineDealTimer(order, runtime, state.hydrated),
      };
    }),
  );
  const showToast = useToastStore((state) => state.show);

  useEffect(() => {
    if (!dealHydrated || !dealRuntime || dealRuntime.isCompleted || dealRuntime.isCancelled) {
      return;
    }

    setActiveDeal(order.id);
  }, [dealHydrated, dealRuntime, order.id, setActiveDeal]);

  const resolvedOrder = useMemo(
    () => applyDealRuntime(order, dealRuntime),
    [dealRuntime, order],
  );

  const {
    isOpen: isDealExpiredModalOpen,
    dismiss: dismissDealExpiredModal,
  } = useDealExpiredModal({
    orderId: order.id,
    order: resolvedOrder,
    deadlineAt: dealRuntime?.deadlineAt,
    enabled: shouldShowExpiredDealModal(order, dealRuntime, dealHydrated),
  });

  const dismissExpiredModal = () => {
    dismissExpiredDealTimer(order.id);
    dismissDealExpiredModal();
  };

  const handleExpiredModalClose = () => {
    dismissExpiredModal();
  };

  const handleExpiredModalChatClick = () => {
    dismissExpiredModal();

    window.setTimeout(() => {
      document.getElementById("order-chat-title")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const handleExpiredModalSupportClick = () => {
    dismissExpiredModal();

    window.setTimeout(() => {
      router.push("/support");
    }, 0);
  };

  const salesActions = resolvedOrder.actions.filter((action) => action.type !== "close_deal_early");

  const orderActions =
    salesActions.length > 0 ? (
      <OrderActions
        order={{ ...resolvedOrder, actions: salesActions }}
        layout="stack"
        onCloseDealEarly={() => setIsCloseDealEarlyModalOpen(true)}
        onCancelDeal={() => setIsCancelModalOpen(true)}
        onOpenDispute={() => setIsDisputeModalOpen(true)}
      />
    ) : null;

  const handleCancelConfirm = () => {
    cancelDeal(order.id, order.tab === "purchases" ? "buyer" : "seller");
    setIsCancelModalOpen(false);
    showToast(
      order.tab === "purchases"
        ? "Сделка отменена. Средства будут возвращены на баланс."
        : "Сделка отменена. Покупатель получит уведомление.",
    );
  };

  const handleCloseDealEarlyConfirm = () => {
    closeDealEarly(order.id);
    setIsCloseDealEarlyModalOpen(false);
    showToast("Сделка закрыта досрочно. Ожидается подтверждение покупателя.");
  };

  const handleCompleteDealConfirm = () => {
    completeDeal(order.id);
    setIsCompleteDealModalOpen(false);
    showToast("Сделка завершена. Спасибо за покупку!");
  };

  return (
    <>
      <article className={`contentBlock ${styles.orderDetail}`}>
        <div className={styles.productSection}>
          <div className={styles.pageHeader}>
            <OrderBreadcrumbs
              section={resolvedOrder.breadcrumbSection}
              dealId={resolvedOrder.dealId}
            />

            <div className={styles.headerRow}>
              <div className={styles.headerMain}>
                <h1 className={styles.title}>Сделка #{resolvedOrder.dealId}</h1>
                <span className={styles.dealBadge}>{resolvedOrder.dealStatusLabel}</span>
              </div>
            </div>
          </div>

          {showInlineTimer && dealRuntime ? (
            <DealTimer
              order={resolvedOrder}
              deadlineAt={dealRuntime.deadlineAt}
              sellerOnline={dealRuntime.sellerOnline}
              variant="page"
              onCompleteDeal={
                resolvedOrder.tab === "purchases"
                  ? () => setIsCompleteDealModalOpen(true)
                  : undefined
              }
              onCloseDealEarly={
                resolvedOrder.tab === "sales" ? () => setIsCloseDealEarlyModalOpen(true) : undefined
              }
            />
          ) : null}

          <OrderProductCard order={resolvedOrder} />
        </div>

        <div className={styles.bottomRow}>
          <section
            className={`${styles.bottomColumn} ${styles.progressColumn}`}
            aria-labelledby="order-progress-title"
          >
            <h2 id="order-progress-title" className={styles.sectionTitleWithGap}>
              Прогресс безопасной сделки
            </h2>
            <div className={`${styles.bottomPanel} ${styles.progressPanel}`}>
              <OrderProgress order={resolvedOrder} />
            </div>
            {orderActions ? <div className={styles.columnActions}>{orderActions}</div> : null}
          </section>

          <section className={styles.bottomColumn} aria-labelledby="order-chat-title">
            <h2 id="order-chat-title" className={styles.sectionTitleWithGap}>
              Чат сделки
            </h2>
            <div className={`${styles.bottomPanel} ${styles.chatPanel}`}>
              <OrderDealChat order={resolvedOrder} />
            </div>
          </section>
        </div>
      </article>

      <CancelDealModal
        isOpen={isCancelModalOpen}
        role={order.tab === "purchases" ? "buyer" : "seller"}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
      />

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

      <OpenDisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        onConfirm={() => setIsDisputeModalOpen(false)}
      />

      <DealExpiredModal
        isOpen={isDealExpiredModalOpen}
        order={resolvedOrder}
        onClose={handleExpiredModalClose}
        onChatClick={handleExpiredModalChatClick}
        onSupportClick={handleExpiredModalSupportClick}
      />
    </>
  );
}
