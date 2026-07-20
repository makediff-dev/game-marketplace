import { Navbar } from "@/components/layout/navbar/navbar";
import { Footer } from "@/components/footer/footer/footer";
import { CategoriesPageContent } from "@/components/catalog/categories-page-content/categories-page-content";

export default function CategoriesPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <Navbar />
        <CategoriesPageContent />
        <Footer />
      </div>
    </div>
  );
}
