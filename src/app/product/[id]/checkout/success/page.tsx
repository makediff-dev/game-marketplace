import { notFound } from "next/navigation";
import { getProductDetail } from "@/lib/mock/product-details";
import { CheckoutSuccessContent } from "@/components/checkout/checkout-success-content/checkout-success-content";

interface CheckoutSuccessPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ method?: string }>;
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: CheckoutSuccessPageProps) {
  const { id } = await params;
  const { method = "card-ru" } = await searchParams;
  const product = getProductDetail(id);

  if (!product) {
    notFound();
  }

  return <CheckoutSuccessContent product={product} paymentMethod={method} />;
}
