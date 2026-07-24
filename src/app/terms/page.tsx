import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { TermsContent } from "@/components/legal/terms-content/terms-content";
import { Footer } from "@/components/footer/footer/footer";

export default function TermsPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <div className="contentBlock">
          <TermsContent />
        </div>
        <Footer />
      </div>
    </div>
  );
}
