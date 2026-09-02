"use client";

import { useEffect } from "react";
import { useDealStore } from "@/lib/store/deal-store";

export function DealHydrator() {
  const hydrate = useDealStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return null;
}
