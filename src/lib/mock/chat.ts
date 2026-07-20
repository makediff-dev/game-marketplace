export interface ChatThread {
  id: string;
  title: string;
  subtitle: string;
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
}

export interface QuickReply {
  id: string;
  label: string;
  icon?: string;
}

export const chatThreads: ChatThread[] = [
  {
    id: "support",
    title: "Поддержка",
    subtitle: "Задать вопрос",
    icon: "💬",
    verified: true,
    online: true,
  },
  {
    id: "notifications",
    title: "Уведомления",
    subtitle: "Client, добро пожаловать на Playnox! Теперь вы можете покупать...",
    preview: "Client, добро пожаловать на Playnox! Теперь вы можете покупать...",
    time: "0:01",
    unread: 1,
    icon: "🔔",
    verified: true,
    online: true,
  },
];

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
