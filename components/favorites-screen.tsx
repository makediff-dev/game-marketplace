"use client";

import Link from "next/link";

import { BackLink } from "@/components/back-link";
import { ListPageSkeleton } from "@/components/skeleton";
import { useFavorites } from "@/hooks/use-favorites";
import { formatMoney, productHref } from "@/lib/catalog";
import styles from "@/styles/favorites-page.module.scss";

export function FavoritesScreen() {
  const favoritesQuery = useFavorites();
  const items = favoritesQuery.data ?? [];

  return (
    <section className={styles["favorites-page"]}>
      <div className={styles["favorites-page__header"]}>
        <BackLink href="/profile" />
        <h1 className={styles["favorites-page__title"]}>
          Понравившиеся товары
        </h1>
      </div>

      {favoritesQuery.isLoading ? (
        <ListPageSkeleton rows={4} />
      ) : favoritesQuery.isError ? (
        <div className={styles["favorites-page__empty"]}>
          <p className={styles["favorites-page__empty-title"]}>
            Не удалось загрузить
          </p>
          <p className={styles["favorites-page__empty-text"]}>
            Обновите страницу или попробуйте позже.
          </p>
        </div>
      ) : items.length > 0 ? (
        <ul className={styles["favorites-page__list"]}>
          {items.map((item) => (
            <li key={item.id}>
              <Link
                className={styles["favorites-page__card"]}
                href={productHref(item)}
              >
                <img
                  className={styles["favorites-page__image"]}
                  src={item.image}
                  alt=""
                  width={88}
                  height={72}
                />
                <span className={styles["favorites-page__body"]}>
                  <p className={styles["favorites-page__item-title"]}>
                    {item.title}
                  </p>
                  <span className={styles["favorites-page__price"]}>
                    {formatMoney(item.price)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles["favorites-page__empty"]}>
          <p className={styles["favorites-page__empty-title"]}>Нет избранных</p>
          <p className={styles["favorites-page__empty-text"]}>
            Добавляйте товары в избранное — они появятся здесь.
          </p>
          <Link className={styles["favorites-page__empty-link"]} href="/">
            Перейти в каталог
          </Link>
        </div>
      )}
    </section>
  );
}
