"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon/icon";
import Link from "next/link";
import { CategoryChip } from "@/components/ui/category-chip/category-chip";
import { Button } from "@/components/ui/button/button";
import { ArrowButton } from "@/components/ui/arrow-button/arrow-button";
import {
  SELLER_FEE_PERCENT,
  popularSellerItems,
  sellerCategories,
  sellerCategoryTabs,
  sellerGameItems,
  sellerPayoutMethods,
  sellerStats,
} from "@/lib/mock/seller";
import styles from "./seller-content.module.css";

export function SellerContent() {
  const [price, setPrice] = useState(1000);
  const [activeTab, setActiveTab] = useState(0);
  const income = Math.round(price * (1 - SELLER_FEE_PERCENT / 100));

  return (
    <div className={styles.seller}>
      <section className={styles.hero}>
        <Image
          src="/assets/seller-hero.png"
          alt=""
          fill
          className={styles.heroImage}
          priority
        />
        <div className={styles.heroOverlay}>
          <h1 className={styles.heroTitle}>Стать продавцом</h1>
          <p className={styles.heroSubtitle}>Зарабатывайте на продаже товаров и услуг</p>
          <Link href="/sell/start">
            <Button variant="ghost" large>
              Начать продажу
            </Button>
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Платеж ниже в 2 раза</h2>
        <p className={styles.sectionSubtitle}>Калькулятор цены</p>
        <div className={styles.calculator}>
          <div className={styles.calcField}>
            <span className={styles.calcLabel}>Цена товара</span>
            <input
              type="number"
              className={styles.calcValue}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
              aria-label="Цена товара"
              style={{ background: "transparent", border: "none", outline: "none" }}
            />
            <span className={styles.calcHint}>💳 Платеж {SELLER_FEE_PERCENT}%</span>
          </div>
          <Icon
            src="/assets/arrows-down-up-seller.svg"
            width={32}
            height={32}
            className={styles.calcArrow}
          />
          <div className={styles.calcField}>
            <span className={styles.calcLabel}>Доход</span>
            <span className={`${styles.calcValue} ${styles.calcValueAccent}`}>{income} ₽</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Способы выплаты</h2>
        <p className={styles.sectionSubtitle}>Выводите средства удобным вам способом</p>
        <div className={styles.payoutIcons}>
          {sellerPayoutMethods.map((icon) => (
            <Icon key={icon} src={icon} width={40} height={40} className={styles.payoutIcon} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Игры и приложения</h2>
        <div className={styles.tabsRow}>
          {sellerCategoryTabs.map((tab, index) => (
            <CategoryChip
              key={tab.id}
              label={tab.label}
              count={tab.count}
              active={activeTab === index}
              onClick={() => setActiveTab(index)}
            />
          ))}
        </div>
        <div className={styles.gameGrid}>
          {sellerGameItems.map((item) => (
            <div key={item.id} className={styles.gameItem}>
              <div className={styles.gameIconWrapper}>
                <Image
                  src={item.image}
                  alt={item.name}
                  width={80}
                  height={80}
                  className={styles.gameIcon}
                />
                {item.badge ? <span className={styles.gameBadge}>{item.badge}</span> : null}
              </div>
              <span className={styles.gameName}>{item.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Популярные категории</h2>
        <div className={styles.categoryBar}>
          <div className={styles.categoryLinks}>
            {sellerCategories.map((cat) => (
              <span key={cat.id} className={styles.categoryLink}>
                <Icon
                  src={cat.icon}
                  width={24}
                  height={24}
                  className={styles.categoryIcon}
                />
                {cat.label}
              </span>
            ))}
          </div>
          <ArrowButton ariaLabel="Следующие категории" />
        </div>
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

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Статистика</h2>
        <div className={styles.statsGrid}>
          {sellerStats.map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <span className={styles.statEmoji} aria-hidden>
                {stat.emoji}
              </span>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
