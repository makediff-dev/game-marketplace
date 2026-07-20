import { AuthenticatedNavbar } from "@/components/layout/authenticated-navbar/authenticated-navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { BalanceContent } from "@/components/profile/balance-content/balance-content";
import { Footer } from "@/components/footer/footer/footer";

export default function BalancePage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AuthenticatedNavbar />
        <div className="contentBlock">
          <PageHeader title="Баланс" backHref="/profile" />
        </div>
        <BalanceContent />
        <Footer />
      </div>
    </div>
  );
}
