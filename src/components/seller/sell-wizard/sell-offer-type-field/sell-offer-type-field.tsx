import { checkoutOfferTypeLabels, formatProductPrice, type CheckoutOfferType } from "@/lib/mock/checkout";
import { formatPrice } from "@/lib/mock/products";
import styles from "./sell-offer-type-field.module.css";

interface SellOfferTypeFieldProps {
  value: CheckoutOfferType;
  unitPrice: number;
  onChange: (offerType: CheckoutOfferType) => void;
}

const offerTypes: CheckoutOfferType[] = ["service", "unit"];

export function SellOfferTypeField({ value, unitPrice, onChange }: SellOfferTypeFieldProps) {
  return (
    <section className={styles.section} aria-label="Тип позиции">
      <span className={styles.label}>Тип позиции</span>

      <div className={styles.options} role="group" aria-label="Выбор типа позиции">
        {offerTypes.map((offerType) => {
          const isActive = value === offerType;

          return (
            <button
              key={offerType}
              type="button"
              className={`${styles.option} ${isActive ? styles.optionActive : ""}`}
              onClick={() => onChange(offerType)}
              aria-pressed={isActive}
            >
              {checkoutOfferTypeLabels[offerType]}
            </button>
          );
        })}
      </div>

      {value === "unit" ? (
        <div className={styles.unitPriceRow}>
          <span className={styles.unitPriceLabel}>Цена за единицу товара</span>
          <span className={styles.unitPriceValue}>{formatProductPrice(unitPrice, "unit")}</span>
        </div>
      ) : null}
    </section>
  );
}
