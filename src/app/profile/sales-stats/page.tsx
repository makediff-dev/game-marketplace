import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { SellerStatsContent } from "@/components/profile/seller-stats-content/seller-stats-content";
import { Footer } from "@/components/footer/footer/footer";

export default function SalesStatsPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <div className="contentBlock">
          <PageHeader title="Статистика продаж" backHref="/profile" />
        </div>
        <SellerStatsContent />
        <Footer />
      </div>
    </div>
  );
}
