import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { BalanceContent } from "@/components/profile/balance-content/balance-content";
import { Footer } from "@/components/footer/footer/footer";
import styles from "./page.module.css";

export default function BalancePage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <div className="contentBlock">
          <div className={styles.stack}>
            <PageHeader title="Баланс" />
            <BalanceContent />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
