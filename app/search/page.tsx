import { Suspense } from "react";

import { SearchScreen } from "@/components/search-screen";

export default function SearchPage() {
  return (
    <Suspense fallback={<p>Загрузка…</p>}>
      <SearchScreen />
    </Suspense>
  );
}
