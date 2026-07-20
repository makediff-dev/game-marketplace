"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CatalogGamesGrid } from "@/components/catalog/catalog-games-grid/catalog-games-grid";
import { GameCatalogHero } from "@/components/catalog/game-catalog-hero/game-catalog-hero";
import { CatalogProductGrid } from "@/components/products/catalog-product-grid/catalog-product-grid";
import { getGameById } from "@/lib/mock/games";

function CategoriesPageInner() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get("game");
  const game = gameId ? getGameById(gameId) : undefined;

  if (game) {
    return (
      <>
        <GameCatalogHero
          title={game.name}
          heroImage={game.catalogIcon}
          logo={game.logo}
        />
        <CatalogProductGrid gameId={game.id} showHeader />
      </>
    );
  }

  return <CatalogGamesGrid />;
}

export function CategoriesPageContent() {
  return (
    <Suspense fallback={<CatalogGamesGrid />}>
      <CategoriesPageInner />
    </Suspense>
  );
}
