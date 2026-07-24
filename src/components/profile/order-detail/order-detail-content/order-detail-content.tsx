"use client";

import { useState } from "react";
import type { OrderDetail } from "@/lib/mock/orders";
import { OrderActions } from "@/components/profile/order-detail/order-actions/order-actions";
import { OrderBreadcrumbs } from "@/components/profile/order-detail/order-breadcrumbs/order-breadcrumbs";
import { OrderDealChat } from "@/components/profile/order-detail/order-deal-chat/order-deal-chat";
import { OrderDetailsList } from "@/components/profile/order-detail/order-details-list/order-details-list";
import { OrderProgress } from "@/components/profile/order-detail/order-progress/order-progress";
import { CancelDealModal } from "@/components/profile/order-detail/cancel-deal-modal/cancel-deal-modal";
import { OpenDisputeModal } from "@/components/profile/order-detail/open-dispute-modal/open-dispute-modal";
import styles from "./order-detail-content.module.css";

interface OrderDetailContentProps {
  order: OrderDetail;
}

export function OrderDetailContent({ order }: OrderDetailContentProps) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  return (
    <>
      <article className={`contentBlock ${styles.orderDetail}`}>
        <div className={styles.pageHeader}>
          <OrderBreadcrumbs section={order.breadcrumbSection} dealId={order.dealId} />

          <div className={styles.headerRow}>
            <h1 className={styles.title}>Сделка #{order.dealId}</h1>
            <span className={styles.dealBadge}>{order.dealStatusLabel}</span>
          </div>
        </div>

        <div className={styles.topRow}>
          <section className={styles.detailsColumn} aria-label="Детали сделки">
            <OrderDetailsList order={order} />
          </section>

          <OrderActions
            order={order}
            onCancelDeal={() => setIsCancelModalOpen(true)}
            onOpenDispute={() => setIsDisputeModalOpen(true)}
          />
        </div>

        <section className={styles.sectionSpaced} aria-labelledby="order-progress-title">
          <h2 id="order-progress-title" className={styles.sectionTitleWithGap}>
            Прогресс безопасной сделки
          </h2>
          <OrderProgress order={order} />
        </section>

        <section className={styles.sectionSpaced} aria-labelledby="order-chat-title">
          <h2 id="order-chat-title" className={styles.sectionTitleWithGap}>
            Чат сделки
          </h2>
          <OrderDealChat order={order} />
        </section>
      </article>

      <CancelDealModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={() => setIsCancelModalOpen(false)}
      />

      <OpenDisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        onConfirm={() => setIsDisputeModalOpen(false)}
      />
    </>
  );
}
