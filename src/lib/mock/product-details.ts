import { getGameById } from "./games";
import { products, type Product } from "./products";

export interface ProductDetail extends Product {
  detailImage: string;
  deliveryMethod: string;
  deliveryTitle: string;
  deliveryDescription: string;
  descriptionTitle: string;
  descriptionSubtitle: string;
  descriptionText: string;
  notes: string[];
  sellerName: string;
  sellerStoreInfo: string;
  sellerChatInfo: string;
  refundPolicies: string[];
  reviewCount: number;
  reviewRating: number;
}

const gameDetailTemplates: Record<
  string,
  Omit<ProductDetail, keyof Product | "reviewCount" | "reviewRating">
> = {
  cs2: {
    detailImage: "/assets/cs2-hero-bg.png",
    deliveryMethod: "Передача данных",
    deliveryTitle: "Способ получения",
    deliveryDescription: "Данные от аккаунта или предмет отправляются в чат заказа",
    descriptionTitle: "Описание",
    descriptionSubtitle: "Как получить товар",
    descriptionText:
      "После оплаты продавец отправит данные в чат заказа. Проверьте аккаунт сразу после получения.",
    notes: [
      "⚠️ Не меняйте пароль и email в первые 24 часа после покупки.",
      "⚠️ Сохраните скриншоты переписки до полного подтверждения сделки.",
    ],
    sellerName: "Playnox",
    sellerStoreInfo: "Проверенный продавец CS2-товаров",
    sellerChatInfo: "Напишите в чат заказа, если нужна помощь с входом",
    refundPolicies: [
      "Возврат, если товар не доставлен в течение 24 часов",
      "Возврат невозможен после успешного входа в аккаунт",
    ],
  },
  roblox: {
    detailImage: "/assets/product-roblox-v2.png",
    deliveryMethod: "Передача аккаунта",
    deliveryTitle: "Способ получения",
    deliveryDescription: "Данные от аккаунта или Robux отправляются в чат заказа",
    descriptionTitle: "Описание",
    descriptionSubtitle: "Как получить товар",
    descriptionText:
      "После оплаты продавец передаст логин и пароль или пополнит Robux на указанный аккаунт.",
    notes: [
      "⚠️ Сразу после получения смените пароль и привяжите email.",
      "⚠️ Укажите корректный username Roblox при оформлении заказа.",
    ],
    sellerName: "Playnox",
    sellerStoreInfo: "Магазин Roblox-товаров с рейтингом 4.7+",
    sellerChatInfo: "Ответ в чате в течение 15 минут в рабочее время",
    refundPolicies: [
      "Возврат, если Robux не зачислены в течение 2 часов",
      "Возврат невозможен после успешной передачи аккаунта",
    ],
  },
  telegram: {
    detailImage: "/assets/product-detail-telegram.png",
    deliveryMethod: "Подарок",
    deliveryTitle: "Способ получения",
    deliveryDescription: "Отправка Премиума подарком (без входа в аккаунт)",
    descriptionTitle: "Описание",
    descriptionSubtitle: "Кол-во месяцев",
    descriptionText: "6 месяцев",
    notes: [
      "⚠️ Обратите внимание: данная подписка действует только для аккаунтов без активной подписки Telegram Premium.",
      "Зачисление по @username — быстро и без входа в ваш аккаунт ⚡\nМаксимальная безопасность — не нужны данные для входа или коды подтверждения 🔒",
    ],
    sellerName: "Playnox",
    sellerStoreInfo: "Официальный магазин",
    sellerChatInfo: "После покупки будет доступен чат с продавцом",
    refundPolicies: [
      "Возврат средств, если вы не получили товар",
      "Возврат средств, если товар не соответствует описанию",
    ],
  },
  "brawl-stars": {
    detailImage: "/assets/product-brawl-v2-1.png",
    deliveryMethod: "Пополнение по ID",
    deliveryTitle: "Способ получения",
    deliveryDescription: "Гемы зачисляются на аккаунт по Player Tag",
    descriptionTitle: "Описание",
    descriptionSubtitle: "Как получить товар",
    descriptionText:
      "Укажите Player Tag из профиля Brawl Stars. Гемы поступят на аккаунт в течение 5–30 минут.",
    notes: [
      "⚠️ Player Tag начинается с # и указан в профиле игры.",
      "⚠️ Не меняйте регион аккаунта во время пополнения.",
    ],
    sellerName: "Playnox",
    sellerStoreInfo: "Продавец Brawl Stars с 3200+ продаж",
    sellerChatInfo: "Пришлите скрин профиля, если гемы не пришли вовремя",
    refundPolicies: [
      "Возврат, если гемы не зачислены в течение 2 часов",
      "Возврат невозможен после подтверждения зачисления",
    ],
  },
  pubg: {
    detailImage: "/assets/product-pubg-v2.png",
    deliveryMethod: "Пополнение по ID",
    deliveryTitle: "Способ получения",
    deliveryDescription: "UC зачисляются на аккаунт по Player ID",
    descriptionTitle: "Описание",
    descriptionSubtitle: "Как получить товар",
    descriptionText:
      "Укажите Player ID из профиля PUBG Mobile. UC поступят на аккаунт автоматически.",
    notes: [
      "⚠️ Player ID — числовой идентификатор в настройках профиля.",
      "⚠️ Проверьте регион аккаунта перед оплатой.",
    ],
    sellerName: "Playnox",
    sellerStoreInfo: "Проверенный продавец UC для PUBG Mobile",
    sellerChatInfo: "Ответ в чате в течение 30 минут",
    refundPolicies: [
      "Возврат, если UC не зачислены в течение 1 часа",
      "Возврат невозможен после подтверждения зачисления",
    ],
  },
  standoff: {
    detailImage: "/assets/app-standoff.png",
    deliveryMethod: "Пополнение по ID",
    deliveryTitle: "Способ получения",
    deliveryDescription: "Голда или скины передаются по Game ID",
    descriptionTitle: "Описание",
    descriptionSubtitle: "Как получить товар",
    descriptionText:
      "Укажите Game ID из профиля Standoff 2. Голда зачисляется в течение 10–60 минут.",
    notes: [
      "⚠️ Game ID указан в настройках профиля игры.",
      "⚠️ Не входите в игру во время пополнения.",
    ],
    sellerName: "Playnox",
    sellerStoreInfo: "Магазин Standoff 2 с быстрой доставкой",
    sellerChatInfo: "Напишите в чат, если голда не пришла вовремя",
    refundPolicies: [
      "Возврат, если товар не доставлен в течение 2 часов",
      "Возврат невозможен после зачисления голды",
    ],
  },
  "mobile-legends": {
    detailImage: "/assets/app-mobile-legends.png",
    deliveryMethod: "Пополнение по ID",
    deliveryTitle: "Способ получения",
    deliveryDescription: "Алмазы зачисляются на аккаунт по User ID и Zone ID",
    descriptionTitle: "Описание",
    descriptionSubtitle: "Как получить товар",
    descriptionText:
      "Укажите User ID и Zone ID из профиля Mobile Legends. Алмазы поступят в течение 5–30 минут.",
    notes: [
      "⚠️ User ID и Zone ID указаны в профиле игры.",
      "⚠️ Проверьте сервер перед оплатой.",
    ],
    sellerName: "Playnox",
    sellerStoreInfo: "Продавец алмазов Mobile Legends",
    sellerChatInfo: "Ответ в чате в течение 20 минут",
    refundPolicies: [
      "Возврат, если алмазы не зачислены в течение 2 часов",
      "Возврат невозможен после подтверждения зачисления",
    ],
  },
  "clash-royale": {
    detailImage: "/assets/product-clash-v2-1.png",
    deliveryMethod: "Передача данных",
    deliveryTitle: "Способ получения",
    deliveryDescription: "Данные аккаунта или гемы отправляются в чат заказа",
    descriptionTitle: "Описание",
    descriptionSubtitle: "Как получить товар",
    descriptionText:
      "После оплаты продавец передаст данные аккаунта или пополнит гемы на Supercell ID.",
    notes: [
      "⚠️ Для гемов укажите email Supercell ID.",
      "⚠️ Смените пароль сразу после получения аккаунта.",
    ],
    sellerName: "Playnox",
    sellerStoreInfo: "Магазин Clash Royale с 1800+ продаж",
    sellerChatInfo: "Напишите в чат при любых вопросах по аккаунту",
    refundPolicies: [
      "Возврат, если товар не доставлен в течение 24 часов",
      "Возврат невозможен после входа в аккаунт",
    ],
  },
  tarkov: {
    detailImage: "/assets/product-tarkov-v2.png",
    deliveryMethod: "Передача в игре",
    deliveryTitle: "Способ получения",
    deliveryDescription: "Предметы передаются в рейде или ключ отправляется в чат",
    descriptionTitle: "Описание",
    descriptionSubtitle: "Как получить товар",
    descriptionText:
      "После оплаты продавец свяжется для передачи предметов в рейде или отправит ключ активации.",
    notes: [
      "⚠️ Для передачи предметов потребуется ваш никнейм в игре.",
      "⚠️ Ключи EOD активируются только один раз.",
    ],
    sellerName: "Playnox",
    sellerStoreInfo: "Продавец Tarkov с 1400+ сделок",
    sellerChatInfo: "Согласуйте время передачи в чате заказа",
    refundPolicies: [
      "Возврат, если товар не доставлен в течение 48 часов",
      "Возврат невозможен после передачи предметов или активации ключа",
    ],
  },
  chatgpt: {
    detailImage: "/assets/app-chatgpt.png",
    deliveryMethod: "Активация на email",
    deliveryTitle: "Способ получения",
    deliveryDescription: "Подписка активируется на указанный email",
    descriptionTitle: "Описание",
    descriptionSubtitle: "Как получить товар",
    descriptionText:
      "После оплаты укажите email. ChatGPT Plus будет активирован в течение 1–6 часов.",
    notes: [
      "⚠️ Email должен быть привязан к аккаунту OpenAI.",
      "⚠️ Не оформляйте заказ, если уже есть активная подписка.",
    ],
    sellerName: "Playnox",
    sellerStoreInfo: "Магазин AI-подписок с рейтингом 4.9",
    sellerChatInfo: "Напишите в чат, если активация задерживается",
    refundPolicies: [
      "Возврат, если подписка не активирована в течение 24 часов",
      "Возврат невозможен после успешной активации",
    ],
  },
  claude: {
    detailImage: "/assets/app-claude.png",
    deliveryMethod: "Активация на email",
    deliveryTitle: "Способ получения",
    deliveryDescription: "Подписка Claude Pro активируется на email",
    descriptionTitle: "Описание",
    descriptionSubtitle: "Как получить товар",
    descriptionText:
      "После оплаты укажите email аккаунта Anthropic. Pro будет активирован в течение 1–6 часов.",
    notes: [
      "⚠️ Email должен быть привязан к аккаунту Anthropic.",
      "⚠️ Проверьте, что нет активной подписки перед заказом.",
    ],
    sellerName: "Playnox",
    sellerStoreInfo: "Магазин AI-подписок с рейтингом 4.9",
    sellerChatInfo: "Ответ в чате в течение 2 часов",
    refundPolicies: [
      "Возврат, если подписка не активирована в течение 24 часов",
      "Возврат невозможен после успешной активации",
    ],
  },
  tiktok: {
    detailImage: "/assets/app-tiktok.png",
    deliveryMethod: "Пополнение по username",
    deliveryTitle: "Способ получения",
    deliveryDescription: "Coins зачисляются на аккаунт по username TikTok",
    descriptionTitle: "Описание",
    descriptionSubtitle: "Как получить товар",
    descriptionText:
      "Укажите username TikTok без @. Coins поступят на аккаунт в течение 5–30 минут.",
    notes: [
      "⚠️ Username должен совпадать с профилем TikTok.",
      "⚠️ Аккаунт должен быть старше 30 дней.",
    ],
    sellerName: "Playnox",
    sellerStoreInfo: "Продавец TikTok Coins",
    sellerChatInfo: "Напишите в чат, если coins не пришли",
    refundPolicies: [
      "Возврат, если coins не зачислены в течение 2 часов",
      "Возврат невозможен после подтверждения зачисления",
    ],
  },
  windows: {
    detailImage: "/assets/product-windows-v2-1.png",
    deliveryMethod: "Ключ активации",
    deliveryTitle: "Способ получения",
    deliveryDescription: "Ключ отправляется в чат заказа и на email",
    descriptionTitle: "Описание",
    descriptionSubtitle: "Как получить товар",
    descriptionText:
      "После оплаты вы получите ключ активации Windows или Office. Инструкция по активации прилагается.",
    notes: [
      "⚠️ Один ключ — одна активация. Сохраните ключ после использования.",
      "⚠️ Проверьте совместимость версии Windows перед покупкой.",
    ],
    sellerName: "Playnox",
    sellerStoreInfo: "Магазин лицензий с 15600+ продаж",
    sellerChatInfo: "Поможем с активацией в чате заказа",
    refundPolicies: [
      "Возврат, если ключ не работает и не был активирован",
      "Возврат невозможен после успешной активации",
    ],
  },
  "app-store": {
    detailImage: "/assets/app-appstore.png",
    deliveryMethod: "Код на email",
    deliveryTitle: "Способ получения",
    deliveryDescription: "Gift Card код отправляется на email",
    descriptionTitle: "Описание",
    descriptionSubtitle: "Как получить товар",
    descriptionText:
      "После оплаты код подарочной карты App Store будет отправлен на указанный email.",
    notes: [
      "⚠️ Код действителен для российского App Store.",
      "⚠️ Сохраните код — повторная отправка невозможна.",
    ],
    sellerName: "Playnox",
    sellerStoreInfo: "Магазин подарочных карт",
    sellerChatInfo: "Напишите в чат, если код не пришёл на email",
    refundPolicies: [
      "Возврат, если код не отправлен в течение 1 часа",
      "Возврат невозможен после активации кода",
    ],
  },
  psn: {
    detailImage: "/assets/platform-psn.png",
    deliveryMethod: "Пополнение кошелька",
    deliveryTitle: "Способ получения",
    deliveryDescription: "Средства зачисляются на PSN Wallet по email",
    descriptionTitle: "Описание",
    descriptionSubtitle: "Как получить товар",
    descriptionText:
      "Укажите email аккаунта PlayStation Network. Средства поступят на кошелёк в течение 1–6 часов.",
    notes: [
      "⚠️ Email должен совпадать с аккаунтом PSN.",
      "⚠️ Регион аккаунта — Россия/СНГ.",
    ],
    sellerName: "Playnox",
    sellerStoreInfo: "Магазин PlayStation-товаров",
    sellerChatInfo: "Ответ в чате в течение 2 часов",
    refundPolicies: [
      "Возврат, если средства не зачислены в течение 24 часов",
      "Возврат невозможен после зачисления на кошелёк",
    ],
  },
  xbox: {
    detailImage: "/assets/platform-xbox.png",
    deliveryMethod: "Код активации",
    deliveryTitle: "Способ получения",
    deliveryDescription: "Код Game Pass отправляется в чат заказа",
    descriptionTitle: "Описание",
    descriptionSubtitle: "Как получить товар",
    descriptionText:
      "После оплаты вы получите код Xbox Game Pass Ultimate. Активируйте на account.microsoft.com.",
    notes: [
      "⚠️ Код действителен для новых подписок или продления.",
      "⚠️ Проверьте регион аккаунта Microsoft.",
    ],
    sellerName: "Playnox",
    sellerStoreInfo: "Магазин Xbox-подписок",
    sellerChatInfo: "Поможем с активацией в чате",
    refundPolicies: [
      "Возврат, если код не работает и не был активирован",
      "Возврат невозможен после активации подписки",
    ],
  },
};

