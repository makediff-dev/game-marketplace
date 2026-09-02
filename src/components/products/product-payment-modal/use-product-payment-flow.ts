"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  calculateVariableUnitTotal,
  hasVariableUnitPricing,
} from "@/lib/mock/variable-pricing";
import type { Product } from "@/lib/mock/products";

interface PendingPurchase {
  amount?: number;
  recipient?: string;
}

type ProductPaymentSource = Pick<Product, "id" | "price" | "variablePricing">;

export function useProductPaymentFlow(product: ProductPaymentSource) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [pendingPurchase, setPendingPurchase] = useState<PendingPurchase>({});

  const resolveTotal = (purchaseAmount?: number) => {
    if (purchaseAmount && hasVariableUnitPricing(product) && product.variablePricing) {
      return calculateVariableUnitTotal(purchaseAmount, product.variablePricing);
    }

    return product.price;
  };

  const openPayment = (purchaseAmount?: number, recipient?: string) => {
    setPaymentAmount(resolveTotal(purchaseAmount));
    setPendingPurchase({
      amount: purchaseAmount,
      recipient,
    });
    setIsOpen(true);
  };

  const closePayment = () => {
    setIsOpen(false);
  };

  const proceedToPayment = (methodId: string) => {
    setIsOpen(false);

    const params = new URLSearchParams({ method: methodId });

    if (pendingPurchase.amount) {
      params.set("amount", String(pendingPurchase.amount));
    }

    if (pendingPurchase.recipient) {
      params.set("recipient", pendingPurchase.recipient);
    }

    router.push(`/product/${product.id}/checkout/success?${params.toString()}`);
  };

  return {
    isOpen,
    paymentAmount,
    openPayment,
    closePayment,
    proceedToPayment,
  };
}
