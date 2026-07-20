import { Navbar } from "@/components/layout/navbar/navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { LegalContent } from "@/components/legal/legal-content/legal-content";
import { Footer } from "@/components/footer/footer/footer";
import { salesTermsSections, termsSections } from "@/lib/mock/legal";

export default function TermsPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <Navbar />
        <div className="contentBlock">
          <PageHeader title="Пользовательское соглашение" backHref="/" />
        </div>
        <LegalContent
          intro="Настоящий документ регулирует использование маркетплейса Playnox."
          sections={termsSections}
        />
        <div className="contentBlock" id="sales">
          <LegalContent sections={salesTermsSections} />
        </div>
        <Footer />
      </div>
    </div>
  );
}
