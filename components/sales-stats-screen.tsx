"use client";

import { useState } from "react";

import { BackLink } from "@/components/back-link";
import { ListPageSkeleton } from "@/components/skeleton";
import { useSalesStats } from "@/hooks/use-profile";
import { cx } from "@/lib/cx";
import { formatMoney } from "@/lib/profile";
import {
  EMPTY_SALES_STATS,
  SALES_STATS_PERIODS,
  type TSalesStatsPeriod,
} from "@/lib/profile-data";
import styles from "@/styles/sales-stats-page.module.scss";

function formatChange(value: number): string {
  if (value === 0) {
    return "без изменений";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("ru-RU", {
    maximumFractionDigits: 1,
  })}% к прошлому периоду`;
}

function formatMinutes(value: number | null): string {
  if (value == null) {
    return "—";
  }

  if (value < 60) {
    return `${value} мин`;
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return minutes ? `${hours} ч ${minutes} мин` : `${hours} ч`;
}

function percent(value: number | null): string {
  return value == null
    ? "—"
    : `${value.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`;
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return one;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return few;
  }

  return many;
}

function Change({ value }: { value: number | null }) {
  if (value == null) {
    return null;
  }

  return (
    <span
      className={cx(
        styles["sales-stats-page__kpi-change"],
        value >= 0
          ? styles["sales-stats-page__kpi-change--positive"]
          : styles["sales-stats-page__kpi-change--negative"],
      )}
    >
      {formatChange(value)}
    </span>
  );
}

export function SalesStatsScreen() {
  const [period, setPeriod] = useState<TSalesStatsPeriod>("7d");
  const statsQuery = useSalesStats(period);
  const data = statsQuery.data ?? EMPTY_SALES_STATS;
  const maxBar = Math.max(...data.dailyRevenue.map((item) => item.value), 1);

  if (statsQuery.isLoading && !statsQuery.data) {
    return (
      <section className={styles["sales-stats-page"]}>
        <div className={styles["sales-stats-page__header"]}>
          <BackLink href="/profile" />
          <h1 className={styles["sales-stats-page__title"]}>
            Статистика продаж
          </h1>
        </div>
        <ListPageSkeleton rows={6} />
      </section>
    );
  }

  return (
    <section className={styles["sales-stats-page"]}>
      <div className={styles["sales-stats-page__header"]}>
        <BackLink href="/profile" />
        <h1 className={styles["sales-stats-page__title"]}>Статистика продаж</h1>
      </div>

      <div className={styles["sales-stats-page__periods"]}>
        {SALES_STATS_PERIODS.map((item) => (
          <button
            key={item.id}
            className={cx(
              styles["sales-stats-page__period"],
              period === item.id && styles["sales-stats-page__period--on"],
            )}
            type="button"
            onClick={() => setPeriod(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={styles["sales-stats-page__kpi-grid"]}>
        <div className={styles["sales-stats-page__kpi"]}>
          <span className={styles["sales-stats-page__kpi-label"]}>
            Выручка {data.periodLabel}
          </span>
          <strong className={styles["sales-stats-page__kpi-value"]}>
            {formatMoney(data.revenue)}
          </strong>
          <Change value={data.revenueChange} />
        </div>
        <div className={styles["sales-stats-page__kpi"]}>
          <span className={styles["sales-stats-page__kpi-label"]}>Заказы</span>
          <strong className={styles["sales-stats-page__kpi-value"]}>
            {data.ordersCount}
          </strong>
          <Change value={data.ordersChange} />
        </div>
        <div className={styles["sales-stats-page__kpi"]}>
          <span className={styles["sales-stats-page__kpi-label"]}>
            Средний чек
          </span>
          <strong className={styles["sales-stats-page__kpi-value"]}>
            {formatMoney(data.averageOrderValue)}
          </strong>
        </div>
        <div className={styles["sales-stats-page__kpi"]}>
          <span className={styles["sales-stats-page__kpi-label"]}>
            Успешные сделки
          </span>
          <strong className={styles["sales-stats-page__kpi-value"]}>
            {percent(data.successRate)}
          </strong>
          <span className={styles["sales-stats-page__kpi-note"]}>
            Из оплаченных и завершённых
          </span>
        </div>
      </div>

      <h2 className={styles["sales-stats-page__section-title"]}>
        Динамика выручки
      </h2>
      {data.dailyRevenue.length > 0 ? (
        <div className={styles["sales-stats-page__bars"]} aria-hidden>
          {data.dailyRevenue.map((item) => (
            <div
              key={item.label}
              className={styles["sales-stats-page__bar-col"]}
            >
              <div className={styles["sales-stats-page__bar-track"]}>
                <div
                  className={styles["sales-stats-page__bar"]}
                  style={{ height: `${(item.value / maxBar) * 100}%` }}
                />
              </div>
              <span className={styles["sales-stats-page__bar-label"]}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles["sales-stats-page__empty"]}>
          Пока нет данных за выбранный период
        </p>
      )}

      <h2 className={styles["sales-stats-page__section-title"]}>
        Популярные товары
      </h2>
      {data.topProducts.length > 0 ? (
        <ul className={styles["sales-stats-page__top-list"]}>
          {data.topProducts.map((item, index) => (
            <li key={item.id} className={styles["sales-stats-page__top-item"]}>
              <span className={styles["sales-stats-page__top-rank"]}>
                {index + 1}
              </span>
              {item.image ? (
                <img
                  className={styles["sales-stats-page__top-photo"]}
                  src={item.image}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                />
              ) : (
                <span
                  className={styles["sales-stats-page__top-photo"]}
                  aria-hidden
                />
              )}
              <div className={styles["sales-stats-page__top-text"]}>
                <p className={styles["sales-stats-page__top-title"]}>
                  {item.title}
                </p>
                <div className={styles["sales-stats-page__top-chips"]}>
                  {item.game ? (
                    <span className={styles["sales-stats-page__top-chip"]}>
                      {item.game}
                    </span>
                  ) : null}
                  <span className={styles["sales-stats-page__top-chip"]}>
                    {item.salesCount}{" "}
                    {plural(item.salesCount, "продажа", "продажи", "продаж")}
                  </span>
                  {item.views ? (
                    <span className={styles["sales-stats-page__top-chip"]}>
                      {item.views}{" "}
                      {plural(item.views, "просмотр", "просмотра", "просмотров")}
                    </span>
                  ) : null}
                </div>
              </div>
              <strong className={styles["sales-stats-page__top-revenue"]}>
                {formatMoney(item.revenue)}
              </strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles["sales-stats-page__empty"]}>
          Популярных товаров пока нет
        </p>
      )}

      <div className={styles["sales-stats-page__meta-grid"]}>
        <div className={styles["sales-stats-page__kpi"]}>
          <span className={styles["sales-stats-page__kpi-label"]}>
            Среднее время ответа
          </span>
          <strong className={styles["sales-stats-page__kpi-value"]}>
            {formatMinutes(data.avgResponseMinutes)}
          </strong>
          <span className={styles["sales-stats-page__kpi-note"]}>
            От оплаты до «Я выполнил»
          </span>
        </div>
        <div className={styles["sales-stats-page__kpi"]}>
          <span className={styles["sales-stats-page__kpi-label"]}>
            Повторные покупатели
          </span>
          <strong className={styles["sales-stats-page__kpi-value"]}>
            {data.repeatBuyersPercent}%
          </strong>
        </div>
        <div className={styles["sales-stats-page__kpi"]}>
          <span className={styles["sales-stats-page__kpi-label"]}>
            Активные объявления
          </span>
          <strong className={styles["sales-stats-page__kpi-value"]}>
            {data.activeListings}
          </strong>
        </div>
        <div className={styles["sales-stats-page__kpi"]}>
          <span className={styles["sales-stats-page__kpi-label"]}>
            Конверсия просмотров
          </span>
          <strong className={styles["sales-stats-page__kpi-value"]}>
            {percent(data.viewsToPurchasePercent)}
          </strong>
          <span className={styles["sales-stats-page__kpi-note"]}>
            {data.views
              ? `${data.purchases ?? 0} ${plural(data.purchases ?? 0, "покупка", "покупки", "покупок")} на ${data.views} ${plural(data.views, "просмотр", "просмотра", "просмотров")}`
              : "Просмотров за период пока нет"}
          </span>
        </div>
      </div>
    </section>
  );
}
