"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon/icon";
import { SellerTermsModal } from "@/components/seller/seller-terms-modal/seller-terms-modal";
import { SellerAppGrid } from "@/components/seller/seller-app-grid/seller-app-grid";
import { SellerCategoryBar } from "@/components/seller/seller-category-bar/seller-category-bar";
import { CategoryChip } from "@/components/ui/category-chip/category-chip";
import { formatPrice } from "@/lib/mock/products";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  SELLER_FEE_PERCENT,
  popularSellerItems,
  sellerCategories,
  sellerCategoryTabs,
  sellerPayoutMethods,
  sellerStats,
} from "@/lib/mock/seller";
import type { GameGroup } from "@/lib/mock/games";
import styles from "./seller-content.module.css";

interface SellerContentProps {
  initialTermsOpen?: boolean;
}

export function SellerContent({ initialTermsOpen = false }: SellerContentProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const sellerTermsAccepted = useAuthStore((state) => state.sellerTermsAccepted);
  const acceptSellerTerms = useAuthStore((state) => state.acceptSellerTerms);
  const [price, setPrice] = useState(1000);
  const [activeTab, setActiveTab] = useState<GameGroup>("games");
  const [isTermsOpen, setIsTermsOpen] = useState(initialTermsOpen);
  const income = Math.round(price * (1 - SELLER_FEE_PERCENT / 100));
  const showHeroBanner = !isAuthenticated || !sellerTermsAccepted;

  useEffect(() => {
    if (initialTermsOpen && isAuthenticated && !sellerTermsAccepted) {
      setIsTermsOpen(true);
    }
  }, [initialTermsOpen, isAuthenticated, sellerTermsAccepted]);

  const closeTerms = () => {
    setIsTermsOpen(false);

    if (initialTermsOpen) {
      router.replace("/sell");
    }
  };

  const handleAcceptTerms = () => {
    acceptSellerTerms();
    setIsTermsOpen(false);

    if (initialTermsOpen) {
      router.replace("/sell");
    }
  };

  const handleHeroClick = () => {
    if (!isAuthenticated) {
      router.push("/register?returnUrl=/sell");
      return;
    }

    setIsTermsOpen(true);
  };

  const handleGameSelect = (gameId: string) => {
    router.push(`/sell/create?game=${gameId}`);
  };

  return (
    <div className={styles.seller}>
      {showHeroBanner ? (
        <section className={styles.hero} aria-label="Стать продавцом">
          <Image
            src="/assets/seller-hero.jpg"
            alt=""
            fill
            className={styles.heroImage}
            priority
            sizes="1136px"
          />
          <div className={styles.heroContent}>
            <div className={styles.heroTitleBlock}>
              <Icon
                src="/assets/shopping-bag.svg"
                width={24}
                height={24}
                className={styles.heroIcon}
              />
              <h1 className={styles.heroTitle}>Стать продавцом</h1>
              <p className={styles.heroSubtitle}>Зарабатывайте на продаже товаров и услуг</p>
            </div>
            <button type="button" className={styles.heroButton} onClick={handleHeroClick}>
              Начать продажу
            </button>
          </div>
        </section>
      ) : null}

      <div className={styles.body}>
        <div className={styles.main}>
          <section className={`${styles.section} ${styles.gamesSection}`} aria-label="Игры и приложения">
            <h2 className={styles.sectionTitle}>Игры и приложения</h2>
            <div className={styles.tabsRow}>
              {sellerCategoryTabs.map((tab) => (
                <CategoryChip
                  key={tab.id}
                  label={tab.label}
                  count={tab.count}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id as GameGroup)}
                />
              ))}
            </div>
            <SellerAppGrid key={activeTab} group={activeTab} onSelect={handleGameSelect} />
          </section>

          <section
            className={`${styles.section} ${styles.categoriesSection}`}
            aria-label="Популярные категории"
          >
            <h2 className={styles.sectionTitle}>Популярные категории</h2>
            <SellerCategoryBar categories={sellerCategories} />
            <div className={styles.popularGrid}>
              {popularSellerItems.map((item) => (
                <div key={item.id} className={styles.popularItem}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={40}
                    height={40}
                    className={styles.popularIcon}
                  />
                  <div className={styles.popularInfo}>
                    <span className={styles.popularName}>{item.name}</span>
                    <span className={styles.popularSubtitle}>{item.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <section className={styles.section} aria-label="Калькулятор цены">
            <div className={styles.sectionHeading}>
              <h2 className={styles.sectionTitle}>Платеж снизился в 2 раза</h2>
              <p className={styles.sectionSubtitle}>Калькулятор цены</p>
            </div>

            <div className={styles.calculator}>
              <div className={styles.calcField}>
                <span className={styles.calcLabel}>Цена товара</span>
                <div className={styles.calcValueRow}>
                  <input
                    type="text"
                    inputMode="numeric"
                    className={styles.calcInput}
                    size={Math.max(formatPrice(price).length, 1)}
                    value={formatPrice(price)}
                    onChange={(event) => {
                      const raw = event.target.value.replace(/\s/g, "");
                      setPrice(Number(raw) || 0);
                    }}
                    aria-label="Цена товара"
                  />
                  <span className={styles.calcCurrency}>₽</span>
                </div>
              </div>

              <Icon
                src="/assets/arrows-down-up-seller.svg"
                width={32}
                height={32}
                className={styles.calcArrow}
              />

              <div className={styles.calcField}>
                <span className={styles.calcLabel}>Доход</span>
                <div className={`${styles.calcValueRow} ${styles.calcValueAccent}`}>
                  <span className={styles.calcOutput}>{formatPrice(income)}</span>
                  <span className={styles.calcCurrency}>₽</span>
                </div>
              </div>
            </div>

            <p className={styles.calcHint}>💳 Платеж {SELLER_FEE_PERCENT}%</p>
          </section>

          <section className={styles.section} aria-label="Способы выплаты">
            <div className={styles.sectionHeading}>
              <h2 className={styles.sectionTitle}>Способы выплаты</h2>
              <p className={styles.sectionSubtitle}>Выводите средства удобным вам способом</p>
            </div>
            <div className={styles.payoutIcons}>
              {sellerPayoutMethods.map((icon) => (
                <div key={icon} className={styles.payoutIconWrapper}>
                  <Icon src={icon} width={36} height={36} className={styles.payoutIcon} />
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className={`${styles.section} ${styles.statsSection}`} aria-label="Статистика">
        <h2 className={styles.sectionTitle}>Статистика</h2>
        <div className={styles.statsGrid}>
          {sellerStats.map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <span className={styles.statEmoji} aria-hidden>
                {stat.emoji}
              </span>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SellerTermsModal
        isOpen={isTermsOpen}
        onClose={closeTerms}
        onAccept={handleAcceptTerms}
      />
    </div>
  );
}
