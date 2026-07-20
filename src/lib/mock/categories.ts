import { getHomeScrollCategories } from "./games";

export interface Category {
  id: string;
  name: string;
  image: string;
  badge?: string;
}

export const categories: Category[] = getHomeScrollCategories();
