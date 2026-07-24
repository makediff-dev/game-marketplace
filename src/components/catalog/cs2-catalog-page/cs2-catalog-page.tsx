"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { Footer } from "@/components/footer/footer/footer";
import { GameCatalogHero } from "@/components/catalog/game-catalog-hero/game-catalog-hero";
import { CatalogFiltersBar } from "@/components/catalog/catalog-filters-bar/catalog-filters-bar";
import { AccountFiltersModal } from "@/components/catalog/account-filters-modal/account-filters-modal";
import { CatalogProductGrid } from "@/components/products/catalog-product-grid/catalog-product-grid";
import { products } from "@/lib/mock/products";
import {
  cs2CatalogMeta,
  cs2SubcategoryToCategory,
  cs2Subcategories,
} from "@/lib/mock/game-catalog";

export function Cs2CatalogPage() {
  const searchParams = useSearchParams();
  const [activeSubcategory, setActiveSubcategory] = useState("accounts");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCategory = cs2SubcategoryToCategory[activeSubcategory];

  const totalProducts = useMemo(() => {
    return products.filter(
      (product) => product.gameId === "cs2" && product.category === activeCategory,
    ).length;
  }, [activeCategory]);

  useEffect(() => {
    if (searchParams.get("filters") === "1") {
      setFiltersOpen(true);
    }
  }, [searchParams]);

  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <GameCatalogHero
          title={cs2CatalogMeta.title}
          heroImage={cs2CatalogMeta.heroImage}
          logo={cs2CatalogMeta.logo}
        />
        <CatalogFiltersBar
          subcategories={cs2Subcategories}
          activeSubcategory={activeSubcategory}
          onSubcategoryChange={setActiveSubcategory}
          totalProducts={totalProducts}
          onOpenFilters={() => setFiltersOpen(true)}
        />
        <CatalogProductGrid
          key={activeSubcategory}
          gameId="cs2"
          category={activeCategory}
        />
        <Footer />
      </div>

      <AccountFiltersModal isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} />
    </div>
  );
}
