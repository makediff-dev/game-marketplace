import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { SecurityContent } from "@/components/profile/security-content/security-content";
import { Footer } from "@/components/footer/footer/footer";

export default function SecurityPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <div className="contentBlock">
          <PageHeader title="Безопасность" backHref="/profile" />
        </div>
        <SecurityContent />
        <Footer />
      </div>
    </div>
  );
}
