"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { BalancePaymentModal } from "@/components/profile/balance-payment-modal/balance-payment-modal";
import { BalanceHistory } from "@/components/profile/balance-history/balance-history";
import { mockUser } from "@/lib/mock/user";
import type { BalanceOperation } from "@/lib/mock/balance-payment";
import styles from "./balance-content.module.css";

const presetAmounts = [50, 100, 200, 500, 1000];

function formatBalance(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

export function BalanceContent() {
  const [amount, setAmount] = useState("50");
  const [modalOpen, setModalOpen] = useState(false);
  const [operation, setOperation] = useState<BalanceOperation>("deposit");

  const openModal = (nextOperation: BalanceOperation) => {
    setOperation(nextOperation);
    setModalOpen(true);
  };

  return (
    <>
      <div className={styles.balance}>
        <div className={styles.topSection}>
          <p className={styles.amount}>{formatBalance(mockUser.balance)}</p>

          <div className={styles.amountField}>
            <div className={styles.amountInputGroup}>
              <label className={styles.amountFieldLabel} htmlFor="balance-amount">
                Сумма пополнения
              </label>
              <input
                id="balance-amount"
                type="number"
                className={styles.amountInput}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                min={1}
                aria-label="Сумма пополнения"
              />
            </div>
            <div className={styles.presetRow} role="group" aria-label="Быстрый выбор суммы пополнения">
              {presetAmounts.map((preset) => {
                const isActive = amount === String(preset);

                return (
                  <button
                    key={preset}
                    type="button"
                    className={[styles.presetPill, isActive ? styles.presetPillActive : ""]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setAmount(String(preset))}
                    aria-pressed={isActive}
                  >
                    {preset} ₽
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="gradient" fullWidth large onClick={() => openModal("deposit")}>
              Пополнить баланс
            </Button>
            <button type="button" className={styles.withdrawButton} onClick={() => openModal("withdraw")}>
              Вывести средства
            </button>
          </div>
        </div>

        <BalanceHistory />
      </div>

      <BalancePaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        amount={amount}
        operation={operation}
      />
    </>
  );
}
