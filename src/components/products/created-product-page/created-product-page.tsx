"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { Footer } from "@/components/footer/footer/footer";
import { ProductDetailContent } from "@/components/products/product-detail-content/product-detail-content";
import { ProductDetailHero } from "@/components/products/product-detail-hero/product-detail-hero";
import { products } from "@/lib/mock/products";
import { useProfileProductsStore } from "@/lib/store/profile-products-store";

interface CreatedProductPageProps {
  id: string;
}

export function CreatedProductPage({ id }: CreatedProductPageProps) {
  const getCreatedProductDetail = useProfileProductsStore((state) => state.getCreatedProductDetail);
  const [product, setProduct] = useState(() => getCreatedProductDetail(id));
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setProduct(getCreatedProductDetail(id));
    setIsReady(true);
  }, [getCreatedProductDetail, id]);

  if (!isReady) {
    return null;
  }

  if (!product) {
    notFound();
  }

  const similarProducts = products
    .filter((item) => item.gameId === product.gameId)
    .slice(0, 8);

  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <div className="contentBlock">
          <ProductDetailHero product={product} />
        </div>
        <ProductDetailContent product={product} similarProducts={similarProducts} />
        <Footer />
      </div>
    </div>
  );
}
