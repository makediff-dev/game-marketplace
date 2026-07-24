import { notFound } from "next/navigation";
import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { Footer } from "@/components/footer/footer/footer";
import { CreatedProductPage } from "@/components/products/created-product-page/created-product-page";
import { ProductDetailHero } from "@/components/products/product-detail-hero/product-detail-hero";
import { ProductDetailContent } from "@/components/products/product-detail-content/product-detail-content";
import {
  getProductDetail,
  getSimilarProducts,
  isUserCreatedProductId,
} from "@/lib/mock/product-details";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  if (isUserCreatedProductId(id)) {
    return <CreatedProductPage id={id} />;
  }

  const product = getProductDetail(id);

  if (!product) {
    notFound();
  }

  const similarProducts = getSimilarProducts(id);

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
