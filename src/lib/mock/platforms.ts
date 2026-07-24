export type Currency = "rub" | "kzt" | "usd";

export interface PlatformFormConfig {
  title: string;
  feePercent: number;
  accountLabel: string;
  accountPlaceholder: string;
  accountTooltip: string;
  minAmount: number;
  defaultAmount: number;
  currencies: Currency[];
  showPromo: boolean;
}

export interface Platform {
  id: string;
  name: string;
  image: string;
  form: PlatformFormConfig;
}

export const platforms: Platform[] = [
  {
    id: "steam",
    name: "Steam",
    image: "/assets/platform-steam.png",
    form: {
      title: "Пополнить Steam",
      feePercent: 5,
      accountLabel: "Логин Steam",
      accountPlaceholder: "Логин Steam",
      accountTooltip: "Введите логин вашего аккаунта Steam для пополнения",
      minAmount: 100,
      defaultAmount: 1000,
      currencies: ["rub", "kzt", "usd"],
      showPromo: true,
    },
  },
  {
    id: "telegram",
    name: "Telegram",
    image: "/assets/platform-telegram.png",
    form: {
      title: "Пополнить Telegram",
      feePercent: 3,
      accountLabel: "Username",
      accountPlaceholder: "@username",
      accountTooltip: "Укажите username Telegram без символа @",
      minAmount: 100,
      defaultAmount: 500,
      currencies: ["rub", "usd"],
      showPromo: false,
    },
  },
  {
    id: "psn",
    name: "PSN",
    image: "/assets/platform-psn.png",
    form: {
      title: "Пополнить PSN",
      feePercent: 7,
      accountLabel: "PSN ID",
      accountPlaceholder: "PSN ID или email",
      accountTooltip: "Укажите PSN ID или email аккаунта PlayStation Network",
      minAmount: 500,
      defaultAmount: 1500,
      currencies: ["rub", "usd"],
      showPromo: true,
    },
  },
  {
    id: "xbox",
    name: "Xbox",
    image: "/assets/platform-xbox.png",
    form: {
      title: "Пополнить Xbox",
      feePercent: 6,
      accountLabel: "Gamertag",
      accountPlaceholder: "Gamertag Xbox",
      accountTooltip: "Введите Gamertag аккаунта Xbox для пополнения баланса",
      minAmount: 300,
      defaultAmount: 1200,
      currencies: ["rub", "kzt", "usd"],
      showPromo: true,
    },
  },
];

export const currencySymbols: Record<Currency, string> = {
  rub: "₽",
  kzt: "₸",
  usd: "$",
};

export const currencyIcons: Record<Currency, string> = {
  rub: "/assets/currency-rub.svg",
  kzt: "/assets/currency-kzt.svg",
  usd: "/assets/currency-usd.svg",
};

export function getPlatformById(id: string): Platform {
  return platforms.find((platform) => platform.id === id) ?? platforms[0];
}
