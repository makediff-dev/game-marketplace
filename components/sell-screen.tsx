"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { SellerTermsModal } from "@/components/seller-terms-modal";
import { Skeleton } from "@/components/skeleton";
import { LineIcon, type TLineIconName } from "@/components/ui/line-icon";
import { useCurrentUser } from "@/hooks/use-auth";
import {
  useCatalogCategories,
  useCatalogFees,
  useCatalogSegments,
} from "@/hooks/use-catalog";
import { cx } from "@/lib/cx";
import {
  calcIncome,
  catalogCategoryToSellApp,
  readSellerTermsAccepted,
  SELL_WIZARD_FEE_PERCENT,
  writeSellerTermsAccepted,
} from "@/lib/sell-wizard";
import { useUserStore } from "@/store/user.store";
import styles from "@/styles/sell-page.module.scss";

const PAYOUT_METHODS = [
  { src: "/assets/card-ru-36.svg", label: "Карта РФ" },
  { src: "/assets/sbp-36.svg", label: "СБП" },
  { src: "/assets/umoney-36.svg", label: "ЮMoney" },
  { src: "/assets/card-foreign.png", label: "Карта другой страны" },
];

const POPULAR = "popular";


function formatPercent(value: number): string {
  return `${String(value).replace(".", ",")}%`;
}

