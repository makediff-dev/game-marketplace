import Link from "next/link";
import type { ProductDetail } from "@/lib/mock/product-details";
import styles from "./checkout-breadcrumbs.module.css";

interface CheckoutBreadcrumbsProps {
  product?: ProductDetail;
  step: "checkout" | "success";
}

function getCatalogHref(product?: ProductDetail) {
  if (!product) {
    return "/categories";
  }

  if (product.gameId === "cs2") {
    return "/categories/counter-strike-2";
  }

  return `/categories?game=${product.gameId}`;
}

export function CheckoutBreadcrumbs({ product, step }: CheckoutBreadcrumbsProps) {
  if (step === "success") {
    return (
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/" className={styles.link}>
          Главная
        </Link>
        <span className={styles.separator} aria-hidden>
          /
        </span>
        <span className={styles.current}>Оформление</span>
        <span className={styles.separator} aria-hidden>
          /
        </span>
        <span className={styles.current}>Оплата</span>
      </nav>
    );
  }

  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <Link href="/" className={styles.link}>
        Главная
      </Link>
      <span className={styles.separator} aria-hidden>
        /
      </span>
      <Link href={getCatalogHref(product)} className={styles.link}>
        Каталог
      </Link>
      {product ? (
        <>
          <span className={styles.separator} aria-hidden>
            /
          </span>
          <Link href={`/product/${product.id}`} className={styles.link}>
            {product.title}
          </Link>
        </>
      ) : null}
      <span className={styles.separator} aria-hidden>
        /
      </span>
      <span className={styles.current}>Оформление</span>
    </nav>
  );
}
