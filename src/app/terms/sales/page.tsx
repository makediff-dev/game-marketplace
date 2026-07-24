import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { SalesTermsContent } from "@/components/legal/sales-terms-content/sales-terms-content";
import { Footer } from "@/components/footer/footer/footer";

export default function SalesTermsPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <div className="contentBlock" id="sales">
          <SalesTermsContent />
        </div>
        <Footer />
      </div>
    </div>
  );
}
