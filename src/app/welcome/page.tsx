import { AuthenticatedNavbar } from "@/components/layout/authenticated-navbar/authenticated-navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { WelcomeContent } from "@/components/welcome/welcome-content/welcome-content";
import { Footer } from "@/components/footer/footer/footer";

export default function WelcomePage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AuthenticatedNavbar />
        <div className="contentBlock">
          <PageHeader title="Добро пожаловать" backHref="/" />
        </div>
        <WelcomeContent />
        <Footer />
      </div>
    </div>
  );
}
