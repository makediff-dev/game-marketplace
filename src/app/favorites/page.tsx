import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { FavoritesContent } from "@/components/favorites/favorites-content/favorites-content";
import { Footer } from "@/components/footer/footer/footer";

export default function FavoritesPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <div className="contentBlock">
          <PageHeader title="Понравившиеся товары" backHref="/profile" />
        </div>
        <FavoritesContent />
        <Footer />
      </div>
    </div>
  );
}
