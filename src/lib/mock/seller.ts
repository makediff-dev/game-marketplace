import { marketplaceGames, type GameGroup } from "./games";

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
  gameId: string;
  name: string;
  subtitle: string;
  image: string;
  group: GameGroup;
  badge?: string;
}

export const sellerStats: SellerStat[] = [
  { emoji: "😍", value: "5 млн", label: "пользователей" },
  { emoji: "🤑", value: "100 тыс.", label: "продавцов" },
  { emoji: "💰", value: "10 млн", label: "продаж" },
  { emoji: "📦", value: "500 тыс.", label: "товаров в продаже" },
];

export const sellerCategoryTabs = [
  { id: "games", label: "🎮 Игры", count: 820 },
  { id: "mobile", label: "📱 Мобильные игры", count: 278 },
  { id: "apps", label: "🌐 Приложения", count: 114 },
];

export const sellerCategories: SellerCategory[] = [
  { id: "donate", label: "Донат", icon: "/assets/icon-coins.svg" },
  { id: "items", label: "Предметы", icon: "/assets/icon-sword.svg" },
  { id: "balance", label: "Пополнение баланса", icon: "/assets/icon-wallet.svg" },
  { id: "subs", label: "Подписки", icon: "/assets/icon-credit-card.svg" },
  { id: "accounts", label: "Аккаунты", icon: "/assets/icon-users.svg" },
  { id: "keys", label: "Ключи", icon: "/assets/icon-key.svg" },
  { id: "currency", label: "Игровая валюта", icon: "/assets/icon-sketch.svg" },
  { id: "services", label: "Услуги", icon: "/assets/icon-thumbs.svg" },
  { id: "media", label: "Медиа", icon: "/assets/icon-play.svg" },
];

export const sellerPayoutMethods = [
  "/assets/sbp-36.svg",
  "/assets/card-ru-36.svg",
  "/assets/card-foreign.png",
  "/assets/umoney-36.svg",
];

const sellerGamePool = marketplaceGames.map((game) => ({
  gameId: game.id,
  name: game.name,
  subtitle: game.productCategories[0] ?? game.name,
  image: game.icon,
  group: game.group,
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
  { gameId: "roblox", name: "Roblox", subtitle: "Робуксы", image: "/assets/app-roblox.png", group: "mobile" as const },
  { gameId: "telegram", name: "Telegram", subtitle: "Премиум", image: "/assets/logo-telegram.png", group: "apps" as const },
  { gameId: "brawl-stars", name: "Brawl Stars", subtitle: "Гемы", image: "/assets/app-brawl-stars.png", group: "mobile" as const },
  { gameId: "cs2", name: "Counter-Strike 2", subtitle: "Аккаунты", image: "/assets/cs2-logo.png", group: "games" as const },
  { gameId: "pubg", name: "PUBG Mobile", subtitle: "UC", image: "/assets/app-pubg.png", group: "mobile" as const },
  { gameId: "chatgpt", name: "ChatGPT", subtitle: "Plus", image: "/assets/app-chatgpt.png", group: "apps" as const },
];

export const popularSellerItems: SellerGameItem[] = Array.from({ length: 12 }, (_, index) => {
  const item = popularPool[index % popularPool.length];

  return {
    id: `popular-${index}`,
    ...item,
  };
});

export const SELLER_FEE_PERCENT = 10;

export interface SellerTermItem {
  id: string;
  label: string;
  dotIcon: string;
}

export const sellerTermsRequirements: SellerTermItem[] = [
  {
    id: "accurate-info",
    label: "Заполнить достоверную информацию о товаре",
    dotIcon: "/assets/green-dot.svg",
  },
  {
    id: "process-order",
    label: "Обработать заказ в течение 24 часов после оплаты",
    dotIcon: "/assets/green-dot.svg",
  },
  {
    id: "site-chat",
    label: "Общаться только через чат на сайте",
    dotIcon: "/assets/green-dot.svg",
  },
];

export const sellerTermsProhibited: SellerTermItem[] = [
  {
    id: "illegal-goods",
    label: "Запрещено продавать товары, полученные нелегальным путем",
    dotIcon: "/assets/red-dot.svg",
  },
  {
    id: "direct-payment",
    label: "Запрещено получать оплату на прямые реквизиты",
    dotIcon: "/assets/red-dot.svg",
  },
];
