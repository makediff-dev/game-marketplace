"use client";

import { Icon } from "@/components/ui/icon/icon";
import { formatPrice } from "@/lib/mock/products";
import {
  calculateVariableUnitTotal,
  formatVariableUnitRate,
  type VariableUnitPricing,
} from "@/lib/mock/variable-pricing";
import styles from "./sell-variable-pricing-fields.module.css";

interface SellVariablePricingFieldsProps {
  pricing: VariableUnitPricing;
  onChange: (pricing: Partial<VariableUnitPricing>) => void;
  variant?: "full" | "sidebar";
  maxIncome?: number;
}

function parseNumericInput(raw: string): number {
  return Number(raw.replace(/\s/g, "").replace(",", ".")) || 0;
}

function formatUnitSize(value: number): string {
  return value > 0 ? String(value) : "";
}

export function SellVariablePricingFields({
  pricing,
  onChange,
  variant = "full",
  maxIncome,
}: SellVariablePricingFieldsProps) {
  const previewTotal = calculateVariableUnitTotal(pricing.minAmount, pricing);
  const rootClassName =
    variant === "sidebar" ? `${styles.section} ${styles.sectionSidebar}` : styles.section;

  return (
    <section className={rootClassName} aria-label="Цена за номинал">
      <div className={styles.ratePreview}>{formatVariableUnitRate(pricing)}</div>

      <div className={styles.fieldsGrid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Номинал</span>
          <div className={styles.inputWrap}>
            <input
              type="text"
              inputMode="numeric"
              className={styles.input}
              value={formatUnitSize(pricing.unitSize)}
              onChange={(event) => onChange({ unitSize: parseNumericInput(event.target.value) })}
              aria-label="Размер номинала"
            />
            <span className={styles.suffix}>{pricing.unitName}</span>
          </div>
        </label>

        <div className={styles.iconCell} aria-hidden>
          <Icon src="/assets/arrows-down-up-seller.svg" width={32} height={32} />
        </div>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Цена за номинал</span>
          <div className={styles.inputWrap}>
            <input
              type="text"
              inputMode="numeric"
              className={styles.input}
              value={formatPrice(pricing.pricePerUnit)}
              onChange={(event) =>
                onChange({ pricePerUnit: parseNumericInput(event.target.value) })
              }
              aria-label="Цена за номинал"
            />
            <span className={styles.suffix}>₽</span>
          </div>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Мин. покупка</span>
          <div className={styles.inputWrap}>
            <input
              type="text"
              inputMode="numeric"
              className={styles.input}
              value={formatPrice(pricing.minAmount)}
              onChange={(event) => onChange({ minAmount: parseNumericInput(event.target.value) })}
              aria-label="Минимальная покупка"
            />
            <span className={styles.suffix}>{pricing.unitName}</span>
          </div>
        </label>

        <div className={styles.iconCell} aria-hidden />

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Макс. покупка</span>
          <div className={styles.inputWrap}>
            <input
              type="text"
              inputMode="numeric"
              className={styles.input}
              value={formatPrice(pricing.maxAmount)}
              onChange={(event) => onChange({ maxAmount: parseNumericInput(event.target.value) })}
              aria-label="Максимальная покупка"
            />
            <span className={styles.suffix}>{pricing.unitName}</span>
          </div>
        </label>
      </div>

      <p className={styles.preview}>
        Минимальный заказ покупателя: {formatPrice(previewTotal)} ₽
      </p>

      {typeof maxIncome === "number" ? (
        <div className={styles.incomeCard}>
          <span className={styles.incomeLabel}>Макс. доход</span>
          <div className={styles.incomeValueRow}>
            <span className={styles.incomeValue}>{formatPrice(maxIncome)}</span>
            <span className={styles.incomeCurrency}>₽</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
