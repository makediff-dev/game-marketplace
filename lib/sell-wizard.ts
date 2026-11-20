import type { TFulfillmentFormat } from "@/types/fulfillment";

export const SELL_WIZARD_FEE_PERCENT = 10;
export const SELL_WIZARD_TOTAL_STEPS = 3;
/** Seller's note on how the buyer gets the goods, as the API checks it. */
export const INSTRUCTION_MIN = 10;
export const INSTRUCTION_MAX = 2000;
export const SELL_TERMS_STORAGE_KEY = "playnox-seller-terms-accepted";
/** Listing-flow requirements modal — accepted once (first create step only). */
export const SELL_LISTING_TERMS_STORAGE_KEY = "playnox-listing-terms-accepted";

export type TSellWizardApp = {
  id: string;
  gameId: string;
  name: string;
  image: string;
  group: "games" | "mobile" | "apps";
  badge?: string;
};

export type TSellCategory = {
  id: string;
  label: string;
  hasDiscount?: boolean;
};

export type TSellTermItem = {
  id: string;
  label: string;
  dotIcon: string;
};

export type TDeliveryMethod = {
  id: string;
  label: string;
  description: string;
};

export type TListingType = {
  id: "one-time" | "permanent";
  label: string;
  description: string;
};

export const SELL_WIZARD_GROUPS = [
  { id: "games" as const, label: "Игры" },
  { id: "mobile" as const, label: "Мобильные" },
  { id: "apps" as const, label: "Приложения" },
];

