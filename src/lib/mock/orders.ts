import type { ProfileItemStatus } from "@/lib/mock/profile-items";
import { mockProfileItems } from "@/lib/mock/profile-items";
import { buildProductDetailFromProduct } from "@/lib/mock/product-details";
import type { ProductDetail } from "@/lib/mock/product-details";
import { formatPrice, products, type Product } from "@/lib/mock/products";

export type DealProgressStepId =
  | "created"
  | "awaiting_payment"
  | "paid"
  | "funds_frozen"
  | "seller_performing"
  | "awaiting_confirm"
  | "completed";

export type OrderActionType = "open_dispute" | "cancel_deal" | "write_seller";

export interface OrderAction {
  type: OrderActionType;
  label: string;
  variant: "secondary" | "ghost" | "accent";
}

export interface DealChatSystemMessage {
  id: string;
  text: string;
}

export interface DealChatUserMessage {
  id: string;
  author: string;
  text: string;
  time: string;
  isOwn?: boolean;
}

export interface OrderDetail {
  id: string;
  dealId: string;
  tab: "purchases" | "sales";
  status: ProfileItemStatus;
  dealStatusLabel: string;
  title: string;
  seller: string;
  buyer: string;
  price: number;
  commission: number;
  sellerPayout?: number;
  date: string;
  breadcrumbSection: string;
  currentStep: DealProgressStepId;
  progressMode: "timeline" | "summary";
  progressSummary?: string;
  moneyStatusTitle: string;
  showSellerPayout: boolean;
  actions: OrderAction[];
  stepDates?: Partial<Record<DealProgressStepId, string>>;
  chat: {
    systemMessages: DealChatSystemMessage[];
    messages: DealChatUserMessage[];
  };
}

export const DEAL_PROGRESS_STEPS: { id: DealProgressStepId; label: string }[] = [
  { id: "created", label: "Создана" },
  { id: "awaiting_payment", label: "Ожидает оплаты" },
  { id: "paid", label: "Оплачена" },
  { id: "funds_frozen", label: "Средства заморожены" },
  { id: "seller_performing", label: "Продавец выполняет" },
  { id: "awaiting_confirm", label: "Ожидает подтверждения" },
  { id: "completed", label: "Завершена" },
];

export const DEAL_STEP_DESCRIPTIONS: Record<DealProgressStepId, string> = {
  created: "Сделка создана. Следующий шаг — оплата заказа покупателем.",
  awaiting_payment: "Ожидается оплата покупателем. После оплаты средства будут зарезервированы.",
  paid: "Заказ оплачен. Средства поступают на escrow-счёт платформы.",
  funds_frozen: "Средства заморожены на escrow-счёте до завершения сделки.",
  seller_performing: "Продавец выполняет заказ. Вы можете написать ему в чате сделки.",
  awaiting_confirm: "Продавец отметил выполнение. Подтвердите получение товара.",
  completed: "Сделка успешно завершена. Спасибо за покупку!",
};

export function getDealStepDescription(
  stepId: DealProgressStepId,
  order?: Pick<OrderDetail, "tab" | "currentStep">,
): string {
  if (
    order?.tab === "sales" &&
    order.currentStep === "created" &&
    stepId === "created"
  ) {
    return "Продажа только что создана. Товар опубликован — ожидайте оплаты от покупателя.";
  }

  return DEAL_STEP_DESCRIPTIONS[stepId];
}

export function getDealStepDate(
  order: OrderDetail,
  stepId: DealProgressStepId,
): string | null {
  return order.stepDates?.[stepId] ?? null;
}

const cyberpunkChat = {
  systemMessages: [
    { id: "s1", text: "Заказ оплачен — 14.02.2026, 10:01:00" },
    { id: "s2", text: "Средства заморожены — 14.02.2026, 10:01:30" },
  ],
  messages: [
    {
      id: "m1",
      author: "DemoBuyer",
      text: "Здравствуйте, когда будет ключ?",
      time: "10:05",
      isOwn: true,
    },
    {
      id: "m2",
      author: "GameVault",
      text: "Ключ будет выдан в течение 5 минут",
      time: "10:15",
    },
  ],
};