export function SellScreen() {
  const router = useRouter();
  useCurrentUser();
  const user = useUserStore((state) => state.user);
  const segmentsQuery = useCatalogSegments();
  const categoriesQuery = useCatalogCategories();
  const feesQuery = useCatalogFees();
  const feePercent = feesQuery.data?.feePercent ?? SELL_WIZARD_FEE_PERCENT;
  const minFeePercent = feesQuery.data?.minFeePercent ?? feePercent;
  const terms: Array<{
    icon: TLineIconName;
    label: string;
    value: string;
  }> = [
    {
      icon: "percent",
      label: "Комиссия сервиса",
      value:
        minFeePercent < feePercent
          ? `от ${formatPercent(minFeePercent)}`
          : formatPercent(feePercent),
    },
    { icon: "bolt", label: "Выплаты продавцам", value: "24/7" },
    { icon: "shield", label: "Безопасные сделки", value: "100%" },
    { icon: "trend", label: "Продвижение объявлений", value: "TOP" },
  ];
  const [amount, setAmount] = useState("1000");
  const [group, setGroup] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const segments = segmentsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const hasPopular = categories.some((item) => item.isPopular);
  // Most sellers start from a popular game, so that list opens first.
  const activeGroup =
    group ?? (hasPopular ? POPULAR : (segments[0]?.slug ?? "games"));
  const groups = [
    ...(hasPopular ? [{ slug: POPULAR, name: "Популярное" }] : []),
    ...segments,
  ];

  const apps = useMemo(
    () =>
      (activeGroup === POPULAR
        ? categories
            .filter((item) => item.isPopular)
            .sort((a, b) => a.sortOrder - b.sortOrder)
        : categories.filter(
            (item) => (item.segmentSlug ?? "games") === activeGroup,
          )
      ).map(catalogCategoryToSellApp),
    [categories, activeGroup],
  );

  useEffect(() => {
    setTermsAccepted(readSellerTermsAccepted());
  }, []);

  useEffect(() => {
    if (user && !readSellerTermsAccepted()) {
      setTermsOpen(true);
    }
  }, [user]);

  const payout = useMemo(() => {
    const value = Number(amount.replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      return 0;
    }

    return calcIncome(value, feePercent);
  }, [amount, feePercent]);

  const showHero = !user || !termsAccepted;
  const loading =
    (segmentsQuery.isLoading && !segmentsQuery.data) ||
    (categoriesQuery.isLoading && !categoriesQuery.data);

  function handleStart() {
    if (!user) {
      router.push("/login?returnUrl=/sell");
      return;
    }

    if (!termsAccepted) {
      setTermsOpen(true);
    }
  }

  function handleAcceptTerms() {
    writeSellerTermsAccepted();
    setTermsAccepted(true);
    setTermsOpen(false);
  }

  function handleSelectGame(gameId: string) {
    const createUrl = `/sell/create?game=${gameId}`;

    if (!user) {
      router.push(`/login?returnUrl=${encodeURIComponent(createUrl)}`);
      return;
    }

    if (!readSellerTermsAccepted()) {
      setTermsOpen(true);
      return;
    }

    router.push(createUrl);
  }

  return (
    <div className={styles["sell-page"]}>
      <div className={styles["sell-page__body"]}>
        <div className={styles["sell-page__main"]}>
          {showHero ? (
            <section
              className={styles["sell-page__hero"]}
              aria-label="Стать продавцом"
            >
              <img
                className={styles["sell-page__hero-image"]}
                src="/assets/seller-hero.jpg"
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
              <div className={styles["sell-page__hero-content"]}>
                <div className={styles["sell-page__hero-title-block"]}>
                  <img
                    src="/assets/shopping-bag.svg"
                    alt=""
                    width={24}
                    height={24}
                  />
                  <h1 className={styles["sell-page__hero-title"]}>
                    Стать продавцом
                  </h1>
                  <p className={styles["sell-page__hero-subtitle"]}>
                    Зарабатывайте на продаже товаров и услуг
                  </p>
                </div>
                <button
                  type="button"
                  className={styles["sell-page__hero-button"]}
                  onClick={handleStart}
                >
                  Начать продажу
                </button>
              </div>
            </section>
          ) : null}

          <section
            className={styles["sell-page__catalog"]}
            aria-labelledby="sell-catalog-title"
          >
            <div className={styles["sell-page__heading"]}>
              <h2
                id="sell-catalog-title"
                className={styles["sell-page__section-title"]}
              >
                Игры и приложения
              </h2>
              <p className={styles["sell-page__section-subtitle"]}>
                Выберите категорию, чтобы создать объявление
              </p>
            </div>

            <div className={styles["sell-page__chips"]}>
              {groups.map((item) => (
                <button
                  key={item.slug}
                  className={cx(
                    styles["sell-page__chip"],
                    activeGroup === item.slug && styles["sell-page__chip--on"],
                  )}
                  type="button"
                  aria-pressed={activeGroup === item.slug}
                  onClick={() => setGroup(item.slug)}
                >
                  {item.name}
                </button>
              ))}
            </div>

            {loading ? (
              <div className={styles["sell-page__games"]} aria-busy="true">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className={styles["sell-page__game-skeleton"]}
                    radius={16}
                  />
                ))}
              </div>
            ) : apps.length === 0 ? (
              <p className={styles["sell-page__empty"]}>
                В этом разделе пока нет игр
              </p>
            ) : (
              <div className={styles["sell-page__games"]}>
                {apps.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    className={styles["sell-page__game"]}
                    onClick={() => handleSelectGame(app.gameId)}
                  >
                    <span className={styles["sell-page__game-media"]}>
                      <img
                        className={styles["sell-page__game-icon"]}
                        src={app.image}
                        alt=""
                        width={48}
                        height={48}
                      />
                      {app.badge ? (
                        <span
                          className={styles["sell-page__game-badge"]}
                          aria-hidden
                        >
                          {app.badge}
                        </span>
                      ) : null}
                    </span>
                    <span className={styles["sell-page__game-text"]}>
                      <span className={styles["sell-page__game-name"]}>
                        <span className={styles["sell-page__game-title"]}>
                          {app.name}
                        </span>
                      </span>
                      <span className={styles["sell-page__game-action"]}>
                        Создать объявление
                      </span>
                    </span>
                    <LineIcon
                      className={styles["sell-page__game-arrow"]}
                      name="chevron"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside
          className={styles["sell-page__panel"]}
          aria-label="Выплаты и условия"
        >
          <section className={styles["sell-page__panel-section"]}>
            <h2 className={styles["sell-page__panel-title"]}>
              Сколько вы получите
            </h2>
            <div className={styles["sell-page__calculator"]}>
              <label className={styles["sell-page__calc-field"]}>
                <span className={styles["sell-page__calc-label"]}>
                  Цена товара
                </span>
                <span className={styles["sell-page__calc-value"]}>
                  <input
                    className={styles["sell-page__calc-input"]}
                    inputMode="decimal"
                    value={amount}
                    // Sized to the digits so the ruble sign stays next to them.
                    style={{ width: `${Math.max(amount.length, 1) + 0.5}ch` }}
                    aria-label="Цена товара"
                    onChange={(event) => setAmount(event.target.value)}
                  />
                  <span>₽</span>
                </span>
              </label>
              <div
                className={cx(
                  styles["sell-page__calc-field"],
                  styles["sell-page__calc-field--result"],
                )}
              >
                <span className={styles["sell-page__calc-label"]}>
                  К выплате
                </span>
                <span className={styles["sell-page__calc-value"]}>
                  <span aria-live="polite">
                    {new Intl.NumberFormat("ru-RU").format(payout)}
                  </span>
                  <span>₽</span>
                </span>
              </div>
            </div>
            <p className={styles["sell-page__calc-hint"]}>
              Комиссия сервиса — {formatPercent(feePercent)}
              {minFeePercent < feePercent ? ", в некоторых категориях меньше" : ""}
            </p>
          </section>

          <section className={styles["sell-page__panel-section"]}>
            <h2 className={styles["sell-page__panel-title"]}>Условия</h2>
            <ul className={styles["sell-page__terms"]}>
              {terms.map((item) => (
                <li key={item.label} className={styles["sell-page__term"]}>
                  <LineIcon
                    className={styles["sell-page__term-icon"]}
                    name={item.icon}
                  />
                  <span className={styles["sell-page__term-label"]}>
                    {item.label}
                  </span>
                  <span className={styles["sell-page__term-value"]}>
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles["sell-page__panel-section"]}>
            <h2 className={styles["sell-page__panel-title"]}>
              Способы выплаты
            </h2>
            <ul className={styles["sell-page__payouts"]}>
              {PAYOUT_METHODS.map((item) => (
                <li key={item.src} className={styles["sell-page__payout"]}>
                  <img src={item.src} alt="" width={28} height={28} />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <SellerTermsModal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccept={handleAcceptTerms}
      />
    </div>
  );
}
