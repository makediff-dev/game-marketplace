import { Navbar } from "@/components/layout/navbar/navbar";
import { HeroCarousel } from "@/components/hero/hero-carousel/hero-carousel";
import { CatalogHeader } from "@/components/catalog/catalog-header/catalog-header";
import { AppIconGrid } from "@/components/catalog/app-icon-grid/app-icon-grid";
import { SteamTopupForm } from "@/components/steam/steam-topup-form/steam-topup-form";
import { ProductGrid } from "@/components/products/product-grid/product-grid";
import { Footer } from "@/components/footer/footer/footer";

export default function HomePage() {
  return (
    <div className="container">
      <div className="pageContent">
        <Navbar />
        <HeroCarousel />
        <CatalogHeader />
        <AppIconGrid />
        <SteamTopupForm />
        <ProductGrid />
        <Footer />
      </div>
    </div>
  );
}
