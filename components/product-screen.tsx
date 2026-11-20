"use client";

import { useEffect, useState } from "react";

import { CatalogApi } from "@/api/catalog.api";
import { AuthGateDialog } from "@/components/auth-gate-dialog";
import { CheckoutModal } from "@/components/checkout-modal";
import { FavoriteHeartIcon } from "@/components/favorite-heart-icon";
import { ProductCard } from "@/components/product-card";
import { SellerReviews } from "@/components/reviews";
import { ProductPageSkeleton } from "@/components/skeleton";
import { useCatalogProduct, useCatalogProducts } from "@/hooks/use-catalog";
import { useFavoriteIds, useToggleFavorite } from "@/hooks/use-favorites";
import { formatMoney } from "@/lib/catalog";
import { isOwnCatalogProduct } from "@/lib/is-own-product";
import { parseProductDescription } from "@/lib/product-description";
import {
  clearRecentProducts,
  readRecentProducts,
  rememberProduct,
} from "@/lib/recent-products";
import { useUserStore } from "@/store/user.store";
import toastStyles from "@/styles/app-toast.module.scss";
import styles from "@/styles/product-page.module.scss";
import type { TCatalogProduct } from "@/types/catalog";

const PAYMENT_ICONS = [
  "/assets/card-foreign.png",
  "/assets/sbp.svg",
  "/assets/card-by.svg",
  "/assets/card-kz.svg",
  "/assets/visa.svg",
  "/assets/mastercard.svg",
  "/assets/mir.svg",
];

const DEFAULT_HOW_TO =
  "После оплаты продавец отправит данные в чат заказа. Проверьте аккаунт сразу после получения.";

function moneyWithUnit(amount: number, unit: string) {
  return `${formatMoney(amount)} ${unit}`.replace(/\s+/g, " ").trim();
}

const SIMILAR_PAGE = 8;