const wowChat = {
  systemMessages: [
    { id: "s1", text: "Заказ оплачен — 13.02.2026, 15:31:00" },
    { id: "s2", text: "Продавец отметил выполнение — 13.02.2026, 15:50:00" },
  ],
  messages: [
    {
      id: "m1",
      author: "PixelTrader",
      text: "Золото передано, проверьте инвентарь",
      time: "16:00",
    },
  ],
};

export const mockOrders: OrderDetail[] = [
  {
    id: "buy-1",
    dealId: "deal-1",
    tab: "purchases",
    status: "funds_frozen",
    dealStatusLabel: "Средства заморожены",
    title: "Cyberpunk 2077: Ultimate Edition — ключ Steam",
    seller: "GameVault",
    buyer: "DemoBuyer",
    price: 1290,
    commission: 129,
    date: "14.02.2026, 10:00:00",
    breadcrumbSection: "Покупки",
    currentStep: "funds_frozen",
    progressMode: "timeline",
    moneyStatusTitle: "Средства заморожены на escrow-счёте",
    showSellerPayout: false,
    actions: [
      { type: "cancel_deal", label: "Отменить сделку", variant: "ghost" },
      { type: "open_dispute", label: "Открыть спор", variant: "secondary" },
    ],
    stepDates: {
      created: "14.02.2026, 09:58:00",
      awaiting_payment: "14.02.2026, 09:59:00",
      paid: "14.02.2026, 10:00:00",
      funds_frozen: "14.02.2026, 10:01:30",
    },
    chat: cyberpunkChat,
  },
  {
    id: "buy-5",
    dealId: "deal-1",
    tab: "purchases",
    status: "cancelled",
    dealStatusLabel: "Отменена",
    title: "GTA V Premium — ключ Rockstar",
    seller: "GameVault",
    buyer: "DemoBuyer",
    price: 890,
    commission: 89,
    date: "14.02.2026, 10:00:00",
    breadcrumbSection: "Покупки",
    currentStep: "funds_frozen",
    progressMode: "summary",
    progressSummary: "Отменена",
    moneyStatusTitle: "Сделка отменена — средства не списаны или возвращены",
    showSellerPayout: false,
    actions: [],
    chat: cyberpunkChat,
  },
  {
    id: "buy-2",
    dealId: "deal-2",
    tab: "purchases",
    status: "object_confirmed",
    dealStatusLabel: "Завершена",
    title: "World of Warcraft — золото 100 000 (Gordunni, Horde)",
    seller: "PixelTrader",
    buyer: "DemoBuyer",
    price: 650,
    commission: 65,
    sellerPayout: 585,
    date: "13.02.2026, 15:30:00",
    breadcrumbSection: "Покупки",
    currentStep: "completed",
    progressMode: "timeline",
    moneyStatusTitle: "Деньги переведены продавцу за вычетом комиссии",
    showSellerPayout: true,
    actions: [],
    stepDates: {
      created: "13.02.2026, 15:28:00",
      awaiting_payment: "13.02.2026, 15:29:00",
      paid: "13.02.2026, 15:31:00",
      funds_frozen: "13.02.2026, 15:31:30",
      seller_performing: "13.02.2026, 15:32:00",
      awaiting_confirm: "13.02.2026, 15:50:00",
      completed: "13.02.2026, 16:05:00",
    },
    chat: wowChat,
  },
  {
    id: "buy-4",
    dealId: "deal-3",
    tab: "purchases",
    status: "awaiting_confirm",
    dealStatusLabel: "Ожидает подтверждения",
    title: "Forza Horizon 5 — ключ Steam",
    seller: "GameVault",
    buyer: "DemoBuyer",
    price: 2490,
    commission: 249,
    date: "12.02.2026, 18:20:00",
    breadcrumbSection: "Покупки",
    currentStep: "awaiting_confirm",
    progressMode: "timeline",
    moneyStatusTitle: "Средства заморожены на escrow-счёте",
    showSellerPayout: false,
    actions: [{ type: "open_dispute", label: "Открыть спор", variant: "secondary" }],
    stepDates: {
      created: "12.02.2026, 18:19:00",
      awaiting_payment: "12.02.2026, 18:19:30",
      paid: "12.02.2026, 18:21:00",
      funds_frozen: "12.02.2026, 18:21:30",
      seller_performing: "12.02.2026, 18:30:00",
      awaiting_confirm: "12.02.2026, 18:45:00",
    },
    chat: {
      systemMessages: [
        { id: "s1", text: "Заказ оплачен — 12.02.2026, 18:21:00" },
        { id: "s2", text: "Продавец отметил выполнение — 12.02.2026, 18:45:00" },
      ],
      messages: [
        {
          id: "m1",
          author: "GameVault",
          text: "Ключ отправлен, проверьте почту Steam",
          time: "18:46",
        },
      ],
    },
  },
  {
    id: "buy-6",
    dealId: "deal-4",
    tab: "purchases",
    status: "dispute",
    dealStatusLabel: "Спор",
    title: "Пополнение Steam 1 000 ₽",
    seller: "PixelTrader",
    buyer: "DemoBuyer",
    price: 1050,
    commission: 105,
    date: "11.02.2026, 09:15:00",
    breadcrumbSection: "Покупки",
    currentStep: "seller_performing",
    progressMode: "timeline",
    moneyStatusTitle: "Средства заморожены до решения спора",
    showSellerPayout: false,
    actions: [],
    stepDates: {
      created: "11.02.2026, 09:14:00",
      awaiting_payment: "11.02.2026, 09:14:30",
      paid: "11.02.2026, 09:15:00",
      funds_frozen: "11.02.2026, 09:15:30",
      seller_performing: "11.02.2026, 09:20:00",
    },
    chat: {
      systemMessages: [{ id: "s1", text: "Открыт спор — 11.02.2026, 09:30:00" }],
      messages: [
        {
          id: "m1",
          author: "DemoBuyer",
          text: "Средства не поступили на аккаунт",
          time: "09:31",
          isOwn: true,
        },
      ],
    },
  },
  {
    id: "buy-3",
    dealId: "deal-5",
    tab: "purchases",
    status: "pending",
    dealStatusLabel: "В ожидании",
    title: "Minecraft: Java & Bedrock Edition — ключ",
    seller: "GameVault",
    buyer: "DemoBuyer",
    price: 3990,
    commission: 399,
    date: "10.02.2026, 14:00:00",
    breadcrumbSection: "Покупки",
    currentStep: "awaiting_payment",
    progressMode: "timeline",
    moneyStatusTitle: "Ожидается оплата покупателем",
    showSellerPayout: false,
    actions: [{ type: "cancel_deal", label: "Отменить сделку", variant: "ghost" }],
    stepDates: {
      created: "10.02.2026, 14:00:00",
      awaiting_payment: "10.02.2026, 14:00:00",
    },
    chat: {
      systemMessages: [{ id: "s1", text: "Сделка создана — 10.02.2026, 14:00:00" }],
      messages: [],
    },
  },
  {
    id: "sell-2",
    dealId: "deal-6",
    tab: "sales",
    status: "sale_paid_out",
    dealStatusLabel: "Завершена",
    title: "Cyberpunk 2077: Ultimate Edition — ключ Steam",
    seller: "DemoBuyer",
    buyer: "GameVault",
    price: 1290,
    commission: 129,
    sellerPayout: 1161,
    date: "09.02.2026, 11:00:00",
    breadcrumbSection: "Продажи",
    currentStep: "completed",
    progressMode: "timeline",
    moneyStatusTitle: "Деньги переведены на ваш баланс за вычетом комиссии",
    showSellerPayout: true,
    actions: [],
    stepDates: {
      created: "09.02.2026, 10:58:00",
      awaiting_payment: "09.02.2026, 10:59:00",
      paid: "09.02.2026, 11:00:00",
      funds_frozen: "09.02.2026, 11:00:30",
      seller_performing: "09.02.2026, 11:05:00",
      awaiting_confirm: "09.02.2026, 11:20:00",
      completed: "09.02.2026, 11:35:00",
    },
    chat: cyberpunkChat,
  },
  {
    id: "sell-3",
    dealId: "deal-7",
    tab: "sales",
    status: "cancelled",
    dealStatusLabel: "Отменена",
    title: "Пополнение Steam 1 000 ₽",
    seller: "DemoBuyer",
    buyer: "PixelTrader",
    price: 1050,
    commission: 105,
    date: "08.02.2026, 16:40:00",
    breadcrumbSection: "Продажи",
    currentStep: "paid",
    progressMode: "summary",
    progressSummary: "Отменена",
    moneyStatusTitle: "Сделка отменена — средства не списаны или возвращены",
    showSellerPayout: false,
    actions: [],
    chat: {
      systemMessages: [{ id: "s1", text: "Сделка отменена — 08.02.2026, 16:55:00" }],
      messages: [],
    },
  },
];

