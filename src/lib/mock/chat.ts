export interface ChatThread {
  id: string;
  title: string;
  subtitle: string;
  dealId?: string;
  preview?: string;
  time?: string;
  unread?: number;
  icon: string;
  verified?: boolean;
  online?: boolean;
}

export interface ChatMessage {
  id: string;
  author: string;
  text: string;
  time: string;
  isBot?: boolean;
  isOwn?: boolean;
  isSystem?: boolean;
}

export interface QuickReply {
  id: string;
  label: string;
  icon?: string;
}

export interface DealChatView {
  statusLabel: string;
  productTitle: string;
  messages: ChatMessage[];
}

export const chatThreads: ChatThread[] = [
  {
    id: "deal-1",
    title: "GameVault",
    subtitle: "Cyberpunk 2077: Ultimate Edition — ключ Steam",
    dealId: "deal-1",
    preview: "Ключ будет выдан в течение 5 минут",
    unread: 1,
    icon: "GV",
  },
  {
    id: "deal-2",
    title: "PixelTrader",
    subtitle: "World of Warcraft — золото 100 000",
    dealId: "deal-2",
    preview: "Золото передано, проверьте инвентарь",
    unread: 2,
    icon: "PT",
  },
  {
    id: "support",
    title: "Поддержка",
    subtitle: "Задать вопрос",
    icon: "💬",
    verified: true,
    online: true,
  },
];

export const dealChats: Record<string, DealChatView> = {
  "deal-1": {
    statusLabel: "Средства заморожены",
    productTitle: "Cyberpunk 2077: Ultimate Edition — ключ Steam #deal-1",
    messages: [
      {
        id: "s1",
        author: "",
        text: "Заказ оплачен — 14.02.2026, 10:01:00",
        time: "",
        isSystem: true,
      },
      {
        id: "s2",
        author: "",
        text: "Средства заморожены — 14.02.2026, 10:01:30",
        time: "",
        isSystem: true,
      },
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
  },
  "deal-2": {
    statusLabel: "Завершена",
    productTitle: "World of Warcraft — золото 100 000 (Gordunni, Horde) #deal-2",
    messages: [
      {
        id: "s1",
        author: "",
        text: "Заказ оплачен — 13.02.2026, 15:31:00",
        time: "",
        isSystem: true,
      },
      {
        id: "s2",
        author: "",
        text: "Продавец отметил выполнение — 13.02.2026, 15:50:00",
        time: "",
        isSystem: true,
      },
      {
        id: "m1",
        author: "PixelTrader",
        text: "Золото передано, проверьте инвентарь",
        time: "16:00",
      },
    ],
  },
};

export const supportMessages: ChatMessage[] = [
  {
    id: "1",
    author: "🤖 Бот",
    text: "Привет! Я бот поддержки Playnox. Выберите тему вопроса ниже или напишите свой. Помните: мы не работаем в Telegram — только на сайте.",
    time: "20:48",
    isBot: true,
  },
];

export const quickReplies: QuickReply[] = [
  { id: "official", label: "Официально от Playnox" },
  { id: "balance", label: "Баланс" },
  { id: "steam", label: "Пополнение Steam на Playnox" },
  { id: "buyers", label: "Для покупателей" },
  { id: "security", label: "Безопасность" },
  { id: "sellers", label: "Для продавцов" },
];

export function getDealChat(threadId: string): DealChatView | undefined {
  return dealChats[threadId];
}
