import { catalogGroupFilters, getGameById, marketplaceGames, type GameGroup } from "./games";
import type { SellerTermItem } from "./seller";

export const SELL_WIZARD_TOTAL_STEPS = 5;
export const SELL_WIZARD_FEE_PERCENT = 10;

export interface SellCategory {
  id: string;
  label: string;
  hasDiscount?: boolean;
}

export interface SellDeliveryMethod {
  id: string;
  label: string;
  description: string;
}

export interface SellTermsBlock {
  title: string;
  titleIcon?: string;
  items: SellerTermItem[];
  variant: "requirements" | "prohibited";
}

const defaultCategoryTerms: SellerTermItem[] = [
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
];

const robloxItemsProhibited: SellerTermItem[] = [
  {
    id: "dup-items",
    label: "Запрещено продавать дюп-предметы или предметы, полученные с помощью багов игры",
    dotIcon: "/assets/red-dot.svg",
  },
  {
    id: "no-currency",
    label: "Запрещено публиковать игровую валюту в этой категории",
    dotIcon: "/assets/red-dot.svg",
  },
  {
    id: "no-login",
    label: "Запрещено выполнять заказ через вход в аккаунт покупателя",
    dotIcon: "/assets/red-dot.svg",
  },
  {
    id: "no-mod-servers",
    label: "Запрещено публиковать товары мод-серверов Roblox (плейс с безлимитными ресурсами)",
    dotIcon: "/assets/red-dot.svg",
  },
];

const robloxDeliveryMethods: SellDeliveryMethod[] = [
  {
    id: "trade",
    label: "Трейд",
    description: "Передача предметов трейдом",
  },
  {
    id: "mail",
    label: "Внутриигровая почта",
    description: "Передача предметов по никнейму",
  },
  {
    id: "gift",
    label: "Подарок",
    description: "Передача донатных предметов или игрового геймпасса",
  },
  {
    id: "promocode",
    label: "Промокод",
    description: "Активация подарочной карты",
  },
];

const robloxTradeRequirements: SellerTermItem[] = [
  {
    id: "use-trade",
    label: "Передать предметы, используя трейд в игре",
    dotIcon: "/assets/green-dot.svg",
  },
  {
    id: "save-screenshots",
    label: "Сохранить скриншоты, доказывающие передачу предмета",
    dotIcon: "/assets/green-dot.svg",
  },
];

const brawlStarsCategories: SellCategory[] = [
  { id: "offers", label: "Акции", hasDiscount: true },
  { id: "accounts", label: "Аккаунты" },
  { id: "gems", label: "Гемы", hasDiscount: true },
  { id: "boost", label: "Буст" },
  { id: "promotions", label: "Промоакции" },
  { id: "services", label: "Услуги" },
  { id: "other", label: "Другое" },
  { id: "friends", label: "Друзья" },
];

const robloxCategories: SellCategory[] = [
  { id: "robux", label: "Робуксы" },
  { id: "items", label: "Предметы" },
  { id: "accounts", label: "Аккаунты" },
  { id: "boost", label: "Буст" },
  { id: "services", label: "Услуги" },
  { id: "subscriptions", label: "Подписки", hasDiscount: true },
  { id: "currency", label: "Игровая валюта" },
  { id: "other", label: "Другое" },
];

const sellCategoriesByGame: Record<string, SellCategory[]> = {
  roblox: robloxCategories,
  "brawl-stars": brawlStarsCategories,
};

export const sellWizardCategoryTabs = catalogGroupFilters;

export const sellWizardTextGames = [
  "PUBG Mobile",
  "PlayStation",
  "Brawl Stars",
  "Roblox",
  "Telegram",
  "ChatGPT",
  "App Store",
  "Claude",
  "Standoff 2",
  "Genshin Impact",
  "Mobile Legends",
  "TikTok",
  "Steam",
  "Minecraft",
  "Valorant",
  "Clash of Clans",
  "Fortnite",
  "Clash Royale",
  "Counter-Strike",
  "FC Mobile",
  "Free Fire",
  "Dota 2",
  "Arena Breakout",
  "Spotify",
  "Discord",
];

