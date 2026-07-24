"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon/icon";
import { Button } from "@/components/ui/button/button";
import { ModalCloseButton } from "@/components/ui/modal-close-button/modal-close-button";
import styles from "./account-filters-modal.module.css";

interface AccountFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FilterState {
  fullAccess: boolean;
  autoreg: boolean;
  primeStatus: boolean;
  faceitAccess: boolean;
  onDiscount: boolean;
  withReviews: boolean;
}

const defaultState: FilterState = {
  fullAccess: true,
  autoreg: false,
  primeStatus: false,
  faceitAccess: false,
  onDiscount: false,
  withReviews: false,
};

export function AccountFiltersModal({ isOpen, onClose }: AccountFiltersModalProps) {
  const [filters, setFilters] = useState<FilterState>(defaultState);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggle = (key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const reset = () => setFilters(defaultState);

  return (
    <div
      className="overlay-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filters-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(22, 22, 26, 0.5)",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div className={styles.panel} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <button type="button" className={styles.reset} onClick={reset}>
            Сбросить
          </button>
          <h2 id="filters-title" className={styles.title}>
            Аккаунты
          </h2>
          <ModalCloseButton onClick={onClose} />
        </div>

        <p className={styles.sectionLabel}>📦 Способ получения</p>

        <div className={styles.option}>
          <div>
            <p className={styles.optionTitle}>Полный доступ</p>
            <p className={styles.optionDescription}>
              Личный аккаунт с доступом ко всем привязкам
            </p>
          </div>
          <button
            type="button"
            className={`${styles.checkbox} ${filters.fullAccess ? styles.checkboxChecked : styles.checkboxUnchecked}`}
            onClick={() => toggle("fullAccess")}
            aria-pressed={filters.fullAccess}
          >
            {filters.fullAccess ? (
              <Icon src="/assets/checkmark-white.svg" width={14} height={10} className={styles.checkIcon} />
            ) : null}
          </button>
        </div>
        <div className={styles.separator} />
        <div className={styles.option}>
          <div>
            <p className={styles.optionTitle}>Авторег (доступ ко всем привязкам)</p>
            <p className={styles.optionDescription}>
              Создание личного аккаунта после оплаты товара
            </p>
          </div>
          <button
            type="button"
            className={`${styles.checkbox} ${filters.autoreg ? styles.checkboxChecked : styles.checkboxUnchecked}`}
            onClick={() => toggle("autoreg")}
            aria-pressed={filters.autoreg}
          >
            {filters.autoreg ? (
              <Icon src="/assets/checkmark-white.svg" width={14} height={10} className={styles.checkIcon} />
            ) : null}
          </button>
        </div>

        {[
          { key: "csRating", label: "CS Rating", from: "От 1", to: "До 100000" },
          { key: "medals", label: "Количество медалей", from: "От 1", to: "До 1000" },
          { key: "hours", label: "Количество часов", from: "От 1", to: "До 10000000" },
        ].map((range) => (
          <div key={range.key} className={styles.rangeSection}>
            <p className={styles.rangeLabel}>{range.label}</p>
            <div className={styles.rangeRow}>
              <input className={styles.rangeInput} placeholder={range.from} aria-label={`${range.label} от`} />
              <Icon src="/assets/range-dash.svg" width={56} height={2} className={styles.rangeDash} />
              <input className={styles.rangeInput} placeholder={range.to} aria-label={`${range.label} до`} />
            </div>
          </div>
        ))}

        {[
          { key: "primeStatus" as const, label: "Prime Status" },
          { key: "faceitAccess" as const, label: "Доступ к FACEIT" },
        ].map((item) => (
          <div key={item.key} className={styles.switchRow}>
            <span className={styles.switchLabel}>{item.label}</span>
            <button
              type="button"
              className={`${styles.switch} ${filters[item.key] ? styles.switchOn : ""}`}
              onClick={() => toggle(item.key)}
              aria-pressed={filters[item.key]}
            >
              <span className={styles.switchKnob} />
            </button>
          </div>
        ))}

        <div className={styles.switchRow}>
          <span className={styles.switchLabel}>
            <span className={styles.discountBadge}>- %</span>
            По скидке
          </span>
          <button
            type="button"
            className={`${styles.switch} ${filters.onDiscount ? styles.switchOn : ""}`}
            onClick={() => toggle("onDiscount")}
            aria-pressed={filters.onDiscount}
          >
            <span className={styles.switchKnob} />
          </button>
        </div>

        <div className={styles.switchRow}>
          <span className={styles.switchLabel}>
            <Icon src="/assets/star-purple.svg" width={26} height={26} className={styles.starIcon} />
            С отзывами
          </span>
          <button
            type="button"
            className={`${styles.switch} ${filters.withReviews ? styles.switchOn : ""}`}
            onClick={() => toggle("withReviews")}
            aria-pressed={filters.withReviews}
          >
            <span className={styles.switchKnob} />
          </button>
        </div>

        <div className={styles.footer}>
          <Button variant="gradient" fullWidth large className={styles.showButton} onClick={onClose}>
            Показать
          </Button>
        </div>
      </div>
    </div>
  );
}
