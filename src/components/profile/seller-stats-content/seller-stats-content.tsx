"use client";

import { useMemo, useState } from "react";
import {
  formatStatsChange,
  formatStatsCurrency,
  getSellerStats,
  statsPeriodOptions,
  type StatsPeriod,
} from "@/lib/mock/seller-stats";
import styles from "./seller-stats-content.module.css";

function formatMinutes(value: number): string {
  if (value < 60) {
    return `${value} мин`;
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  if (minutes === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч ${minutes} мин`;
}

export function SellerStatsContent() {
  const [period, setPeriod] = useState<StatsPeriod>("30d");
  const stats = getSellerStats(period);

  const maxDailyRevenue = useMemo(
    () => Math.max(...stats.dailyRevenue.map((point) => point.value), 1),
    [stats.dailyRevenue],
  );

  return (
    <div className={styles.dashboard}>
      <div className={styles.periodRow} role="group" aria-label="Период статистики">
        {statsPeriodOptions.map((option) => {
          const isActive = period === option.id;

          return (
            <button
              key={option.id}
              type="button"
              className={[styles.periodPill, isActive ? styles.periodPillActive : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setPeriod(option.id)}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <section className={styles.kpiGrid} aria-label="Ключевые показатели">
        <article className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Выручка {stats.periodLabel}</span>
          <strong className={styles.kpiValue}>{formatStatsCurrency(stats.revenue)}</strong>
          <span
            className={[
              styles.kpiChange,
              stats.revenueChange >= 0 ? styles.kpiChangePositive : styles.kpiChangeNegative,
            ].join(" ")}
          >
            {formatStatsChange(stats.revenueChange)} к прошлому периоду
          </span>
        </article>

        <article className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Продажи</span>
          <strong className={styles.kpiValue}>{stats.ordersCount}</strong>
          <span
            className={[
              styles.kpiChange,
              stats.ordersChange >= 0 ? styles.kpiChangePositive : styles.kpiChangeNegative,
            ].join(" ")}
          >
            {formatStatsChange(stats.ordersChange)} к прошлому периоду
          </span>
        </article>

        <article className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Средний чек</span>
          <strong className={styles.kpiValue}>{formatStatsCurrency(stats.averageOrderValue)}</strong>
          <span className={styles.kpiHint}>на одну сделку</span>
        </article>

        <article className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Успешных сделок</span>
          <strong className={styles.kpiValue}>{stats.successRate}%</strong>
          <span className={styles.kpiHint}>без отмен и споров</span>
        </article>
      </section>

      <section className={styles.panel} aria-labelledby="sales-chart-title">
        <div className={styles.panelHeader}>
          <h2 id="sales-chart-title" className={styles.panelTitle}>
            Динамика продаж
          </h2>
          <span className={styles.panelCaption}>{stats.periodLabel}</span>
        </div>

        <div className={styles.chart} role="img" aria-label="График выручки по периоду">
          {stats.dailyRevenue.map((point) => {
            const height = Math.round((point.value / maxDailyRevenue) * 100);

            return (
              <div key={point.label} className={styles.chartColumn}>
                <span className={styles.chartValue}>{formatStatsCurrency(point.value)}</span>
                <div className={styles.chartBarTrack}>
                  <div className={styles.chartBarFill} style={{ height: `${height}%` }} />
                </div>
                <span className={styles.chartLabel}>{point.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className={styles.splitGrid}>
        <section className={styles.panel} aria-labelledby="top-products-title">
          <div className={styles.panelHeader}>
            <h2 id="top-products-title" className={styles.panelTitle}>
              Популярные товары
            </h2>
            <span className={styles.panelCaption}>по количеству продаж</span>
          </div>

          <ol className={styles.topProductsList}>
            {stats.topProducts.map((product, index) => (
              <li key={product.id} className={styles.topProductRow}>
                <span className={styles.topProductRank}>{index + 1}</span>
                <div className={styles.topProductInfo}>
                  <span className={styles.topProductTitle}>{product.title}</span>
                  <span className={styles.topProductMeta}>
                    {product.salesCount} продаж · {formatStatsCurrency(product.revenue)}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.panel} aria-labelledby="insights-title">
          <div className={styles.panelHeader}>
            <h2 id="insights-title" className={styles.panelTitle}>
              Полезные метрики
            </h2>
            <span className={styles.panelCaption}>для оптимизации продаж</span>
          </div>

          <ul className={styles.insightsList}>
            <li className={styles.insightRow}>
              <span className={styles.insightLabel}>Среднее время ответа</span>
              <strong className={styles.insightValue}>{formatMinutes(stats.avgResponseMinutes)}</strong>
            </li>
            <li className={styles.insightRow}>
              <span className={styles.insightLabel}>Повторные покупатели</span>
              <strong className={styles.insightValue}>{stats.repeatBuyersPercent}%</strong>
            </li>
            <li className={styles.insightRow}>
              <span className={styles.insightLabel}>Активные лоты</span>
              <strong className={styles.insightValue}>{stats.activeListings}</strong>
            </li>
            <li className={styles.insightRow}>
              <span className={styles.insightLabel}>Конверсия просмотров</span>
              <strong className={styles.insightValue}>{stats.viewsToPurchasePercent}%</strong>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