export const robloxServers = [
  "Grow a Garden 2",
  "Adopt Me",
  "Sailor Piece",
  "Brookhaven RP",
  "Kick a Lucky Block",
  "Spin a Soccer Card",
  "Blox Fruits",
  "Animal Hospital",
  "Survive Zombie Arena",
  "Rivals",
  "Steal a Brainrot",
  "99 Nights in the Forest",
  "Fish It!",
  "Grow a Garden",
  "Murder Mystery 2",
  "Jujutsu Shenanigans",
];

export const productGenres = [
  "Стратегия",
  "Симулятор",
  "Гонки",
  "Ролевая",
  "Приключения",
  "Спорт",
  "Инди",
  "Казуальная",
  "ММО",
  "Шутер",
  "Платформер",
  "Рогалик",
  "Файтинг",
  "Головоломка",
  "Карточные и настольные игры",
  "Глобальная стратегия",
  "Метроидвания",
  "Выживание",
  "Фермерство и крафтинг",
  "Экшен",
  "Песочница",
  "Другое",
];

export const productRegions = [
  "Турция",
  "Индия",
  "Франция",
  "США",
  "Польша",
  "Нидерланды",
  "Германия",
  "Россия",
  "СНГ",
  "Другое",
];

export interface SellAfterSaleInstruction {
  id: string;
  term: string;
  text: string;
}

export const sellAfterSaleInstructions: SellAfterSaleInstruction[] = [
  {
    id: "hold",
    term: "Удержание средств:",
    text: " средства удерживаются на стороне площадки для безопасности сделки.",
  },
  {
    id: "fulfillment",
    term: "Выполнение заказа:",
    text: " просмотрите чат вашей сделки и выполните заказ. У вас есть 24 часа чтобы предоставить товар. Нажмите кнопку «Я выполнил» в том случае, если товар был предоставлен покупателю. После нажатия, сделка перейдет на этап подтверждения покупателем.",
  },
  {
    id: "check",
    term: "Проверка товара:",
    text: " если все в порядке, покупатель подтвердит получение. В ином случае, после выполнения заказа Playerok автоматически подтвердит получение по истечению таймера на странице сделки.",
  },
  {
    id: "problem",
    term: "Решение проблемы:",
    text: " помогите покупателю, если у него возникла проблема с получением товара. Если покупатель сообщит о проблеме — администрация вмешается в сделку. Сделка не завершится, пока проблема не будет решена.",
  },
  {
    id: "completion",
    term: "Завершение сделки:",
    text: " после подтверждения получения вам будет перечислена оплата. Для безопасности сделки средства будут находиться 🔒 В Заморозке. Их можно использовать только для оплаты Премиум-статусов. Через 48 часов средства размораживаются и доступны к выплате.",
  },
];

export function getBuyerFieldsAfterPayment(gameId: string, categoryId: string): string[] {
  if (gameId === "roblox" && categoryId === "items") {
    return ["Никнейм", "Сервер"];
  }

  if (categoryId === "accounts" || categoryId === "subscriptions") {
    return ["Логин", "Пароль"];
  }

  return ["Логин", "Пароль"];
}

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

export interface SellWizardAppItem {
  id: string;
  gameId: string;
  name: string;
  image: string;
  group: GameGroup;
  badge?: string;
}

