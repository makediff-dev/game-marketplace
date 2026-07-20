import { Navbar } from "@/components/layout/navbar/navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { SearchContent } from "@/components/search/search-content/search-content";
import { Footer } from "@/components/footer/footer/footer";

export default function SearchPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <Navbar />
        <div className="contentBlock">
          <PageHeader title="Поиск" backHref="/" />
        </div>
        <SearchContent />
        <Footer />
      </div>
    </div>
  );
}
