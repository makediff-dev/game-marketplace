"use client";

import { useEffect, useState } from "react";
import type { OrderDetail } from "@/lib/mock/orders";
import { isDealTimerExpired } from "@/lib/deal/deal-timer";
import { useDealStore } from "@/lib/store/deal-store";

interface UseDealExpiredModalOptions {
  orderId?: string;
  order?: OrderDetail;
  deadlineAt?: number;
  enabled: boolean;
}

export function useDealExpiredModal({
  orderId,
  order,
  deadlineAt,
  enabled,
}: UseDealExpiredModalOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const expiredModalAcknowledged = useDealStore((state) =>
    orderId ? state.deals[orderId]?.expiredModalAcknowledged : false,
  );

  useEffect(() => {
    if (!enabled || !orderId || !deadlineAt || expiredModalAcknowledged) {
      setIsOpen(false);
      return;
    }

    const openIfExpired = () => {
      if (isDealTimerExpired(deadlineAt)) {
        setIsOpen(true);
      }
    };

    openIfExpired();
    const intervalId = window.setInterval(openIfExpired, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [deadlineAt, enabled, expiredModalAcknowledged, orderId]);

  const dismiss = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    dismiss,
    order,
  };
}