export function ProductScreen({ slug }: { slug: string }) {
  const productQuery = useCatalogProduct(slug);
  const productsQuery = useCatalogProducts();
  const favoriteIdsQuery = useFavoriteIds();
  const user = useUserStore((state) => state.user);
  const [authOpen, setAuthOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [recent, setRecent] = useState<TCatalogProduct[]>([]);
  const product = productQuery.data;
  const favorited = Boolean(
    product && (favoriteIdsQuery.data ?? []).includes(product.id),
  );
  const toggleFavorite = useToggleFavorite({
    onSuccessToast: (isFavorited) => {
      setToast(
        isFavorited ? "Добавлено в избранное" : "Удалено из избранного",
      );
    },
    onErrorToast: (message) => setToast(message),
  });
  const [similarShown, setSimilarShown] = useState(SIMILAR_PAGE);
  // Same game; the same section of the game (accounts, skins…) first.
  const similarAll = product
    ? (productsQuery.data ?? [])
        .filter(
          (item) =>
            item.slug !== slug && item.categorySlug === product.categorySlug,
        )
        .sort(
          (a, b) =>
            Number(b.offerTypeSlug === product.offerTypeSlug) -
            Number(a.offerTypeSlug === product.offerTypeSlug),
        )
    : [];
  const similar = similarAll.slice(0, similarShown);
  const description = parseProductDescription(product?.description);
  const visibleBullets = descExpanded
    ? description.bullets
    : description.bullets.slice(0, 2);

  useEffect(() => {
    setRecent(readRecentProducts().filter((item) => item.slug !== slug));
  }, [slug]);

  useEffect(() => {
    if (!product) {
      return;
    }

    rememberProduct(product);
  }, [product]);

  // The seller's own visits do not count towards their conversion.
  const viewer = user?.id;
  const loaded = Boolean(product);
  useEffect(() => {
    if (!product || isOwnCatalogProduct(product, viewer)) {
      return;
    }

    CatalogApi.getInstance()
      .countView(product.slug)
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per opened product
  }, [loaded, slug]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (productQuery.isLoading) {
    return <ProductPageSkeleton />;
  }

  if (productQuery.isError || !product) {
    return <p className={styles["product-page__empty"]}>Товар не найден</p>;
  }

  const unit = product.unitHint?.trim() || "/ шт.";
  const fulfillmentTime =
    product.fulfillmentTime?.trim() ||
    (typeof product.attributes?.fulfillmentTime === "string"
      ? product.attributes.fulfillmentTime
      : null) ||
    "до 5 мин";
  const deliveryTitle = product.deliveryTitle?.trim() || "Способ получения";
  const deliveryOption =
    product.deliveryOption?.trim() ||
    product.productType ||
    "Передача данных";
  const deliveryDescription =
    product.deliveryDescription?.trim() ||
    "Данные от аккаунта или предмет отправляются в чат заказа.";
  const warrantyText = product.warrantyText?.trim() || "Гарантия Playnox";
  const showOfficial =
    product.sellerVerified ||
    product.seller?.toLowerCase() === "playnox";
  const howToBody =
    description.rest[0] ||
    product.deliveryDescription?.trim() ||
    DEFAULT_HOW_TO;
  const extraDescription = description.rest.slice(
    description.rest[0] ? 1 : 0,
  );
  const ownProduct = isOwnCatalogProduct(product, user?.id);

  function onBuy() {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    if (isOwnCatalogProduct(product, user.id)) {
      setToast("Нельзя купить собственный товар");
      return;
    }

    setCheckoutOpen(true);
  }

  function onFavorite() {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    if (!product) {
      return;
    }

    toggleFavorite.mutate(product.id);
  }

  return (
    <div className={styles["product-page"]}>
      <section className={styles["product-page__hero"]}>
        <img
          className={styles["product-page__image"]}
          src={product.image}
          alt={product.title}
        />
        <div className={styles["product-page__side"]}>
          <h1 className={styles["product-page__title"]}>{product.title}</h1>

          <div className={styles["product-page__price-row"]}>
            <span className={styles["product-page__price"]}>
              {moneyWithUnit(product.price, unit)}
            </span>
            {product.discount ? (
              <span className={styles["product-page__discount"]}>
                {product.discount}
              </span>
            ) : null}
            {product.oldPrice != null ? (
              <span className={styles["product-page__old-price"]}>
                {moneyWithUnit(product.oldPrice, unit)}
              </span>
            ) : null}
          </div>

          <p className={styles["product-page__eta"]}>
            Выполнение заказа {fulfillmentTime}
          </p>

          {showOfficial ? (
            <span className={styles["product-page__official"]}>
              <img src="/assets/seal-check.svg" alt="" width={18} height={18} />
              Официально от Playnox
            </span>
          ) : null}

          <div className={styles["product-page__delivery"]}>
            <div className={styles["product-page__delivery-head"]}>
              <img
                className={styles["product-page__delivery-icon"]}
                src="/catalog/package.svg"
                alt=""
                width={24}
                height={24}
              />
              <div className={styles["product-page__delivery-copy"]}>
                <p className={styles["product-page__delivery-title"]}>
                  {deliveryTitle}
                </p>
                <p className={styles["product-page__delivery-option"]}>
                  {deliveryOption}
                </p>
              </div>
            </div>
            <p className={styles["product-page__delivery-description"]}>
              {deliveryDescription}
            </p>
          </div>

          <div className={styles["product-page__actions"]}>
            <button
              className={`${styles["product-page__favorite"]} ${favorited ? styles["product-page__favorite--on"] : ""}`}
              type="button"
              aria-label={favorited ? "Убрать из избранного" : "В избранное"}
              aria-pressed={favorited}
              onClick={onFavorite}
            >
              <FavoriteHeartIcon filled={favorited} />
            </button>
            <button
              className={styles["product-page__buy"]}
              type="button"
              onClick={onBuy}
              disabled={ownProduct}
              title={
                ownProduct ? "Нельзя купить собственный товар" : undefined
              }
            >
              {ownProduct ? "Ваш товар" : "Купить"}
            </button>
          </div>

          <div className={styles["product-page__trust"]}>
            <p className={styles["product-page__payment-title"]}>
              <img src="/catalog/lock.svg" alt="" width={18} height={18} />
              Безопасная оплата
            </p>
            <div className={styles["product-page__payment-icons"]}>
              {PAYMENT_ICONS.map((src) => (
                <img key={src} src={src} alt="" width={32} height={32} />
              ))}
            </div>
            <a className={styles["product-page__warranty"]} href="#warranty">
              <img src="/catalog/shield.svg" alt="" width={18} height={18} />
              <span>{warrantyText}</span>
              <img
                className={styles["product-page__warranty-arrow"]}
                src="/assets/arrow.svg"
                alt=""
                width={16}
                height={13}
              />
            </a>
          </div>
        </div>
      </section>

      <section className={styles["product-page__section"]}>
        <h2 className={styles["product-page__section-title"]}>Описание</h2>
        <h3 className={styles["product-page__sub-title"]}>
          Как получить товар
        </h3>
        <p className={styles["product-page__description"]}>{howToBody}</p>
        {description.specs ? (
          <p className={styles["product-page__description"]}>
            {description.specs}
          </p>
        ) : null}
        {description.warning ? (
          <p className={styles["product-page__warning"]}>
            <span aria-hidden>⚠️</span>
            {description.warning}
          </p>
        ) : (
          <p className={styles["product-page__warning"]}>
            <span aria-hidden>⚠️</span>
            Не меняйте пароль и email в первые 24 часа после покупки.
          </p>
        )}
        {extraDescription.map((line) => (
          <p key={line} className={styles["product-page__description"]}>
            {line}
          </p>
        ))}
        {visibleBullets.length > 0 ? (
          <ul className={styles["product-page__bullets"]}>
            {visibleBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {description.bullets.length > 2 ? (
          <button
            className={styles["product-page__more-link"]}
            type="button"
            onClick={() => setDescExpanded((current) => !current)}
          >
            {descExpanded ? "свернуть" : "ещё"}
          </button>
        ) : null}
      </section>

      {product.seller ? (
        <section className={styles["product-page__section"]} id="warranty">
          <h2 className={styles["product-page__section-title"]}>Продавец</h2>
          <div className={styles["product-page__seller"]}>
            <span className={styles["product-page__seller-avatar"]}>
              {product.seller.slice(0, 1).toUpperCase()}
            </span>
            <span>
              <span className={styles["product-page__seller-name"]}>
                {product.seller}
                {product.sellerVerified ? (
                  <img
                    src="/catalog/seal-check-blue.svg"
                    alt=""
                    width={18}
                    height={18}
                  />
                ) : null}
              </span>
              {product.sellerSubtitle ? (
                <span className={styles["product-page__seller-subtitle"]}>
                  {product.sellerSubtitle}
                </span>
              ) : null}
            </span>
          </div>
          <SellerReviews sellerId={product.sellerUserId} />
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section className={styles["product-page__recent"]}>
          <div className={styles["product-page__recent-head"]}>
            <h2 className={styles["product-page__section-title"]}>
              👀 Вы смотрели
            </h2>
            <button
              className={styles["product-page__reset-recent"]}
              type="button"
              onClick={() => {
                clearRecentProducts();
                setRecent([]);
              }}
            >
              Сбросить
            </button>
          </div>
          <div className={styles["product-page__grid"]}>
            {recent.slice(0, 4).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      {similar.length > 0 ? (
        <section className={styles["product-page__section"]}>
          <h2 className={styles["product-page__section-title"]}>
            <img src="/catalog/grid.svg" alt="" width={24} height={24} />
            Похожие товары
          </h2>
          <div className={styles["product-page__grid"]}>
            {similar.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
          {similarAll.length > similar.length ? (
            <button
              className={styles["product-page__more"]}
              type="button"
              onClick={() => setSimilarShown((count) => count + SIMILAR_PAGE)}
            >
              Показать еще
            </button>
          ) : null}
        </section>
      ) : null}

      {authOpen ? <AuthGateDialog onClose={() => setAuthOpen(false)} /> : null}
      {checkoutOpen && product ? (
        <CheckoutModal
          product={product}
          onClose={() => setCheckoutOpen(false)}
        />
      ) : null}

      {toast ? (
        <div className={toastStyles["app-toast"]} role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
