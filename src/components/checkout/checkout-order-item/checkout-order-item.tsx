"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon/icon";
import {
  checkoutOfferTypeLabels,
  formatProductPrice,
  getCheckoutItemLineTotal,
  type CheckoutCartItem,
} from "@/lib/mock/checkout";
import { formatPrice } from "@/lib/mock/products";
import {
  formatVariableUnitRate,
  parseVariableUnitAmountInput,
} from "@/lib/mock/variable-pricing";
import styles from "./checkout-order-item.module.css";

interface CheckoutOrderItemProps {
  item: CheckoutCartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onPurchaseAmountChange?: (purchaseAmount: number) => void;
  onRemove: () => void;
}

export function CheckoutOrderItem({
  item,
  onIncrease,
  onDecrease,
  onPurchaseAmountChange,
  onRemove,
}: CheckoutOrderItemProps) {
  const isUnit = item.offerType === "unit";
  const isVariableUnit = item.offerType === "variable-unit";
  const lineTotal = getCheckoutItemLineTotal(item);
  const [amountInput, setAmountInput] = useState(
    item.purchaseAmount ? formatPrice(item.purchaseAmount) : "",
  );

  const handleAmountChange = (raw: string) => {
    setAmountInput(raw);
    onPurchaseAmountChange?.(parseVariableUnitAmountInput(raw));
  };

  return (
    <article className={styles.item}>
      <div className={styles.topRow}>
        <div className={styles.imageWrap}>
          <Image
            src={item.image}
            alt=""
            fill
            className={styles.image}
            sizes="72px"
          />
        </div>

        <div className={styles.info}>
          <div className={styles.metaRow}>
            <span className={styles.category}>{item.categoryLabel}</span>
            <span
              className={`${styles.offerType} ${
                isUnit || isVariableUnit ? styles.offerTypeUnit : styles.offerTypeService
              }`}
            >
              {checkoutOfferTypeLabels[item.offerType]}
            </span>
          </div>
          <p className={styles.title}>{item.title}</p>
          {item.subtitle ? <p className={styles.subtitle}>{item.subtitle}</p> : null}
        </div>

        <button
          type="button"
          className={styles.removeButton}
          onClick={onRemove}
          aria-label={`Удалить ${item.title} из заказа`}
        >
          <Icon
            src="/assets/modal-close.svg"
            width={24}
            height={24}
            className={styles.removeIcon}
          />
        </button>
      </div>

      <div className={styles.bottomRow}>
        {isVariableUnit && item.variablePricing ? (
          <div className={styles.variableAmountControl}>
            <label className={styles.variableAmountLabel}>
              Количество
              <div className={styles.variableAmountRow}>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.variableAmountInput}
                  value={amountInput}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  aria-label="Количество валюты"
                />
                <span className={styles.variableAmountUnit}>{item.variablePricing.unitName}</span>
              </div>
            </label>
            <span className={styles.variableRate}>{formatVariableUnitRate(item.variablePricing)}</span>
          </div>
        ) : isUnit ? (
          <div className={styles.quantityControl}>
            <button
              type="button"
              className={styles.quantityButton}
              onClick={onDecrease}
              disabled={item.quantity <= 1}
              aria-label="Уменьшить количество"
            >
              −
            </button>
            <span className={styles.quantityValue}>{item.quantity}</span>
            <button
              type="button"
              className={styles.quantityButton}
              onClick={onIncrease}
              aria-label="Увеличить количество"
            >
              +
            </button>
          </div>
        ) : (
          <span className={styles.serviceQuantity}>1 услуга</span>
        )}

        <div className={styles.priceBlock}>
          {isUnit ? (
            <span className={styles.unitPrice}>{formatProductPrice(item.price, "unit")}</span>
          ) : null}
          <span className={styles.price}>{formatPrice(lineTotal)} ₽</span>
        </div>
      </div>
    </article>
  );
}
