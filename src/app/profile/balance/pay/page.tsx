import { AuthenticatedNavbar } from "@/components/layout/authenticated-navbar/authenticated-navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { PayContent } from "@/components/profile/pay-content/pay-content";
import { Footer } from "@/components/footer/footer/footer";

export default function PayPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AuthenticatedNavbar />
        <div className="contentBlock">
          <PageHeader title="Пополнение" backHref="/profile/balance" />
        </div>
        <PayContent />
        <Footer />
      </div>
    </div>
  );
}
