import {
  catalogGroupFilters,
  marketplaceGames,
  type GameGroup,
} from "./games";

export interface CatalogGame {
  id: string;
  gameId: string;
  name: string;
  image: string;
  badge?: "new" | "viewed";
  badgeEmoji?: string;
  href: string;
  group: GameGroup;
}

export const INITIAL_CATALOG_VISIBLE = 18;
export const CATALOG_LOAD_MORE = 6;

export const catalogCategories = catalogGroupFilters;

const catalogGamePool: CatalogGame[] = marketplaceGames.map((game) => ({
  id: `catalog-${game.id}`,
  gameId: game.id,
  name: game.name,
  image: game.catalogIcon,
  badge: game.badge,
  badgeEmoji: game.badgeEmoji,
  href: game.href,
  group: game.group,
}));

export const catalogGames: CatalogGame[] = Array.from({ length: 60 }, (_, index) => {
  const source = catalogGamePool[index % catalogGamePool.length];

  return {
    ...source,
    id: `catalog-${index + 1}`,
  };
});

export function getCatalogGamesByGroup(group: GameGroup): CatalogGame[] {
  return catalogGames.filter((game) => game.group === group);
}
