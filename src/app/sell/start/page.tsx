import { AuthenticatedNavbar } from "@/components/layout/authenticated-navbar/authenticated-navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { SellerStartContent } from "@/components/seller/seller-start-content/seller-start-content";
import { Footer } from "@/components/footer/footer/footer";

export default function SellStartPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AuthenticatedNavbar />
        <div className="contentBlock">
          <PageHeader title="Продажа" backHref="/sell" />
        </div>
        <SellerStartContent />
        <Footer />
      </div>
    </div>
  );
}
