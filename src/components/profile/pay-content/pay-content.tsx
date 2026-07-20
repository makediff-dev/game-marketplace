"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button/button";
import { Icon } from "@/components/ui/icon/icon";
import styles from "./pay-content.module.css";

const paymentMethods = [
  { id: "card-ru", label: "Карта РФ", icon: "/assets/card-ru.svg" },
  { id: "sbp", label: "СБП", icon: "/assets/sbp.svg" },
  { id: "visa", label: "Visa", icon: "/assets/visa.svg" },
  { id: "mastercard", label: "Mastercard", icon: "/assets/mastercard.svg" },
  { id: "mir", label: "Mir", icon: "/assets/mir.svg" },
  { id: "card-by", label: "Карта BY", icon: "/assets/card-by.svg" },
];

export function PayContent() {
  const router = useRouter();
  const [amount, setAmount] = useState("500");
  const [selectedMethod, setSelectedMethod] = useState("card-ru");

  return (
    <div className={styles.pay}>
      <div className={styles.amountField}>
        <label htmlFor="amount" className={styles.label}>
          Сумма пополнения
        </label>
        <input
          id="amount"
          type="number"
          className={styles.input}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min={1}
          aria-label="Сумма пополнения"
        />
      </div>

      <div className={styles.methods}>
        <h2 className={styles.methodsTitle}>Способ оплаты</h2>
        <div className={styles.methodGrid}>
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              className={`${styles.methodCard} ${selectedMethod === method.id ? styles.methodCardActive : ""}`}
              onClick={() => setSelectedMethod(method.id)}
              aria-pressed={selectedMethod === method.id}
            >
              <Icon
                src={method.icon}
                alt={method.label}
                width={40}
                height={40}
                className={styles.methodIcon}
              />
              <span className={styles.methodLabel}>{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Button variant="primary" fullWidth large onClick={() => router.push("/profile/balance")}>
        Оплатить {amount} ₽
      </Button>
    </div>
  );
}
