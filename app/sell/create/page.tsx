import { Suspense } from "react";

import { SellWizardScreen } from "@/components/sell-wizard-screen";

// Personal page: no shared caching.
export const dynamic = "force-dynamic";

export default function SellCreatePage() {
  return (
    <Suspense fallback={null}>
      <SellWizardScreen />
    </Suspense>
  );
}
