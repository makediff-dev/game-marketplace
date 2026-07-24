import { cs2Subcategories } from "@/lib/mock/game-catalog";

export interface SearchSuggestionItem {
  id: string;
  gameId: string;
  categories: string;
  href: string;
}

const cs2CategoriesLabel = cs2Subcategories.map((item) => item.label).join(", ");

export const searchViewedItems: SearchSuggestionItem[] = [
  {
    id: "viewed-1",
    gameId: "cs2",
    categories: cs2CategoriesLabel,
    href: "/categories/counter-strike-2",
  },
  {
    id: "viewed-2",
    gameId: "cs2",
    categories: cs2CategoriesLabel,
    href: "/categories/counter-strike-2?sub=skins",
  },
  {
    id: "viewed-3",
    gameId: "cs2",
    categories: cs2CategoriesLabel,
    href: "/categories/counter-strike-2?sub=accounts",
  },
];

export const searchPopularItems: SearchSuggestionItem[] = [
  {
    id: "popular-1",
    gameId: "cs2",
    categories: cs2CategoriesLabel,
    href: "/categories/counter-strike-2",
  },
  {
    id: "popular-2",
    gameId: "cs2",
    categories: cs2CategoriesLabel,
    href: "/categories/counter-strike-2?sub=prime",
  },
  {
    id: "popular-3",
    gameId: "cs2",
    categories: cs2CategoriesLabel,
    href: "/categories/counter-strike-2?sub=boost",
  },
  {
    id: "popular-4",
    gameId: "cs2",
    categories: cs2CategoriesLabel,
    href: "/categories/counter-strike-2?sub=services",
  },
  {
    id: "popular-5",
    gameId: "cs2",
    categories: cs2CategoriesLabel,
    href: "/categories/counter-strike-2?sub=pass",
  },
];
