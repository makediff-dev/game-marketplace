import { ProductScreen } from "@/components/product-screen";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ProductScreen slug={slug} />;
}
