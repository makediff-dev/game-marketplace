"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { PromosApi } from "@/api/promos.api";
import { CashbackProgress } from "@/components/cashback-progress";
import { ProductCard } from "@/components/product-card";
import { PromoModal } from "@/components/promo-modal";
import { CatalogPageSkeleton } from "@/components/skeleton";
import { TopupPaymentModal } from "@/components/topup-payment-modal";
import { useCurrentUser } from "@/hooks/use-auth";
import {
  useCatalogCategories,
  useCatalogProducts,
  useHeroBanners,
} from "@/hooks/use-catalog";
import { useCashbackProgress } from "@/hooks/use-profile";
import { categoryHref } from "@/lib/catalog";
import { cx } from "@/lib/cx";
import styles from "@/styles/catalog.module.scss";
import type { TCatalogCategory, THeroBanner } from "@/types/catalog";
import type { TPromoQuote } from "@/types/promos";

const DEFAULT_TOPUP_FEE = 0.05;

const SLIDE_INTERVAL_MS = 5000;

const PAGE_SIZE = 4;

const FALLBACK_SLIDES: THeroBanner[] = [
  {
    id: 0,
    title: "Предзаказ 20 июня",
    caption: "",
    image: "/assets/hero-gta6.jpg",
    objectPosition: "center",
    sortOrder: 1,
  },
  {
    id: -1,
    title: "Ключи и подписки",
    caption: "Ключи и подписки",
    image: "/assets/hero-gta6.jpg",
    objectPosition: "20% center",
    sortOrder: 2,
  },
  {
    id: -2,
    title: "Пополнение за пару минут",
    caption: "Пополнение за пару минут",
    image: "/assets/hero-gta6.jpg",
    objectPosition: "80% center",
    sortOrder: 3,
  },
];

type TTopupService = {
  id: string;
  title: string;
  icon: string;
  label: string;
  badge?: string;
  accountPlaceholder: string;
  accountTooltip: string;
};

function topupAccountCopy(category: TCatalogCategory): {
  accountPlaceholder: string;
  accountTooltip: string;
} {
  switch (category.slug) {
    case "telegram":
      return {
        accountPlaceholder: "@username",
        accountTooltip: "Укажите username Telegram без символа @",
      };
    case "psn":
      return {
        accountPlaceholder: "PSN ID или email",
        accountTooltip:
          "Укажите PSN ID или email аккаунта PlayStation Network",
      };
    case "xbox":
      return {
        accountPlaceholder: "Gamertag Xbox",
        accountTooltip:
          "Введите Gamertag аккаунта Xbox для пополнения баланса",
      };
    default:
      return {
        accountPlaceholder: `Логин ${category.name}`,
        accountTooltip: `Введите логин аккаунта ${category.name} для пополнения`,
      };
  }
}

function toTopupService(category: TCatalogCategory): TTopupService {
  const account = topupAccountCopy(category);

  return {
    id: category.slug,
    title: `Пополнить ${category.name}`,
    icon: category.icon,
    label: category.name,
    badge: category.badge,
    accountPlaceholder: account.accountPlaceholder,
    accountTooltip: account.accountTooltip,
  };
}

const CURRENCIES = [
  {
    id: "rub",
    symbol: "₽",
    icon: "/catalog/currency-rub.svg",
    label: "Рубли",
  },
  {
    id: "usd",
    symbol: "$",
    // ?v=2: the files were swapped once, caches still hold the old pair.
    icon: "/catalog/currency-usd.svg?v=2",
    label: "Доллары",
  },
  {
    id: "kzt",
    symbol: "₸",
    icon: "/catalog/currency-kzt.svg?v=2",
    label: "Тенге",
  },
] as const;

const APP_SIZE = 80;
const APP_MIN_GAP = 12;
const APP_MAX_GAP = 28;

function money(amount: number, symbol = "₽"): string {
  const value = new Intl.NumberFormat("ru-RU").format(amount);
  return symbol ? `${value} ${symbol}` : value;
}

