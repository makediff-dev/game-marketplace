import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { ContactsContent } from "@/components/contacts/contacts-content/contacts-content";
import { Footer } from "@/components/footer/footer/footer";

export default function ContactsPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <div className="contentBlock">
          <ContactsContent />
        </div>
        <Footer />
      </div>
    </div>
  );
}
