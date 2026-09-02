"use client";

import { BalancePaymentModal } from "@/components/profile/balance-payment-modal/balance-payment-modal";

interface ProductPaymentModalProps {
  isOpen: boolean;
  amount: number;
  onClose: () => void;
  onProceed: (methodId: string) => void;
}

export function ProductPaymentModal({
  isOpen,
  amount,
  onClose,
  onProceed,
}: ProductPaymentModalProps) {
  return (
    <BalancePaymentModal
      isOpen={isOpen}
      onClose={onClose}
      amount={String(amount)}
      operation="purchase"
      onProceed={onProceed}
    />
  );
}
