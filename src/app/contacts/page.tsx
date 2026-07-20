import { Navbar } from "@/components/layout/navbar/navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { ContactsContent } from "@/components/contacts/contacts-content/contacts-content";
import { Footer } from "@/components/footer/footer/footer";

export default function ContactsPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <Navbar />
        <div className="contentBlock">
          <PageHeader title="Контакты" backHref="/" />
        </div>
        <ContactsContent />
        <Footer />
      </div>
    </div>
  );
}
