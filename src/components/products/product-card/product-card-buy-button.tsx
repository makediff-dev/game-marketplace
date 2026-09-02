"use client";

import type { Product } from "@/lib/mock/products";
import { ProductPaymentModal } from "@/components/products/product-payment-modal/product-payment-modal";
import { useProductPaymentFlow } from "@/components/products/product-payment-modal/use-product-payment-flow";
import styles from "./product-card.module.css";

interface ProductCardBuyButtonProps {
  product: Product;
}

export function ProductCardBuyButton({ product }: ProductCardBuyButtonProps) {
  const { isOpen, paymentAmount, openPayment, closePayment, proceedToPayment } =
    useProductPaymentFlow(product);

  return (
    <>
      <button type="button" className={styles.buyButton} onClick={() => openPayment()}>
        Купить
      </button>

      <ProductPaymentModal
        isOpen={isOpen}
        amount={paymentAmount}
        onClose={closePayment}
        onProceed={proceedToPayment}
      />
    </>
  );
}
