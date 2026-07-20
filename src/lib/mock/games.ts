export type GameGroup = "games" | "mobile" | "apps";

export type GameBadge = "new" | "viewed";

export interface GameDefinition {
  id: string;
  name: string;
  group: GameGroup;
  icon: string;
  catalogIcon: string;
  logo: string;
  href: string;
  badge?: GameBadge;
  badgeEmoji?: string;
  productCategories: string[];
}

export const marketplaceGames: GameDefinition[] = [
  {
    id: "steam",
    name: "Steam",
    group: "games",
    icon: "/assets/app-steam.png",
    catalogIcon: "/assets/catalog-steam.png",
    logo: "/assets/app-steam.png",
    href: "/categories/counter-strike-2",
    productCategories: ["Пополнение", "Ключи", "Подарки"],
  },
  {
    id: "cs2",
    name: "Counter-Strike 2",
    group: "games",
    icon: "/assets/cs2-logo.png",
    catalogIcon: "/assets/cs2-logo.png",
    logo: "/assets/cs2-logo.png",
    href: "/categories/counter-strike-2",
    badge: "new",
    productCategories: ["Аккаунты", "Скины", "Prime Status", "Буст"],
  },
  {
    id: "tarkov",
    name: "Escape from Tarkov",
    group: "games",
    icon: "/assets/logo-tarkov.png",
    catalogIcon: "/assets/logo-tarkov.png",
    logo: "/assets/logo-tarkov.png",
    href: "/categories?game=tarkov",
    productCategories: ["Предметы", "Аккаунты", "Ключи"],
  },
  {
    id: "psn",
    name: "PlayStation",
    group: "games",
    icon: "/assets/platform-psn.png",
    catalogIcon: "/assets/platform-psn.png",
    logo: "/assets/platform-psn.png",
    href: "/categories?game=psn",
    productCategories: ["Пополнение", "Подписка PS Plus"],
  },
  {
    id: "xbox",
    name: "Xbox",
    group: "games",
    icon: "/assets/platform-xbox.png",
    catalogIcon: "/assets/platform-xbox.png",
    logo: "/assets/platform-xbox.png",
    href: "/categories?game=xbox",
    productCategories: ["Пополнение", "Game Pass"],
  },
  {
    id: "brawl-stars",
    name: "Brawl Stars",
    group: "mobile",
    icon: "/assets/app-brawl-stars.png",
    catalogIcon: "/assets/catalog-brawl-stars.png",
    logo: "/assets/logo-brawl-stars.png",
    href: "/categories?game=brawl-stars",
    badge: "new",
    productCategories: ["Гемы", "Аккаунты", "Brawl Pass"],
  },
  {
    id: "roblox",
    name: "Roblox",
    group: "mobile",
    icon: "/assets/app-roblox.png",
    catalogIcon: "/assets/app-roblox.png",
    logo: "/assets/logo-roblox.png",
    href: "/categories?game=roblox",
    productCategories: ["Аккаунты", "Robux", "Premium"],
  },
  {
    id: "pubg",
    name: "PUBG Mobile",
    group: "mobile",
    icon: "/assets/app-pubg.png",
    catalogIcon: "/assets/catalog-pubg.png",
    logo: "/assets/app-pubg.png",
    href: "/categories?game=pubg",
    badge: "viewed",
    badgeEmoji: "👀",
    productCategories: ["UC", "Аккаунты", "Prime Plus"],
  },
  {
    id: "standoff",
    name: "Standoff 2",
    group: "mobile",
    icon: "/assets/app-standoff.png",
    catalogIcon: "/assets/app-standoff.png",
    logo: "/assets/app-standoff.png",
    href: "/categories?game=standoff",
    badge: "new",
    productCategories: ["Голда", "Скины", "Аккаунты"],
  },
  {
    id: "mobile-legends",
    name: "Mobile Legends",
    group: "mobile",
    icon: "/assets/app-mobile-legends.png",
    catalogIcon: "/assets/app-mobile-legends.png",
    logo: "/assets/app-mobile-legends.png",
    href: "/categories?game=mobile-legends",
    productCategories: ["Алмазы", "Starlight", "Аккаунты"],
  },
  {
    id: "clash-royale",
    name: "Clash Royale",
    group: "mobile",
    icon: "/assets/logo-clash-royale.png",
    catalogIcon: "/assets/logo-clash-royale.png",
    logo: "/assets/logo-clash-royale.png",
    href: "/categories?game=clash-royale",
    badge: "new",
    productCategories: ["Аккаунты", "Гемы", "Pass Royale"],
  },
  {
    id: "telegram",
    name: "Telegram",
    group: "apps",
    icon: "/assets/logo-telegram.png",
    catalogIcon: "/assets/logo-telegram.png",
    logo: "/assets/logo-telegram.png",
    href: "/categories?game=telegram",
    productCategories: ["Премиум", "Звёзды", "Подарки"],
  },
  {
    id: "tiktok",
    name: "TikTok",
    group: "apps",
    icon: "/assets/app-tiktok.png",
    catalogIcon: "/assets/app-tiktok.png",
    logo: "/assets/app-tiktok.png",
    href: "/categories?game=tiktok",
    productCategories: ["Монеты", "Подарки"],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    group: "apps",
    icon: "/assets/app-chatgpt.png",
    catalogIcon: "/assets/app-chatgpt.png",
    logo: "/assets/app-chatgpt.png",
    href: "/categories?game=chatgpt",
    badge: "new",
    productCategories: ["Plus", "Team", "Pro"],
  },
  {
    id: "claude",
    name: "Claude",
    group: "apps",
    icon: "/assets/app-claude.png",
    catalogIcon: "/assets/app-claude.png",
    logo: "/assets/app-claude.png",
    href: "/categories?game=claude",
    productCategories: ["Pro", "Team"],
  },
  {
    id: "windows",
    name: "Windows",
    group: "apps",
    icon: "/assets/logo-windows.png",
    catalogIcon: "/assets/logo-windows.png",
    logo: "/assets/logo-windows.png",
    href: "/categories?game=windows",
    productCategories: ["Лицензии", "Office", "Активация"],
  },
  {
    id: "app-store",
    name: "App Store",
    group: "apps",
    icon: "/assets/app-appstore.png",
    catalogIcon: "/assets/app-appstore.png",
    logo: "/assets/app-appstore.png",
    href: "/categories?game=app-store",
    productCategories: ["Подарочные карты", "Подписки"],
  },
];

export const catalogGroupFilters = [
  {
    id: "games" as const,
    label: "🎮 Игры",
    count: marketplaceGames.filter((game) => game.group === "games").length,
  },
  {
    id: "mobile" as const,
    label: "📱 Мобильные игры",
    count: marketplaceGames.filter((game) => game.group === "mobile").length,
  },
  {
    id: "apps" as const,
    label: "🌐 Приложения",
    count: marketplaceGames.filter((game) => game.group === "apps").length,
  },
];

export const searchGameFilters = ["Все", ...marketplaceGames.slice(0, 8).map((game) => game.name)];

export function getGameById(id: string): GameDefinition | undefined {
  return marketplaceGames.find((game) => game.id === id);
}

export function getGamesByGroup(group: GameGroup): GameDefinition[] {
  return marketplaceGames.filter((game) => game.group === group);
}

export function getHomeScrollCategories() {
  return marketplaceGames.map((game) => ({
    id: game.id,
    name: game.name,
    image: game.icon,
    badge: game.badge === "new" ? "Новое" : game.badgeEmoji,
  }));
}
