export type BalanceHistoryOperationType = "deposit" | "payment" | "refund";

export interface BalanceHistoryItem {
  id: string;
  type: BalanceHistoryOperationType;
  label: string;
  amount: number;
  method: string;
  status: string;
}

export const mockBalanceHistory: BalanceHistoryItem[] = [
  {
    id: "1",
    type: "deposit",
    label: "Пополнение",
    amount: 20000,
    method: "Баланс",
    status: "Выполнено",
  },
  {
    id: "2",
    type: "payment",
    label: "Оплата",
    amount: -1290,
    method: "Баланс",
    status: "Выполнено",
  },
  {
    id: "3",
    type: "payment",
    label: "Оплата",
    amount: 650,
    method: "Баланс",
    status: "Выполнено",
  },
  {
    id: "4",
    type: "payment",
    label: "Оплата",
    amount: -4200,
    method: "Баланс",
    status: "Выполнено",
  },
  {
    id: "5",
    type: "refund",
    label: "Возврат",
    amount: 3200,
    method: "Баланс",
    status: "Выполнено",
  },
];

export function formatHistoryAmount(amount: number): string {
  const formatted = new Intl.NumberFormat("ru-RU").format(Math.abs(amount));
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";

  return `${sign}${formatted} ₽`;
}

export function isPositiveHistoryAmount(amount: number): boolean {
  return amount > 0;
}