const defaultTemplate = gameDetailTemplates.telegram;

const overrides: Partial<Record<string, Partial<ProductDetail>>> = {
  "telegram-1": {
    title: "Telegram Premium — 12 месяцев по username",
  },
  "roblox-1": {
    descriptionText: "Аккаунт с редкими предметами, 50K Robux и Premium статусом.",
  },
};

function getTemplateForProduct(product: Product) {
  return gameDetailTemplates[product.gameId] ?? defaultTemplate;
}

export function getProductDetail(id: string): ProductDetail | undefined {
  const product = products.find((item) => item.id === id);
  if (!product) return undefined;

  const template = getTemplateForProduct(product);

  return {
    ...template,
    ...product,
    detailImage: product.image,
    sellerName: template.sellerName,
    sellerStoreInfo: template.sellerStoreInfo,
    sellerChatInfo: template.sellerChatInfo,
    refundPolicies: template.refundPolicies,
    reviewCount: product.reviews,
    reviewRating: product.rating,
    ...overrides[id],
  };
}

export function getSimilarProducts(id: string): Product[] {
  const current = products.find((item) => item.id === id);
  if (!current) return products.slice(0, 8);

  return products.filter((item) => item.id !== id && item.gameId === current.gameId).slice(0, 8);
}

export interface UserCreatedProductInput {
  id: string;
  gameId: string;
  categoryLabel: string;
  title: string;
  price: number;
  description: string;
  comment: string;
  deliveryMethodLabel?: string;
}