export function getOrderById(id: string): OrderDetail | undefined {
  return mockOrders.find((order) => order.id === id);
}

export function isUserCreatedOrderId(id: string) {
  return id.startsWith("sell-created-");
}

function formatCreatedOrderDate(date: Date) {
  return date
    .toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    .replace(",", ",");
}

export interface CreatedSaleOrderInput {
  id: string;
  dealId: string;
  title: string;
  price: number;
}

export function buildCreatedSaleOrder(input: CreatedSaleOrderInput): OrderDetail {
  const now = new Date();
  const date = formatCreatedOrderDate(now);
  const commission = Math.round(input.price * 0.1);

  return {
    id: input.id,
    dealId: input.dealId,
    tab: "sales",
    status: "pending",
    dealStatusLabel: "Создана",
    title: input.title,
    seller: "Client",
    buyer: "Ожидается покупатель",
    price: input.price,
    commission,
    date,
    breadcrumbSection: "Продажи",
    currentStep: "created",
    progressMode: "timeline",
    moneyStatusTitle: "Продажа создана — ожидается покупатель",
    showSellerPayout: false,
    actions: [],
    stepDates: {
      created: date,
    },
    chat: {
      systemMessages: [{ id: "s1", text: `Продажа создана — ${date}` }],
      messages: [],
    },
  };
}

