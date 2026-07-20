import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar/navbar";
import { Footer } from "@/components/footer/footer/footer";
import { ProductDetailHero } from "@/components/products/product-detail-hero/product-detail-hero";
import { ProductDetailContent } from "@/components/products/product-detail-content/product-detail-content";
import { getProductDetail, getSimilarProducts } from "@/lib/mock/product-details";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductDetail(id);

  if (!product) {
    notFound();
  }

  const similarProducts = getSimilarProducts(id);

  return (
    <div className="container">
      <div className="pageContent">
        <Navbar />
        <ProductDetailHero product={product} />
        <ProductDetailContent product={product} similarProducts={similarProducts} />
        <Footer />
      </div>
    </div>
  );
}
