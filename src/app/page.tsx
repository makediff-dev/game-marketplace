import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { HeroCarousel } from "@/components/hero/hero-carousel/hero-carousel";
import { HomeSections } from "@/components/home/home-sections/home-sections";
import { ProductGrid } from "@/components/products/product-grid/product-grid";
import { Footer } from "@/components/footer/footer/footer";

export default function HomePage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <HeroCarousel />
        <HomeSections />
        <ProductGrid />
        <Footer />
      </div>
    </div>
  );
}
