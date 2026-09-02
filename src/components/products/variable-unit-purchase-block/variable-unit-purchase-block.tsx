"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon/icon";
import {
  calculateVariableUnitAmountFromTotal,
  calculateVariableUnitTotal,
  formatVariableUnitRange,
  parseVariableUnitAmountInput,
  validateVariableUnitAmount,
  type VariableUnitPricing,
} from "@/lib/mock/variable-pricing";
import { formatPrice } from "@/lib/mock/products";
import styles from "./variable-unit-purchase-block.module.css";

interface VariableUnitPurchaseBlockProps {
  pricing: VariableUnitPricing;
  recipientLabel?: string;
  onBuy: (amount: number, recipient?: string) => void;
}

function parseTotalInput(raw: string): number {
  return Number(raw.replace(/\s/g, "").replace(",", ".")) || 0;
}

export function VariableUnitPurchaseBlock({
  pricing,
  recipientLabel = "Имя персонажа",
  onBuy,
}: VariableUnitPurchaseBlockProps) {
  const [amount, setAmount] = useState(pricing.minAmount);
  const [totalInput, setTotalInput] = useState(() =>
    String(calculateVariableUnitTotal(pricing.minAmount, pricing)),
  );
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(() => calculateVariableUnitTotal(amount, pricing), [amount, pricing]);

  const syncFromAmount = (nextAmount: number) => {
    setAmount(nextAmount);
    setTotalInput(String(calculateVariableUnitTotal(nextAmount, pricing)));
    setError(validateVariableUnitAmount(nextAmount, pricing));
  };

  const handleAmountChange = (raw: string) => {
    syncFromAmount(parseVariableUnitAmountInput(raw));
  };

  const handleTotalChange = (raw: string) => {
    setTotalInput(raw);
    const parsedTotal = parseTotalInput(raw);

    if (!parsedTotal) {
      setError("Укажите сумму");
      return;
    }

    const nextAmount = calculateVariableUnitAmountFromTotal(parsedTotal, pricing);
    setAmount(nextAmount);
    setError(validateVariableUnitAmount(nextAmount, pricing));
  };

  const handleBuy = () => {
    const validationError = validateVariableUnitAmount(amount, pricing);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!recipient.trim()) {
      setError(`Укажите ${recipientLabel.toLowerCase()}`);
      return;
    }

    onBuy(amount, recipient.trim());
  };

  return (
    <div className={styles.block}>
      <p className={styles.rangeHint}>{formatVariableUnitRange(pricing)}</p>

      <div className={styles.exchangeRow}>
        <label className={styles.exchangeField}>
          <span className={styles.exchangeLabel}>Получите</span>
          <div className={`${styles.exchangeInputWrap} ${error ? styles.exchangeInputWrapError : ""}`}>
            <input
              type="text"
              inputMode="numeric"
              className={styles.exchangeInput}
              value={amount ? formatPrice(amount) : ""}
              onChange={(event) => handleAmountChange(event.target.value)}
              aria-label="Количество к получению"
            />
            <span className={styles.exchangeSuffix}>{pricing.unitName}</span>
          </div>
        </label>

        <div className={styles.exchangeIcon} aria-hidden>
          <Icon src="/assets/arrows-down-up.svg" width={20} height={20} />
        </div>

        <label className={styles.exchangeField}>
          <span className={styles.exchangeLabel}>Заплатите</span>
          <div className={`${styles.exchangeInputWrap} ${styles.exchangeInputWrapMuted}`}>
            <input
              type="text"
              inputMode="decimal"
              className={styles.exchangeInput}
              value={totalInput}
              onChange={(event) => handleTotalChange(event.target.value)}
              aria-label="Сумма к оплате"
            />
            <span className={styles.exchangeSuffix}>₽</span>
          </div>
        </label>
      </div>

      <label className={styles.recipientField}>
        <span className={styles.exchangeLabel}>{recipientLabel}</span>
        <input
          type="text"
          className={styles.recipientInput}
          value={recipient}
          onChange={(event) => {
            setRecipient(event.target.value);
            if (error?.includes(recipientLabel.toLowerCase())) {
              setError(null);
            }
          }}
          placeholder={`Введите ${recipientLabel.toLowerCase()}`}
        />
      </label>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        <p className={styles.totalHint}>Итого к оплате: {formatPrice(total)} ₽</p>
      )}

      <button type="button" className={styles.buyButton} onClick={handleBuy}>
        Купить за {formatPrice(total)} ₽
      </button>
    </div>
  );
}