export function CatalogScreen() {
  const { data: user } = useCurrentUser();
  const categoriesQuery = useCatalogCategories();
  const productsQuery = useCatalogProducts();
  const heroBannersQuery = useHeroBanners();
  const cashbackQuery = useCashbackProgress(Boolean(user));
  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const slides =
    heroBannersQuery.data && heroBannersQuery.data.length > 0
      ? heroBannersQuery.data
      : FALLBACK_SLIDES;
  const catalogLoading = categoriesQuery.isLoading || productsQuery.isLoading;
  const catalogError = categoriesQuery.isError || productsQuery.isError;

  const [slide, setSlide] = useState(0);
  const [bannerWidth, setBannerWidth] = useState(0);
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [currencyId, setCurrencyId] =
    useState<(typeof CURRENCIES)[number]["id"]>("rub");
  const [login, setLogin] = useState("");
  const [amount, setAmount] = useState("1000");
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [promo, setPromo] = useState("");
  const [promoQuote, setPromoQuote] = useState<TPromoQuote | null>(null);
  const promoRequestRef = useRef(0);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const appsTrackRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const topupServices = useMemo(
    () =>
      categories
        .filter((item) => item.showInTopup)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(toTopupService),
    [categories],
  );

  useEffect(() => {
    if (topupServices.length === 0) {
      setServiceId(null);
      return;
    }

    if (!serviceId || !topupServices.some((item) => item.id === serviceId)) {
      setServiceId(topupServices[0].id);
    }
  }, [topupServices, serviceId]);

  useEffect(() => {
    function onSearch(event: Event) {
      const detail = (event as CustomEvent<string>).detail;
      setQuery(detail);
      setExpanded(true);
    }

    window.addEventListener("playnox-catalog-search", onSearch);
    return () => window.removeEventListener("playnox-catalog-search", onSearch);
  }, []);

  useEffect(() => {
    setSlide((current) =>
      slides.length === 0 ? 0 : Math.min(current, slides.length - 1),
    );
  }, [slides.length]);

  useEffect(() => {
    const node = bannerRef.current;
    if (!node || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const syncWidth = () => {
      setBannerWidth(node.getBoundingClientRect().width);
    };

    syncWidth();
    const observer = new ResizeObserver(syncWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = appsTrackRef.current;
    if (!track || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    // Spread the slack so only whole icons are visible and both arrows
    // sit at the same distance from them.
    const layout = () => {
      const style = getComputedStyle(track);
      const width =
        track.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      const fit = Math.floor((width + APP_MIN_GAP) / (APP_SIZE + APP_MIN_GAP));
      const spread =
        fit > 1 && track.children.length > fit
          ? (width - fit * APP_SIZE) / (fit - 1)
          : APP_MIN_GAP;
      // On narrow screens a peeking icon reads better than huge gaps.
      const gap = spread > APP_MAX_GAP ? APP_MIN_GAP : spread;
      track.style.setProperty("--apps-gap", `${gap}px`);

      track
        .querySelectorAll<HTMLElement>("[data-app-name]")
        .forEach((name) => {
          name.toggleAttribute(
            "data-clipped",
            name.scrollWidth > name.clientWidth,
          );
        });
    };

    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(track);
    return () => observer.disconnect();
  }, [categories.length]);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || slides.length < 2) {
      return;
    }

    // Restart the full interval after every slide change (auto or manual),
    // so manual clicks never race the old setInterval tick.
    const timer = window.setTimeout(() => {
      setSlide((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [slide, slides.length]);

  const service =
    topupServices.find((item) => item.id === serviceId) ??
    topupServices[0] ??
    null;
  const currency =
    CURRENCIES.find((item) => item.id === currencyId) ?? CURRENCIES[0];
  const amountNumber = Number(amount.replace(/\s/g, "").replace(",", "."));
  const feeRate =
    promoQuote?.valid === true ? promoQuote.feeRate : DEFAULT_TOPUP_FEE;
  const payable =
    promoQuote?.valid === true && Number.isFinite(amountNumber)
      ? promoQuote.payable
      : Number.isFinite(amountNumber)
        ? Math.max(0, Math.round(amountNumber * (1 + feeRate)))
        : 0;
  const feeBadge =
    promoQuote?.valid === true
      ? promoQuote.badgeLabel
      : `${Math.round(DEFAULT_TOPUP_FEE * 100)}%`;
  const selectedCategory =
    categories.find((item) => item.slug === categorySlug) ?? null;
  const needle = query.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesCategory =
      !categorySlug || product.categorySlug === categorySlug;
    const matchesQuery =
      !needle ||
      product.title.toLowerCase().includes(needle) ||
      product.game.toLowerCase().includes(needle) ||
      product.productType.toLowerCase().includes(needle);

    return matchesCategory && matchesQuery;
  });
  const visible = expanded ? filtered : filtered.slice(0, PAGE_SIZE);

  function shiftSlide(step: number) {
    setSlide((current) => (current + step + slides.length) % slides.length);
  }

  function shiftApps(step: number) {
    const track = appsTrackRef.current;
    if (!track) {
      return;
    }

    const gap = parseFloat(getComputedStyle(track).columnGap) || APP_MIN_GAP;
    track.scrollBy({ left: step * 2 * (APP_SIZE + gap), behavior: "smooth" });
  }

  useEffect(() => {
    const code = promo.trim();

    if (!code) {
      return;
    }

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return;
    }

    const requestId = ++promoRequestRef.current;
    const timer = window.setTimeout(async () => {
      try {
        const quote = await PromosApi.getInstance().validate({
          code,
          context: "topup",
          amount: amountNumber,
          currency: currencyId,
        });

        if (requestId !== promoRequestRef.current) {
          return;
        }

        if (quote.valid) {
          setPromoQuote((current) => {
            if (
              current &&
              current.payable === quote.payable &&
              current.feeRate === quote.feeRate &&
              current.badgeLabel === quote.badgeLabel
            ) {
              return current;
            }

            return quote;
          });
        } else {
          setPromoQuote(null);
          setPromo("");
        }
      } catch {
        if (requestId !== promoRequestRef.current) {
          return;
        }

        setPromoQuote(null);
        setPromo("");
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [promo, amountNumber, currencyId]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function clearPromo() {
    promoRequestRef.current += 1;
    setPromo("");
    setPromoQuote(null);
  }

  function submitTopup() {
    setLoginError(null);
    setAmountError(null);

    if (!login.trim()) {
      setLoginError("Введите логин");
      setToast("Введите логин");
      return;
    }

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setAmountError("Введите сумму");
      setToast("Введите сумму");
      return;
    }

    setPaymentOpen(true);
  }

  if (catalogLoading && categories.length === 0 && products.length === 0) {
    return <CatalogPageSkeleton />;
  }

  return (
    <div className={styles["catalog"]}>
      <section className={styles["catalog__hero"]} aria-label="Предзаказ" aria-roledescription="carousel">
        <div className={styles["catalog__hero-frame"]}>
          <div className={styles["catalog__banner"]} ref={bannerRef}>
            <div
              className={styles["catalog__banner-track"]}
              style={{
                transform:
                  bannerWidth > 0
                    ? `translate3d(-${slide * bannerWidth}px, 0, 0)`
                    : undefined,
              }}
            >
              {slides.map((item, index) => {
                // The first slide is the largest paint on the home page.
                const image = (
                  <img
                    className={styles["catalog__banner-image"]}
                    src={item.image}
                    alt={item.title}
                    draggable={false}
                    fetchPriority={index === 0 ? "high" : "low"}
                    loading={index === 0 ? "eager" : "lazy"}
                    style={{
                      objectPosition: item.objectPosition || "center",
                      width: bannerWidth > 0 ? bannerWidth : undefined,
                    }}
                  />
                );

                return (
                  <div
                    key={item.id}
                    className={styles["catalog__banner-slide"]}
                    style={
                      bannerWidth > 0
                        ? {
                            width: bannerWidth,
                            minWidth: bannerWidth,
                            maxWidth: bannerWidth,
                          }
                        : undefined
                    }
                  >
                    {item.href ? (
                      <a href={item.href} className={styles["catalog__banner-link"]}>
                        {image}
                      </a>
                    ) : (
                      image
                    )}
                    {item.caption ? (
                      <p className={styles["catalog__caption"]}>
                        {item.caption}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <button
              className={styles["catalog__banner-prev"]}
              type="button"
              aria-label="Предыдущий баннер"
              onClick={() => shiftSlide(-1)}
            >
              <img src="/catalog/arrow-prev.svg" alt="" width={48} height={49} />
            </button>
            <button
              className={styles["catalog__banner-next"]}
              type="button"
              aria-label="Следующий баннер"
              onClick={() => shiftSlide(1)}
            >
              <img src="/catalog/arrow-next.svg" alt="" width={48} height={49} />
            </button>
            <span className={styles["catalog__dots"]}>
              {slides.map((item, index) => (
                <button
                  key={item.id}
                  className={cx(
                    styles["catalog__dot"],
                    index === slide && styles["catalog__dot--on"],
                  )}
                  type="button"
                  aria-label={`Баннер ${index + 1}`}
                  aria-current={index === slide ? "true" : undefined}
                  onClick={() => setSlide(index)}
                />
              ))}
            </span>
          </div>
        </div>
      </section>

      {user && cashbackQuery.data ? (
        <CashbackProgress data={cashbackQuery.data} />
      ) : null}

      {service ? (
      <section className={styles["catalog__topup"]} aria-label={service.title}>
        <div className={styles["catalog__pay-grid"]}>
          {topupServices.map((item) => (
            <button
              key={item.id}
              className={cx(
                styles["catalog__pay-tile"],
                serviceId === item.id
                  ? styles["catalog__pay-tile--on"]
                  : styles["catalog__pay-tile--off"],
              )}
              type="button"
              aria-label={item.label}
              aria-pressed={serviceId === item.id}
              onClick={() => {
                setServiceId(item.id);
                setLoginError(null);
                setAmountError(null);
              }}
            >
              {item.badge ? (
                <span className={styles["catalog__pay-badge"]}>
                  {item.badge}
                </span>
              ) : null}
              <img src={item.icon} alt="" width={32} height={32} />
            </button>
          ))}
        </div>
        <form
          className={styles["catalog__topup-panel"]}
          onSubmit={(event) => {
            event.preventDefault();
            submitTopup();
          }}
        >
          <div className={styles["catalog__topup-copy"]}>
            <div className={styles["catalog__topup-title-row"]}>
              <h2 className={styles["catalog__topup-title"]}>
                {service.title}
              </h2>
              <span className={styles["catalog__percent"]}>{feeBadge}</span>
            </div>
            {promoQuote?.valid ? (
              <div className={cx(
                styles["catalog__promo-field"],
                styles["catalog__promo-field--ok"],
              )} title={promoQuote.message}>
                <span className={styles["catalog__promo-input"]}>{promo}</span>
                <button
                  className={styles["catalog__promo-clear"]}
                  type="button"
                  aria-label="Сбросить промокод"
                  onClick={clearPromo}
                >
                  <img src="/auth/close.svg" alt="" width={20} height={20} />
                </button>
              </div>
            ) : (
              <button
                className={styles["catalog__promo"]}
                type="button"
                aria-haspopup="dialog"
                onClick={() => setPromoModalOpen(true)}
              >
                Ввести промокод
                <img src="/catalog/promo.svg" alt="" width={24} height={25} />
              </button>
            )}
          </div>
          <div className={styles["catalog__fields"]}>
            <div className={styles["catalog__field-block"]}>
              <label
                className={cx(
                  styles["catalog__field"],
                  loginError && styles["catalog__field--invalid"],
                )}
              >
                <input
                  className={styles["catalog__login-input"]}
                  value={login}
                  placeholder={service.accountPlaceholder}
                  aria-label={service.accountPlaceholder}
                  aria-invalid={Boolean(loginError)}
                  onChange={(event) => {
                    setLogin(event.target.value);
                    if (loginError) {
                      setLoginError(null);
                    }
                  }}
                />
                <span className={styles["catalog__info-button"]}>
                  <button
                    className={styles["catalog__info-trigger"]}
                    type="button"
                    aria-label="Подсказка"
                    aria-describedby="topup-login-hint"
                  >
                    <img
                      src="/catalog/info.svg"
                      alt=""
                      width={24}
                      height={24}
                    />
                  </button>
                  <span
                    id="topup-login-hint"
                    className={styles["catalog__info-tooltip"]}
                    role="tooltip"
                  >
                    {service.accountTooltip}
                  </span>
                </span>
              </label>
            </div>
            <div className={styles["catalog__field-block"]}>
              <div
                className={cx(
                  styles["catalog__amount"],
                  amountError && styles["catalog__amount--invalid"],
                )}
              >
                <label>
                  <span className={styles["catalog__amount-label"]}>Сумма</span>
                  <input
                    className={styles["catalog__amount-input"]}
                    inputMode="decimal"
                    value={amount}
                    aria-label="Сумма"
                    aria-invalid={Boolean(amountError)}
                    onChange={(event) => {
                      setAmount(event.target.value);
                      if (amountError) {
                        setAmountError(null);
                      }
                    }}
                  />
                </label>
                <span className={styles["catalog__currencies"]}>
                  {CURRENCIES.map((item) => (
                    <button
                      key={item.id}
                      className={cx(
                        styles["catalog__currency"],
                        currencyId === item.id && styles["catalog__currency--on"],
                      )}
                      type="button"
                      aria-label={item.label}
                      aria-pressed={currencyId === item.id}
                      onClick={() => setCurrencyId(item.id)}
                    >
                      <img src={item.icon} alt="" width={24} height={24} />
                    </button>
                  ))}
                </span>
              </div>
            </div>
          </div>
          <div className={styles["catalog__pay-block"]}>
            <button className={styles["catalog__pay"]} type="submit">
              Оплатить {money(payable, "")}
              <span className={styles["catalog__pay-currency"]}>
                {currency.symbol}
              </span>
            </button>
          </div>
        </form>
      </section>
      ) : null}

      {categories.length > 0 && (
        <section className={styles["catalog__apps-slider"]} aria-label="Игры">
          <div className={styles["catalog__apps-frame"]}>
            <div className={styles["catalog__apps-viewport"]}>
              <div className={styles["catalog__apps-track"]} ref={appsTrackRef}>
                {categories.map((app) => (
                  <Link
                    key={app.slug}
                    className={
                      categorySlug === app.slug
                        ? `${styles["catalog__app"]} ${styles["catalog__app--on"]}`
                        : styles["catalog__app"]
                    }
                    href={categoryHref(app.slug)}
                    onClick={() => setCategorySlug(app.slug)}
                  >
                    <span className={styles["catalog__app-icon"]}>
                      <span className={styles["catalog__app-icon-media"]}>
                        <img src={app.icon} alt="" width={80} height={80} />
                      </span>
                      {app.badge ? (
                        <span className={styles["catalog__badge"]}>
                          {app.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className={styles["catalog__app-name"]} data-app-name>
                      {app.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <button
              className={styles["catalog__apps-prev"]}
              type="button"
              aria-label="Предыдущие игры"
              onClick={() => shiftApps(-1)}
            >
              <img
                src="/catalog/arrow-prev.svg"
                alt=""
                width={48}
                height={49}
              />
            </button>
            <button
              className={styles["catalog__apps-next"]}
              type="button"
              aria-label="Следующие игры"
              onClick={() => shiftApps(1)}
            >
              <img
                src="/catalog/arrow-next.svg"
                alt=""
                width={48}
                height={49}
              />
            </button>
          </div>
        </section>
      )}

      <section className={styles["catalog__heading"]}>
        <div>
          <h1 className={styles["catalog__title"]}>Каталог цифровых товаров</h1>
          <p className={styles["catalog__subtitle"]}>
            {selectedCategory
              ? selectedCategory.name
              : "Аккаунты, валюта, ключ, буст и подписки"}
          </p>
        </div>
        <Link className={styles["catalog__categories"]} href="/catalog">
          <img src="/catalog/grid.svg" alt="" width={24} height={24} />
          Все категории
        </Link>
      </section>

      <section className={styles["catalog__products"]}>
        <h2 className={styles["catalog__popular"]}>
          <img src="/catalog/heart.svg" alt="" width={24} height={24} />
          Самые популярные товары
        </h2>
        {catalogLoading ? (
          <div className={styles["catalog__grid"]} aria-busy="true" aria-label="Загрузка">
            {Array.from({ length: 4 }).map((_, index) => (
              <span
                key={index}
                className={styles["catalog__card-skeleton"]}
                aria-hidden
              />
            ))}
          </div>
        ) : catalogError ? (
          <p className={styles["catalog__empty"]}>
            Не удалось загрузить товары
          </p>
        ) : visible.length === 0 ? (
          <p className={styles["catalog__empty"]}>Нет товаров</p>
        ) : (
          <div className={styles["catalog__grid"]}>
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        {filtered.length > PAGE_SIZE && (
          <button
            className={styles["catalog__more"]}
            type="button"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? "Скрыть" : "Показать еще"}
          </button>
        )}
      </section>

      {promoModalOpen ? (
        <PromoModal
          amount={amountNumber}
          currency={currencyId}
          onClose={() => setPromoModalOpen(false)}
          onApplied={(quote, code) => {
            setPromo(code);
            setPromoQuote(quote);
            setPromoModalOpen(false);
            setToast(quote.message || "Промокод применён");
          }}
        />
      ) : null}

      {paymentOpen ? (
        <TopupPaymentModal
          amountLabel={money(payable, currency.symbol)}
          onClose={() => setPaymentOpen(false)}
        />
      ) : null}

      {toast ? (
        <div className={styles["catalog__toast"]} role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
