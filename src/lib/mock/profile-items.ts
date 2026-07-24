import { formatPrice } from "@/lib/mock/products";

export type ProfileTabType = "products" | "purchases" | "sales";

export type ProfileItemStatus =
  | "active"
  | "archived"
  | "funds_frozen"
  | "object_confirmed"
  | "pending"
  | "dispute"
  | "awaiting_confirm"
  | "cancelled"
  | "sale_paid_out";

export type ProfileStatusTone = "brand" | "success" | "archived" | "dispute" | "warning";

export interface ProfileStatusConfig {
  label: string;
  tone: ProfileStatusTone;
}

export interface ProfileListItem {
  id: string;
  tab: ProfileTabType;
  title: string;
  price: number;
  status: ProfileItemStatus;
  href?: string;
}

export const profileStatusConfig: Record<ProfileItemStatus, ProfileStatusConfig> = {
  active: { label: "активен", tone: "brand" },
  archived: { label: "archived", tone: "archived" },
  funds_frozen: { label: "Средства заморожены", tone: "warning" },
  object_confirmed: { label: "Объект подтверждён", tone: "success" },
  pending: { label: "В ожидании", tone: "brand" },
  dispute: { label: "Спор", tone: "dispute" },
  awaiting_confirm: { label: "Ожидает подтверждения", tone: "warning" },
  cancelled: { label: "Отменено", tone: "archived" },
  sale_paid_out: { label: "Продажа выплачена", tone: "success" },
};

export const mockProfileItems: ProfileListItem[] = [
  {
    id: "prod-1",
    tab: "products",
    title: "Cyberpunk 2077: Ultimate Edition — ключ Steam",
    price: 1290,
    status: "active",
    href: "/product/cs2-1",
  },
  {
    id: "prod-2",
    tab: "products",
    title: "EA SPORTS FC 25 — ключ Xbox Series X|S",
    price: 1890,
    status: "active",
    href: "/product/cs2-2",
  },
  {
    id: "prod-3",
    tab: "products",
    title: "Minecraft: Java & Bedrock Edition — ключ",
    price: 3990,
    status: "active",
    href: "/product/cs2-3",
  },
  {
    id: "prod-4",
    tab: "products",
    title: "Пополнение Steam 1 000 ₽",
    price: 1050,
    status: "active",
    href: "/product/cs2-4",
  },
  {
    id: "prod-5",
    tab: "products",
    title: "Forza Horizon 5 — ключ Steam",
    price: 2490,
    status: "archived",
    href: "/product/cs2-5",
  },
  {
    id: "prod-6",
    tab: "products",
    title: "GTA V Premium — ключ Rockstar",
    price: 890,
    status: "dispute",
    href: "/product/cs2-6",
  },
  {
    id: "buy-1",
    tab: "purchases",
    title: "Cyberpunk 2077: Ultimate Edition — ключ Steam",
    price: 1290,
    status: "funds_frozen",
    href: "/profile/orders/buy-1",
  },
  {
    id: "buy-2",
    tab: "purchases",
    title: "World of Warcraft — золото 100 000 (Gordunni, Horde)",
    price: 650,
    status: "object_confirmed",
    href: "/profile/orders/buy-2",
  },
  {
    id: "buy-3",
    tab: "purchases",
    title: "Minecraft: Java & Bedrock Edition — ключ",
    price: 3990,
    status: "pending",
    href: "/profile/orders/buy-3",
  },
  {
    id: "buy-4",
    tab: "purchases",
    title: "Forza Horizon 5 — ключ Steam",
    price: 2490,
    status: "awaiting_confirm",
    href: "/profile/orders/buy-4",
  },
  {
    id: "buy-5",
    tab: "purchases",
    title: "GTA V Premium — ключ Rockstar",
    price: 890,
    status: "cancelled",
    href: "/profile/orders/buy-5",
  },
  {
    id: "buy-6",
    tab: "purchases",
    title: "Пополнение Steam 1 000 ₽",
    price: 1050,
    status: "dispute",
    href: "/profile/orders/buy-6",
  },
  {
    id: "sell-1",
    tab: "sales",
    title: "EA SPORTS FC 25 — ключ Xbox Series X|S",
    price: 1890,
    status: "pending",
    href: "/product/cs2-2",
  },
  {
    id: "sell-2",
    tab: "sales",
    title: "Cyberpunk 2077: Ultimate Edition — ключ Steam",
    price: 1290,
    status: "sale_paid_out",
    href: "/profile/orders/sell-2",
  },
  {
    id: "sell-3",
    tab: "sales",
    title: "Пополнение Steam 1 000 ₽",
    price: 1050,
    status: "cancelled",
    href: "/profile/orders/sell-3",
  },
  {
    id: "sell-4",
    tab: "sales",
    title: "Minecraft: Java & Bedrock Edition — ключ",
    price: 3990,
    status: "dispute",
    href: "/product/cs2-3",
  },
];

const tabMap: ProfileTabType[] = ["products", "purchases", "sales"];

export function getProfileTabType(tabIndex: number): ProfileTabType {
  return tabMap[tabIndex] ?? "products";
}

export function getProfileItems(tabIndex: number): ProfileListItem[] {
  const tab = getProfileTabType(tabIndex);
  return mockProfileItems.filter((item) => item.tab === tab);
}

export function formatProfilePrice(price: number): string {
  return `${formatPrice(price)} ₽`;
}

export interface ProfileEmptyState {
  title: string;
  text: string;
  showSellButton: boolean;
}

export function getProfileEmptyState(tabIndex: number): ProfileEmptyState {
  switch (getProfileTabType(tabIndex)) {
    case "purchases":
      return {
        title: "Нет покупок",
        text: "Здесь появятся ваши покупки",
        showSellButton: false,
      };
    case "sales":
      return {
        title: "Нет продаж",
        text: "Здесь появятся ваши продажи",
        showSellButton: false,
      };
    default:
      return {
        title: "Нет товаров",
        text: "Пора выставить свой товар на продажу!",
        showSellButton: true,
      };
  }
}
