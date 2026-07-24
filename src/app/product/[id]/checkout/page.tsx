import { notFound } from "next/navigation";
import { getProductDetail } from "@/lib/mock/product-details";
import { CheckoutPageContent } from "@/components/checkout/checkout-page-content/checkout-page-content";

interface CheckoutPageProps {
  params: Promise<{ id: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = await params;
  const product = getProductDetail(id);

  if (!product) {
    notFound();
  }

  return <CheckoutPageContent product={product} />;
}
