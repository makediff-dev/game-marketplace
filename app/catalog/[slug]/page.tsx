import { CategoryCatalogScreen } from "@/components/category-catalog-screen";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <CategoryCatalogScreen slug={slug} />;
}
