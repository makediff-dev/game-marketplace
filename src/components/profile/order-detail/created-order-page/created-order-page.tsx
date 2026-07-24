"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { Footer } from "@/components/footer/footer/footer";
import { OrderDetailContent } from "@/components/profile/order-detail/order-detail-content/order-detail-content";
import { useProfileProductsStore } from "@/lib/store/profile-products-store";

interface CreatedOrderPageProps {
  id: string;
}

export function CreatedOrderPage({ id }: CreatedOrderPageProps) {
  const getCreatedSaleOrder = useProfileProductsStore((state) => state.getCreatedSaleOrder);
  const [order, setOrder] = useState(() => getCreatedSaleOrder(id));
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setOrder(getCreatedSaleOrder(id));
    setIsReady(true);
  }, [getCreatedSaleOrder, id]);

  if (!isReady) {
    return null;
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <OrderDetailContent order={order} />
        <Footer />
      </div>
    </div>
  );
}
