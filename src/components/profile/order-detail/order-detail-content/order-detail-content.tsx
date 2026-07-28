"use client";

import { useState } from "react";
import type { OrderDetail } from "@/lib/mock/orders";
import { OrderActions } from "@/components/profile/order-detail/order-actions/order-actions";
import { OrderBreadcrumbs } from "@/components/profile/order-detail/order-breadcrumbs/order-breadcrumbs";
import { OrderDealChat } from "@/components/profile/order-detail/order-deal-chat/order-deal-chat";
import { OrderProductCard } from "@/components/profile/order-detail/order-product-card/order-product-card";
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
        <div className={styles.productSection}>
          <div className={styles.pageHeader}>
            <OrderBreadcrumbs section={order.breadcrumbSection} dealId={order.dealId} />

            <div className={styles.headerRow}>
              <div className={styles.headerMain}>
                <h1 className={styles.title}>Сделка #{order.dealId}</h1>
                <span className={styles.dealBadge}>{order.dealStatusLabel}</span>
              </div>

              <OrderActions
                order={order}
                onCancelDeal={() => setIsCancelModalOpen(true)}
                onOpenDispute={() => setIsDisputeModalOpen(true)}
              />
            </div>
          </div>

          <OrderProductCard order={order} />
        </div>

        <div className={styles.bottomRow}>
          <section className={styles.bottomColumn} aria-labelledby="order-progress-title">
            <h2 id="order-progress-title" className={styles.sectionTitleWithGap}>
              Прогресс безопасной сделки
            </h2>
            <div className={`${styles.bottomPanel} ${styles.progressPanel}`}>
              <OrderProgress order={order} />
            </div>
          </section>

          <section className={styles.bottomColumn} aria-labelledby="order-chat-title">
            <h2 id="order-chat-title" className={styles.sectionTitleWithGap}>
              Чат сделки
            </h2>
            <div className={`${styles.bottomPanel} ${styles.chatPanel}`}>
              <OrderDealChat order={order} />
            </div>
          </section>
        </div>
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
