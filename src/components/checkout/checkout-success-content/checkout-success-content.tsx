"use client";

import { Footer } from "@/components/footer/footer/footer";
import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { CheckoutSuccess } from "@/components/checkout/checkout-success/checkout-success";
import type { ProductDetail } from "@/lib/mock/product-details";
import styles from "./checkout-success-content.module.css";

interface CheckoutSuccessContentProps {
  product: ProductDetail;
  paymentMethod: string;
}

export function CheckoutSuccessContent({ product, paymentMethod }: CheckoutSuccessContentProps) {
  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <div className={`contentBlock ${styles.content}`}>
          <CheckoutSuccess product={product} paymentMethod={paymentMethod} />
        </div>
        <Footer />
      </div>
    </div>
  );
}
