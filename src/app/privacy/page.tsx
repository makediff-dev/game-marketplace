import { Navbar } from "@/components/layout/navbar/navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { LegalContent } from "@/components/legal/legal-content/legal-content";
import { Footer } from "@/components/footer/footer/footer";
import { privacySections } from "@/lib/mock/legal";

export default function PrivacyPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <Navbar />
        <div className="contentBlock">
          <PageHeader title="Политика конфиденциальности" backHref="/" />
        </div>
        <LegalContent
          intro="Playnox заботится о защите ваших персональных данных."
          sections={privacySections}
        />
        <Footer />
      </div>
    </div>
  );
}
