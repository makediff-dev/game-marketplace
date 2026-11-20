import { FavoritesScreen } from "@/components/favorites-screen";

// Personal page: no shared caching.
export const dynamic = "force-dynamic";

export default function FavoritesPage() {
  return <FavoritesScreen />;
}
