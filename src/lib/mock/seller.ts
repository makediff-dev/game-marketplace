import { marketplaceGames } from "./games";

export interface SellerStat {
  emoji: string;
  value: string;
  label: string;
}

export interface SellerCategory {
  id: string;
  label: string;
  icon: string;
}

export interface SellerGameItem {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  badge?: string;
}

export const sellerStats: SellerStat[] = [
  { emoji: "😍", value: "5 млн", label: "пользователей" },
  { emoji: "🤑", value: "100 тыс.", label: "продавцов" },
  { emoji: "💰", value: "10 млн", label: "продаж" },
  { emoji: "📦", value: "500 тыс.", label: "товаров в продаже" },
];

export const sellerCategoryTabs = [
  { id: "games", label: "Игры", count: 820, icon: "/assets/icon-play.svg" },
  { id: "mobile", label: "Мобильные игры", count: 278, icon: "/assets/icon-play.svg" },
  { id: "apps", label: "Приложения", count: 114, icon: "/assets/icon-sketch.svg" },
];

export const sellerCategories: SellerCategory[] = [
  { id: "donate", label: "Донат", icon: "/assets/icon-coins.svg" },
  { id: "items", label: "Предметы", icon: "/assets/icon-sword.svg" },
  { id: "balance", label: "Пополнение баланса", icon: "/assets/icon-wallet.svg" },
  { id: "subs", label: "Подписки", icon: "/assets/icon-credit-card.svg" },
  { id: "accounts", label: "Аккаунты", icon: "/assets/icon-users.svg" },
  { id: "keys", label: "Ключи", icon: "/assets/icon-key.svg" },
  { id: "design", label: "Дизайн", icon: "/assets/icon-sketch.svg" },
  { id: "reviews", label: "Отзывы", icon: "/assets/icon-thumbs.svg" },
];

export const sellerPayoutMethods = [
  "/assets/card-ru.svg",
  "/assets/sbp.svg",
  "/assets/visa.svg",
  "/assets/mastercard.svg",
  "/assets/mir.svg",
];

const sellerGamePool = marketplaceGames.map((game) => ({
  name: game.name,
  subtitle: game.productCategories[0] ?? game.name,
  image: game.icon,
  badge: game.badge === "new" ? "Новое" : undefined,
}));

export const sellerGameItems: SellerGameItem[] = Array.from({ length: 18 }, (_, index) => {
  const game = sellerGamePool[index % sellerGamePool.length];

  return {
    id: `game-${index}`,
    ...game,
  };
});

const popularPool = [
  { name: "Roblox", subtitle: "Robux", image: "/assets/app-roblox.png" },
  { name: "Telegram", subtitle: "Премиум", image: "/assets/logo-telegram.png" },
  { name: "Brawl Stars", subtitle: "Гемы", image: "/assets/app-brawl-stars.png" },
  { name: "Counter-Strike 2", subtitle: "Аккаунты", image: "/assets/cs2-logo.png" },
  { name: "PUBG Mobile", subtitle: "UC", image: "/assets/app-pubg.png" },
  { name: "ChatGPT", subtitle: "Plus", image: "/assets/app-chatgpt.png" },
];

export const popularSellerItems: SellerGameItem[] = Array.from({ length: 12 }, (_, index) => {
  const item = popularPool[index % popularPool.length];

  return {
    id: `popular-${index}`,
    ...item,
  };
});

export const SELLER_FEE_PERCENT = 10;
