"use client";

import { useState } from "react";

import { getErrorMessage } from "@/api/error";
import type { TWithdrawal } from "@/api/profile.api";
import { BackLink } from "@/components/back-link";
import { ListPageSkeleton } from "@/components/skeleton";
import {
  useBalanceHistory,
  useDepositBalance,
  useProfileOverview,
  useWithdraw,
  useWithdrawals,
} from "@/hooks/use-profile";
import { cx } from "@/lib/cx";
import { formatMoney } from "@/lib/profile";
import { BALANCE_AMOUNT_PRESETS } from "@/lib/profile-data";
import styles from "@/styles/balance-page.module.scss";

type TOperation = "deposit" | "withdraw";

const WITHDRAWAL_STATUS: Record<TWithdrawal["status"], string> = {
  pending: "В обработке",
  paid: "Выплачено",
  rejected: "Отклонено",
};

export function BalanceScreen() {
  const [amount, setAmount] = useState("100");
  const [phone, setPhone] = useState("");
  const [bank, setBank] = useState("");
  const [operation, setOperation] = useState<TOperation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const overviewQuery = useProfileOverview();
  const historyQuery = useBalanceHistory();
  const withdrawalsQuery = useWithdrawals();
  const deposit = useDepositBalance();
  const withdraw = useWithdraw();
  const balance = overviewQuery.data?.balance ?? 0;
  const held = overviewQuery.data?.heldBalance ?? 0;
  const history = historyQuery.data ?? [];
  const withdrawals = withdrawalsQuery.data ?? [];
  const parsedAmount = Number(amount.replace(/\s/g, "").replace(",", ".")) || 0;
  const pending = deposit.isPending || withdraw.isPending;
  const loading =
    (overviewQuery.isLoading && !overviewQuery.data) ||
    (historyQuery.isLoading && !historyQuery.data);

  function openModal(next: TOperation) {
    setError(null);
    setOperation(next);
  }

  function submit() {
    setError(null);
    const onError = (err: unknown) => setError(getErrorMessage(err));

    if (operation === "deposit") {
      deposit.mutate(parsedAmount, {
        onSuccess: () => {
          void historyQuery.refetch();
          setOperation(null);
        },
        onError,
      });
      return;
    }

    withdraw.mutate(
      { amount: parsedAmount, phone, bank },
      { onSuccess: () => setOperation(null), onError },
    );
  }

  if (loading) {
    return (
      <section className={styles["balance-page"]}>
        <div className={styles["balance-page__header"]}>
          <BackLink href="/profile" />
          <h1 className={styles["balance-page__title"]}>Баланс</h1>
        </div>
        <ListPageSkeleton rows={5} />
      </section>
    );
  }

  return (
    <section className={styles["balance-page"]}>
      <div className={styles["balance-page__header"]}>
        <BackLink href="/profile" />
        <h1 className={styles["balance-page__title"]}>Баланс</h1>
      </div>

      <p className={styles["balance-page__amount"]}>{formatMoney(balance)}</p>
      {held > 0 ? (
        <p className={styles["balance-page__held"]}>
          Заблокировано в сделках и выводах: {formatMoney(held)}
        </p>
      ) : null}

      <div className={styles["balance-page__panel"]}>
        <p className={styles["balance-page__label"]}>Сумма</p>
        <input
          className={styles["balance-page__input"]}
          type="text"
          inputMode="numeric"
          value={amount}
          aria-label="Сумма"
          onChange={(event) => setAmount(event.target.value)}
        />
        <div className={styles["balance-page__presets"]}>
          {BALANCE_AMOUNT_PRESETS.map((preset) => (
            <button
              key={preset}
              className={cx(
                styles["balance-page__preset"],
                Number(amount) === preset && styles["balance-page__preset--on"],
              )}
              type="button"
              onClick={() => setAmount(String(preset))}
            >
              {preset}
            </button>
          ))}
        </div>
        <div className={styles["balance-page__actions"]}>
          <button
            className={styles["balance-page__deposit"]}
            type="button"
            onClick={() => openModal("deposit")}
          >
            Пополнить баланс
          </button>
          <button
            className={styles["balance-page__withdraw"]}
            type="button"
            onClick={() => openModal("withdraw")}
          >
            Вывести средства
          </button>
        </div>
      </div>

      {withdrawals.length > 0 ? (
        <section
          className={styles["balance-page__history"]}
          aria-label="Заявки на вывод"
        >
          <h2 className={styles["balance-page__history-title"]}>
            Заявки на вывод
          </h2>
          <ul className={styles["balance-page__list"]}>
            {withdrawals.map((item, index) => (
              <li
                key={item.id}
                className={cx(
                  styles["balance-page__row"],
                  index % 2 === 1 && styles["balance-page__row--alt"],
                )}
              >
                <span className={styles["balance-page__cell"]}>
                  СБП, {item.bank}, {item.phone}
                </span>
                <span className={styles["balance-page__cell"]}>
                  {formatMoney(item.amount)}
                </span>
                <span className={styles["balance-page__cell"]}>
                  {WITHDRAWAL_STATUS[item.status]}
                  {item.rejectReason ? `: ${item.rejectReason}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section
        className={styles["balance-page__history"]}
        aria-label="История операций"
      >
        <h2 className={styles["balance-page__history-title"]}>История</h2>
        <div className={styles["balance-page__table"]}>
          <div className={styles["balance-page__header-row"]}>
            <span>Операция</span>
            <span>Сумма</span>
            <span>Состояние</span>
          </div>
          {history.length > 0 ? (
            <ul className={styles["balance-page__list"]}>
              {history.map((item, index) => (
                <li
                  key={item.id}
                  className={`${styles["balance-page__row"]} ${index % 2 === 1 ? styles["balance-page__row--alt"] : ""}`}
                >
                  <span className={styles["balance-page__cell"]}>
                    {item.label}
                  </span>
                  <span
                    className={`${styles["balance-page__cell"]} ${
                      item.amount >= 0
                        ? styles["balance-page__cell--positive"]
                        : styles["balance-page__cell--negative"]
                    }`}
                  >
                    {item.amount >= 0 ? "+" : ""}
                    {formatMoney(item.amount)}
                  </span>
                  <span className={styles["balance-page__cell"]}>
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles["balance-page__empty-history"]}>
              Операций пока нет
            </p>
          )}
        </div>
      </section>

      {operation && (
        <div
          className={styles["balance-page__overlay"]}
          onClick={() => setOperation(null)}
        >
          <div
            className={styles["balance-page__modal"]}
            role="dialog"
            aria-modal="true"
            aria-labelledby="balance-payment-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              className={styles["balance-page__modal-title"]}
              id="balance-payment-title"
            >
              {operation === "deposit" ? "Пополнение" : "Вывод средств"}
            </h2>
            <p className={styles["balance-page__modal-text"]}>
              {operation === "deposit"
                ? `Подтвердите пополнение на ${formatMoney(parsedAmount)}. Демо-зачисление на баланс.`
                : `Вывод ${formatMoney(parsedAmount)} по СБП. Минимум 100 ₽.`}
            </p>
            {operation === "withdraw" ? (
              <div className={styles["balance-page__fields"]}>
                <input
                  className={styles["balance-page__input"]}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  aria-label="Телефон для СБП"
                  placeholder="+7 900 123-45-67"
                  onChange={(event) => setPhone(event.target.value)}
                />
                <input
                  className={styles["balance-page__input"]}
                  type="text"
                  value={bank}
                  aria-label="Банк получателя"
                  placeholder="Банк получателя"
                  maxLength={60}
                  onChange={(event) => setBank(event.target.value)}
                />
              </div>
            ) : null}
            {error ? (
              <p className={styles["balance-page__empty-history"]}>{error}</p>
            ) : null}
            <div className={styles["balance-page__modal-actions"]}>
              <button
                className={styles["balance-page__modal-confirm"]}
                type="button"
                disabled={
                  pending ||
                  (operation === "withdraw" && (!phone.trim() || !bank.trim()))
                }
                onClick={submit}
              >
                {deposit.isPending
                  ? "Пополняем…"
                  : withdraw.isPending
                    ? "Отправляем…"
                    : "Подтвердить"}
              </button>
              <button
                className={styles["balance-page__modal-close"]}
                type="button"
                onClick={() => setOperation(null)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
