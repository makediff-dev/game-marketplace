"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar/navbar";
import { Footer } from "@/components/footer/footer/footer";
import { GameCatalogHero } from "@/components/catalog/game-catalog-hero/game-catalog-hero";
import { CatalogFiltersBar } from "@/components/catalog/catalog-filters-bar/catalog-filters-bar";
import { AccountFiltersModal } from "@/components/catalog/account-filters-modal/account-filters-modal";
import { CatalogProductGrid } from "@/components/products/catalog-product-grid/catalog-product-grid";
import { cs2CatalogMeta, cs2SubcategoryToCategory, cs2Subcategories } from "@/lib/mock/game-catalog";

export function Cs2CatalogPage() {
  const searchParams = useSearchParams();
  const [activeSubcategory, setActiveSubcategory] = useState("accounts");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("filters") === "1") {
      setFiltersOpen(true);
    }
  }, [searchParams]);

  return (
    <div className="container">
      <div className="pageContent">
        <Navbar />
        <GameCatalogHero
          title={cs2CatalogMeta.title}
          heroImage={cs2CatalogMeta.heroImage}
          logo={cs2CatalogMeta.logo}
        />
        <CatalogFiltersBar
          subcategories={cs2Subcategories}
          activeSubcategory={activeSubcategory}
          onSubcategoryChange={setActiveSubcategory}
          totalProducts={cs2CatalogMeta.totalProducts}
          onOpenFilters={() => setFiltersOpen(true)}
        />
        <CatalogProductGrid
          gameId="cs2"
          category={cs2SubcategoryToCategory[activeSubcategory]}
        />
        <Footer />
      </div>

      <AccountFiltersModal isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} />
    </div>
  );
}