export const SELL_WIZARD_APPS: TSellWizardApp[] = [
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

const DEFAULT_REQUIREMENTS: TSellTermItem[] = [
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

const ROBLOX_ITEMS_PROHIBITED: TSellTermItem[] = [
  {
    id: "dup-items",
    label:
      "Запрещено продавать дюп-предметы или предметы, полученные с помощью багов игры",
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
    label:
      "Запрещено публиковать товары мод-серверов Roblox (плейс с безлимитными ресурсами)",
    dotIcon: "/assets/red-dot.svg",
  },
];

const ROBLOX_TRADE_REQUIREMENTS: TSellTermItem[] = [
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

const CATEGORIES_BY_GAME: Record<string, TSellCategory[]> = {
  steam: [
    { id: "topup", label: "Пополнение" },
    { id: "keys", label: "Ключи" },
    { id: "gifts", label: "Подарки" },
  ],
  cs2: [
    { id: "accounts", label: "Аккаунты" },
    { id: "items", label: "Предметы" },
    { id: "services", label: "Услуги" },
    { id: "other", label: "Другое" },
  ],
  roblox: [
    { id: "robux", label: "Робуксы" },
    { id: "items", label: "Предметы" },
    { id: "accounts", label: "Аккаунты" },
    { id: "boost", label: "Буст" },
    { id: "services", label: "Услуги" },
    { id: "subscriptions", label: "Подписки", hasDiscount: true },
    { id: "currency", label: "Игровая валюта" },
    { id: "other", label: "Другое" },
  ],
  "brawl-stars": [
    { id: "offers", label: "Акции", hasDiscount: true },
    { id: "accounts", label: "Аккаунты" },
    { id: "gems", label: "Гемы", hasDiscount: true },
    { id: "boost", label: "Буст" },
    { id: "promotions", label: "Промоакции" },
    { id: "services", label: "Услуги" },
    { id: "other", label: "Другое" },
    { id: "friends", label: "Друзья" },
  ],
};

const FALLBACK_CATEGORIES: TSellCategory[] = [
  { id: "accounts", label: "Аккаунты" },
  { id: "currency", label: "Игровая валюта" },
  { id: "items", label: "Предметы" },
  { id: "services", label: "Услуги" },
  { id: "boost", label: "Буст" },
  { id: "other", label: "Другое" },
];

export const SELLER_TERMS_REQUIREMENTS: TSellTermItem[] = [
  ...DEFAULT_REQUIREMENTS,
  {
    id: "site-chat",
    label: "Общаться только через чат на сайте",
    dotIcon: "/assets/green-dot.svg",
  },
];

export const SELLER_TERMS_PROHIBITED: TSellTermItem[] = [
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

export const SELL_LISTING_TYPES: TListingType[] = [
  {
    id: "one-time",
    label: "Разовое объявление",
    description: "Товар снимается с продажи после одной успешной сделки",
  },
  {
    id: "permanent",
    label: "Постоянное объявление",
    description: "Товар остаётся в каталоге и доступен для повторных покупок",
  },
];

export const SELL_AFTER_SALE_INSTRUCTIONS = [
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
    text: " если все в порядке, покупатель подтвердит получение. В ином случае, после выполнения заказа Playnox автоматически подтвердит получение по истечению таймера на странице сделки.",
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

export const PRODUCT_GENRES = [
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

export const PRODUCT_REGIONS = [
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

export const ROBLOX_SERVERS = [
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

const SELL_ATTRIBUTE_FILTER_KEYS = new Set(["genre", "region", "server"]);

export type TSellCharacteristicGroup = {
  key: "genre" | "region" | "server" | string;
  label: string;
  options: string[];
};

/** Prefer Strapi filter-fields (genre/region/server); fallback to local lists. */
export function sellCharacteristicGroups(options: {
  filters?: Array<{
    key: string;
    label: string;
    fieldType: string;
    sortOrder: number;
    offerTypeSlug?: string;
    config?: { options?: Array<{ value: string; label: string }> };
  }>;
  offerTypeSlug?: string | null;
  includeServerFallback?: boolean;
}): TSellCharacteristicGroup[] {
  const fromStrapi = (options.filters ?? [])
    .filter((field) => SELL_ATTRIBUTE_FILTER_KEYS.has(field.key))
    .filter(
      (field) =>
        !field.offerTypeSlug ||
        !options.offerTypeSlug ||
        field.offerTypeSlug === options.offerTypeSlug,
    )
    .filter((field) => (field.config?.options?.length ?? 0) > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((field) => ({
      key: field.key,
      label: field.label,
      options: (field.config?.options ?? []).map(
        (option) => option.label || option.value,
      ),
    }));

  if (fromStrapi.length > 0) {
    return fromStrapi;
  }

  const fallback: TSellCharacteristicGroup[] = [
    { key: "genre", label: "Жанр", options: PRODUCT_GENRES },
    { key: "region", label: "Регион", options: PRODUCT_REGIONS },
  ];

  if (options.includeServerFallback) {
    fallback.unshift({
      key: "server",
      label: "Сервер",
      options: ROBLOX_SERVERS,
    });
  }

  return fallback;
}

export const STEP_TITLES: Record<number, string> = {
  2: "Выберите категорию",
  5: "Тип объявления",
  6: "Страница товара",
};

export function getGameById(gameId: string): TSellWizardApp | undefined {
  return SELL_WIZARD_APPS.find(
    (app) => app.gameId === gameId || app.id === gameId,
  );
}

/** Map Strapi catalog category → sell-wizard game card. */
export function catalogCategoryToSellApp(category: {
  slug: string;
  name: string;
  icon: string;
  badge?: string;
  segmentSlug?: string;
}): TSellWizardApp {
  const segment = category.segmentSlug;
  const group: TSellWizardApp["group"] =
    segment === "mobile" || segment === "apps" || segment === "games"
      ? segment
      : "games";

  return {
    id: category.slug,
    gameId: category.slug,
    name: category.name,
    image: category.icon,
    group,
    badge: category.badge,
  };
}

export function getSellCategories(gameId: string): TSellCategory[] {
  return CATEGORIES_BY_GAME[gameId] ?? FALLBACK_CATEGORIES;
}

export function offerTypesToSellCategories(
  offerTypes: Array<{ slug: string; name: string }>,
): TSellCategory[] {
  if (offerTypes.length === 0) {
    return FALLBACK_CATEGORIES;
  }

  return offerTypes.map((item) => ({
    id: item.slug,
    label: item.name,
  }));
}

export function getCategoryTerms(
  gameId: string,
  categoryId: string,
): {
  title: string;
  variant: "requirements" | "prohibited";
  items: TSellTermItem[];
} {
  if (gameId === "roblox" && categoryId === "items") {
    return {
      title: "Запрещено",
      variant: "prohibited",
      items: ROBLOX_ITEMS_PROHIBITED,
    };
  }

  return {
    title: "Требования",
    variant: "requirements",
    items: DEFAULT_REQUIREMENTS,
  };
}

type TMethodSource = Pick<TFulfillmentFormat, "slug" | "name"> &
  Partial<Pick<TFulfillmentFormat, "description" | "kind" | "deadlineHours" | "fields">>;

/** What the seller should know before picking a method, set by the admin. */
export function deliverySummary(format: TMethodSource): string {
  const fields = format.fields ?? [];
  const labels = (side: "buyer" | "seller") =>
    fields.filter((field) => field.filledBy === side).map((field) => field.label);
  const buyer = labels("buyer");
  const seller = labels("seller");
  const parts = [format.description?.trim() || ""];

  parts.push(
    buyer.length > 0
      ? `Покупатель укажет: ${buyer.join(", ")}`
      : "Покупатель ничего не вводит",
  );

  if (format.kind === "stock") {
    parts.push(
      seller.length > 0
        ? `Выдача сразу после оплаты из вашего склада: ${seller.join(", ")}`
        : "Выдача сразу после оплаты из вашего склада",
    );
  } else {
    if (seller.length > 0) {
      parts.push(`Вы передадите: ${seller.join(", ")}`);
    }
    if (format.deadlineHours) {
      parts.push(`Срок: ${format.deadlineHours} ч`);
    }
  }

  return parts.filter(Boolean).join(" · ");
}

export function fulfillmentFormatsToDeliveryMethods(
  formats: TMethodSource[],
): TDeliveryMethod[] {
  return formats.map((format) => ({
    id: format.slug,
    label: format.name,
    description: deliverySummary(format),
  }));
}

export function getDeliveryTerms(
  gameId: string,
  categoryId: string,
  deliveryMethodId: string,
): {
  title: string;
  variant: "requirements" | "prohibited";
  items: TSellTermItem[];
} {
  if (
    gameId === "roblox" &&
    categoryId === "items" &&
    (deliveryMethodId === "trade" || deliveryMethodId === "roblox-trade")
  ) {
    return {
      title: "Требования",
      variant: "requirements",
      items: ROBLOX_TRADE_REQUIREMENTS,
    };
  }

  return {
    title: "Требования",
    variant: "requirements",
    items: DEFAULT_REQUIREMENTS,
  };
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.max(0, Math.round(value)));
}

export function calcIncome(
  price: number,
  feePercent = SELL_WIZARD_FEE_PERCENT,
): number {
  return Math.max(0, Math.round(price * (1 - feePercent / 100)));
}

export function readSellerTermsAccepted(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(SELL_TERMS_STORAGE_KEY) === "1";
}

export function writeSellerTermsAccepted(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SELL_TERMS_STORAGE_KEY, "1");
}

// The common requirements are accepted once; a category with its own
// prohibitions (Roblox items) is accepted on its own.
function listingTermsKey(
  gameId?: string | null,
  categoryId?: string | null,
): string {
  return gameId &&
    categoryId &&
    getCategoryTerms(gameId, categoryId).variant === "prohibited"
    ? `${gameId}:${categoryId}`
    : "common";
}

function readAcceptedTerms(): string[] {
  const raw = window.localStorage.getItem(SELL_LISTING_TERMS_STORAGE_KEY);

  // "1" is how acceptance was stored before: the common terms.
  if (raw === "1") {
    return ["common"];
  }

  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function readListingTermsAccepted(
  gameId?: string | null,
  categoryId?: string | null,
): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return readAcceptedTerms().includes(listingTermsKey(gameId, categoryId));
}

export function writeListingTermsAccepted(
  gameId?: string | null,
  categoryId?: string | null,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const key = listingTermsKey(gameId, categoryId);
  const accepted = readAcceptedTerms();
  if (!accepted.includes(key)) {
    window.localStorage.setItem(
      SELL_LISTING_TERMS_STORAGE_KEY,
      JSON.stringify([...accepted, key]),
    );
  }
}