export function formatOrderPrice(price: number): string {
  return `${formatPrice(price)} ₽`;
}

export function getProductForOrder(order: Pick<OrderDetail, "id" | "title" | "price">): Product {
  const linkedProduct = mockProfileItems.find(
    (item) => item.tab === "products" && item.title === order.title,
  );

  if (linkedProduct?.href?.startsWith("/product/")) {
    const productId = linkedProduct.href.replace("/product/", "");
    const product = products.find((item) => item.id === productId);

    if (product) {
      return {
        ...product,
        title: order.title,
        price: order.price,
      };
    }
  }

  const matchedProduct = products.find((item) => item.title === order.title);

  if (matchedProduct) {
    return {
      ...matchedProduct,
      price: order.price,
    };
  }

  return {
    id: order.id,
    gameId: "order",
    game: "Playnox",
    category: "Товар",
    title: order.title,
    image: "/assets/cs2-hero-bg.png",
    logo: "/assets/cs2-logo.png",
    price: order.price,
    rating: 0,
    reviews: 0,
    seller: "",
    sellerAvatar: "/assets/seller-avatar.png",
    sellerRating: 0,
    sellerReviews: 0,
    sellerSales: 0,
    sellerOnline: false,
  };
}

export function getProductDetailForOrder(
  order: Pick<OrderDetail, "id" | "title" | "price">,
): ProductDetail {
  const product = getProductForOrder(order);
  const detail = products.some((item) => item.id === product.id)
    ? buildProductDetailFromProduct(product, {
        title: order.title,
        price: order.price,
      })
    : buildProductDetailFromProduct(
        {
          ...product,
          gameId: "cs2",
        },
        {
          title: order.title,
          price: order.price,
        },
      );

  return detail;
}

export function getDealProgressIndex(stepId: DealProgressStepId): number {
  return DEAL_PROGRESS_STEPS.findIndex((step) => step.id === stepId);
}