export function buildUserProductDetail(input: UserCreatedProductInput): ProductDetail {
  const game = getGameById(input.gameId);
  const sampleProduct = products.find((item) => item.gameId === input.gameId);
  const template = gameDetailTemplates[input.gameId] ?? defaultTemplate;
  const fallbackImage = sampleProduct?.image ?? game?.logo ?? "/assets/cs2-hero-bg.png";
  const descriptionText =
    input.description.trim() ||
    input.comment.trim() ||
    template.descriptionText;

  return {
    id: input.id,
    gameId: input.gameId,
    game: game?.name ?? input.gameId,
    category: input.categoryLabel,
    title: input.title,
    titleLines: [input.title],
    image: fallbackImage,
    logo: game?.logo ?? fallbackImage,
    detailImage: fallbackImage,
    price: input.price,
    rating: 0,
    reviews: 0,
    seller: "Client",
    sellerAvatar: "/assets/avatar-placeholder.svg",
    sellerRating: 1,
    sellerReviews: 0,
    sellerSales: 0,
    sellerOnline: true,
    deliveryMethod: input.deliveryMethodLabel ?? template.deliveryMethod,
    deliveryTitle: template.deliveryTitle,
    deliveryDescription: template.deliveryDescription,
    descriptionTitle: template.descriptionTitle,
    descriptionSubtitle: template.descriptionSubtitle,
    descriptionText,
    notes: template.notes,
    sellerName: template.sellerName,
    sellerStoreInfo: "Ваш опубликованный товар",
    sellerChatInfo: template.sellerChatInfo,
    refundPolicies: template.refundPolicies,
    reviewCount: 0,
    reviewRating: 0,
  };
}

export function isUserCreatedProductId(id: string) {
  return id.startsWith("created-");
}
