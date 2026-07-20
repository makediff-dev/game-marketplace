import { Suspense } from "react";
import { Cs2CatalogPage } from "@/components/catalog/cs2-catalog-page/cs2-catalog-page";

export default function CounterStrike2CatalogPage() {
  return (
    <Suspense fallback={null}>
      <Cs2CatalogPage />
    </Suspense>
  );
}
