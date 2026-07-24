import { Suspense } from "react";
import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { WelcomeContent } from "@/components/welcome/welcome-content/welcome-content";
import { Footer } from "@/components/footer/footer/footer";

export default function WelcomePage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <div className="contentBlock">
          <PageHeader title="Добро пожаловать" backHref="/" />
        </div>
        <Suspense fallback={null}>
          <WelcomeContent />
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}
