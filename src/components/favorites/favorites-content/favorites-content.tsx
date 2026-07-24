import { ProductCard } from "@/components/products/product-card/product-card";
import { getFavoriteProducts } from "@/lib/mock/favorites";
import styles from "./favorites-content.module.css";

export function FavoritesContent() {
  const favoriteProducts = getFavoriteProducts();

  return (
    <section className={styles.favorites} aria-label="Понравившиеся товары">
      {favoriteProducts.length > 0 ? (
        <div className={styles.grid}>
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Здесь появятся товары, которые вы отметили</p>
      )}
    </section>
  );
}