export const sellWizardAppItems: SellWizardAppItem[] = [
  {
    id: "steam",
    gameId: "steam",
    name: "Steam",
    image: "/assets/sell-wizard/steam.png",
    group: "games",
  },
  {
    id: "cs2",
    gameId: "cs2",
    name: "Counter-Strike 2",
    image: "/assets/cs2-logo.png",
    group: "games",
    badge: "Новое",
  },
  {
    id: "tarkov",
    gameId: "tarkov",
    name: "Escape from Tarkov",
    image: "/assets/logo-tarkov.png",
    group: "games",
  },
  {
    id: "psn",
    gameId: "psn",
    name: "PlayStation",
    image: "/assets/platform-psn.png",
    group: "games",
  },
  {
    id: "xbox",
    gameId: "xbox",
    name: "Xbox",
    image: "/assets/platform-xbox.png",
    group: "games",
  },
  {
    id: "brawl-stars",
    gameId: "brawl-stars",
    name: "Brawl Stars",
    image: "/assets/sell-wizard/brawl-stars.png",
    group: "mobile",
    badge: "Новое",
  },
  {
    id: "roblox",
    gameId: "roblox",
    name: "Roblox",
    image: "/assets/sell-wizard/roblox.png",
    group: "mobile",
  },
  {
    id: "pubg",
    gameId: "pubg",
    name: "PUBG Mobile",
    image: "/assets/sell-wizard/pubg-mobile.png",
    group: "mobile",
    badge: "👀",
  },
  {
    id: "app-store",
    gameId: "app-store",
    name: "App Store",
    image: "/assets/sell-wizard/app-store.png",
    group: "apps",
  },
  {
    id: "chatgpt",
    gameId: "chatgpt",
    name: "ChatGPT",
    image: "/assets/sell-wizard/chatgpt.png",
    group: "apps",
    badge: "Новое",
  },
  {
    id: "claude",
    gameId: "claude",
    name: "Claude",
    image: "/assets/sell-wizard/claude.png",
    group: "apps",
  },
  {
    id: "standoff",
    gameId: "standoff",
    name: "Standoff 2",
    image: "/assets/sell-wizard/standoff.png",
    group: "mobile",
    badge: "Новое",
  },
  {
    id: "tiktok",
    gameId: "tiktok",
    name: "TikTok",
    image: "/assets/sell-wizard/tiktok.png",
    group: "apps",
  },
  {
    id: "mobile-legends",
    gameId: "mobile-legends",
    name: "Mobile Legends",
    image: "/assets/sell-wizard/mobile-legends.png",
    group: "mobile",
  },
  {
    id: "telegram",
    gameId: "telegram",
    name: "Telegram",
    image: "/assets/logo-telegram.png",
    group: "apps",
  },
];

export const SELL_WIZARD_MAX_VISIBLE = 60;

export function getSellWizardAppGrid(group: GameGroup, visibleCount: number): SellWizardAppItem[] {
  const pool = sellWizardAppItems.filter((item) => item.group === group);
  const count = Math.min(visibleCount, SELL_WIZARD_MAX_VISIBLE);

  if (pool.length === 0) {
    return [];
  }

  return Array.from({ length: count }, (_, index) => {
    const source = pool[index % pool.length];

    return {
      ...source,
      id: `${source.id}-${index}`,
    };
  });
}

export function getSellWizardGames(group: GameGroup) {
  return marketplaceGames.filter((game) => game.group === group);
}

export function getSellGameByName(name: string) {
  return marketplaceGames.find((game) => game.name.toLowerCase() === name.toLowerCase());
}

export function getSellCategories(gameId: string): SellCategory[] {
  const custom = sellCategoriesByGame[gameId];
  if (custom) {
    return custom;
  }

  const game = getGameById(gameId);
  if (!game) {
    return [];
  }

  return game.productCategories.map((label) => ({
    id: slugify(label),
    label,
  }));
}

export function getCategoryTermsKey(gameId: string, categoryId: string) {
  return `${gameId}-${categoryId}`;
}

export function getCategoryTerms(gameId: string, categoryId: string): SellTermsBlock {
  if (gameId === "roblox" && categoryId === "items") {
    return {
      title: "Запрещено",
      variant: "prohibited",
      items: robloxItemsProhibited,
    };
  }

  return {
    title: "Требования",
    variant: "requirements",
    items: defaultCategoryTerms,
  };
}

export function getDeliveryMethods(gameId: string, categoryId: string): SellDeliveryMethod[] {
  if (gameId === "roblox" && categoryId === "items") {
    return robloxDeliveryMethods;
  }

  return [
    {
      id: "manual",
      label: "Вручную",
      description: "Передача товара покупателю вручную",
    },
    {
      id: "auto",
      label: "Автовыдача",
      description: "Автоматическая передача после оплаты",
    },
  ];
}

export function getDeliveryTermsKey(gameId: string, categoryId: string, deliveryMethodId: string) {
  return `${gameId}-${categoryId}-${deliveryMethodId}`;
}

export function getDeliveryTerms(
  gameId: string,
  categoryId: string,
  deliveryMethodId: string,
): SellTermsBlock {
  if (gameId === "roblox" && categoryId === "items" && deliveryMethodId === "trade") {
    return {
      title: "Требования",
      variant: "requirements",
      items: robloxTradeRequirements,
    };
  }

  return {
    title: "Требования",
    variant: "requirements",
    items: defaultCategoryTerms,
  };
}

export function getSellWizardProgressStep(step: number) {
  return Math.min(Math.max(step, 1), SELL_WIZARD_TOTAL_STEPS);
}
