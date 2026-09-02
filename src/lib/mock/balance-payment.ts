export type BalanceOperation = "deposit" | "withdraw" | "purchase";

export interface BalancePaymentMethod {
  id: string;
  label: string;
  icon?: string;
}

export const balancePaymentMethods: BalancePaymentMethod[] = [
  { id: "sbp", label: "СБП", icon: "/assets/sbp-36.svg" },
  { id: "card-ru", label: "🇷🇺 Банковская карта" },
  { id: "card-foreign", label: "🌐 Зарубежная карта" },
  { id: "card-by", label: "Карта Беларуси" },
  { id: "crypto", label: "Криптовалюта", icon: "/assets/umoney-36.svg" },
];

export function getBalanceOperationLabel(operation: BalanceOperation): string {
  if (operation === "deposit") {
    return "💳 Пополнение";
  }

  if (operation === "purchase") {
    return "🛒 Покупка";
  }

  return "Вывод";
}
