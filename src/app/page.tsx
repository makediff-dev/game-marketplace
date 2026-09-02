import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { PurchaseProgress } from "@/components/home/purchase-progress/purchase-progress";
import { HeroCarousel } from "@/components/hero/hero-carousel/hero-carousel";
import { HomeSections } from "@/components/home/home-sections/home-sections";
import { ProductGrid } from "@/components/products/product-grid/product-grid";
import { Footer } from "@/components/footer/footer/footer";
import styles from "./home-page.module.css";

export default function HomePage() {
  return (
    <div className="container">
      <div className={`pageContent ${styles.homePage}`}>
        <AppNavbar />
        <div className={styles.topSection}>
          <HeroCarousel />
          <PurchaseProgress />
        </div>
        <HomeSections />
        <ProductGrid />
        <Footer />
      </div>
    </div>
  );
}
