import { Suspense } from "react";
import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { Footer } from "@/components/footer/footer/footer";
import { SellWizardContent } from "@/components/seller/sell-wizard/sell-wizard-content";

export default function SellCreatePage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <div className="contentBlock">
          <Suspense fallback={null}>
            <SellWizardContent />
          </Suspense>
        </div>
        <Footer />
      </div>
    </div>
  );
}
