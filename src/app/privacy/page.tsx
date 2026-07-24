import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { PrivacyContent } from "@/components/legal/privacy-content/privacy-content";
import { Footer } from "@/components/footer/footer/footer";

export default function PrivacyPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <div className="contentBlock">
          <PrivacyContent />
        </div>
        <Footer />
      </div>
    </div>
  );
}
