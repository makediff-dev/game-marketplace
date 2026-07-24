"use client";

import { useEffect } from "react";
import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { Footer } from "@/components/footer/footer/footer";
import { CheckoutAuthPrompt } from "@/components/checkout/checkout-auth-prompt/checkout-auth-prompt";
import { CheckoutForm } from "@/components/checkout/checkout-form/checkout-form";
import { getSimilarProducts } from "@/lib/mock/product-details";
import type { ProductDetail } from "@/lib/mock/product-details";
import { useAuthStore } from "@/lib/store/auth-store";
import styles from "./checkout-page-content.module.css";

interface CheckoutPageContentProps {
  product: ProductDetail;
}

export function CheckoutPageContent({ product }: CheckoutPageContentProps) {
  const hydrate = useAuthStore((state) => state.hydrate);
  const hydrated = useAuthStore((state) => state.hydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const viewedProducts = getSimilarProducts(product.id);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="container">
      <div className={`pageContent ${styles.pageContent}`}>
        <AppNavbar />
        {hydrated && isAuthenticated ? (
          <div className={`layoutBlock ${styles.content}`}>
            <CheckoutForm product={product} viewedProducts={viewedProducts} />
          </div>
        ) : hydrated ? (
          <CheckoutAuthPrompt productId={product.id} />
        ) : null}
        <Footer />
      </div>
    </div>
  );
}
