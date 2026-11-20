export type TProfileTab = "goods" | "purchases" | "sales";
export type TProfileFilter = "active" | "completed" | "disputed";

export type TProfileItemStatus =
  | "active"
  | "moderation"
  | "rejected"
  | "blocked"
  | "archived"
  | "funds_frozen"
  | "object_confirmed"
  | "pending"
  | "dispute"
  | "awaiting_confirm"
  | "cancelled"
  | "sale_paid_out"
  | "out_of_stock";

export type TProfileStatusTone =
  | "brand"
  | "archived"
  | "warning"
  | "success"
  | "dispute";

export type TProfileItem = {
  id: string;
  tab: TProfileTab;
  filter: TProfileFilter;
  title: string;
  price: number;
  status: TProfileItemStatus;
  /** Moderator's reason for a rejected or blocked listing. */
  note?: string;
  href?: string;
  /** First photo of the listing. */
  image?: string | null;
  description?: string | null;
  /** Goods only: the paid lift to the top runs until this time. */
  promotedUntil?: string | null;
};

export const PROFILE_STATUS_CONFIG: Record<
  TProfileItemStatus,
  { label: string; tone: TProfileStatusTone }
> = {
  active: { label: "активен", tone: "brand" },
  moderation: { label: "На модерации", tone: "warning" },
  rejected: { label: "Отклонено", tone: "dispute" },
  blocked: { label: "Заблокировано", tone: "dispute" },
  archived: { label: "В архиве", tone: "archived" },
  funds_frozen: { label: "Средства заморожены", tone: "warning" },
  object_confirmed: { label: "Объект подтверждён", tone: "success" },
  pending: { label: "В ожидании", tone: "brand" },
  dispute: { label: "Спор", tone: "dispute" },
  awaiting_confirm: { label: "Ожидает подтверждения", tone: "warning" },
  cancelled: { label: "Отменено", tone: "archived" },
  sale_paid_out: { label: "Продажа выплачена", tone: "success" },
  out_of_stock: { label: "Закончился", tone: "warning" },
};

export const PROFILE_EMPTY_STATE: Record<
  TProfileTab,
  { title: string; text: string; showSellButton: boolean }
> = {
  goods: {
    title: "Нет товаров",
    text: "Пора выставить свой товар на продажу!",
    showSellButton: true,
  },
  purchases: {
    title: "Нет покупок",
    text: "Здесь появятся ваши покупки",
    showSellButton: false,
  },
  sales: {
    title: "Нет продаж",
    text: "Здесь появятся ваши продажи",
    showSellButton: false,
  },
};

export function parseProfileTab(value: string | null): TProfileTab {
  if (value === "purchases" || value === "sales" || value === "goods") {
    return value;
  }

  if (value === "products") {
    return "goods";
  }

  return "goods";
}

export function parseProfileFilter(value: string | null): TProfileFilter {
  if (value === "completed" || value === "disputed" || value === "active") {
    return value;
  }

  return "active";
}

export function normalizeProfileStatus(status: string): TProfileItemStatus {
  if (status in PROFILE_STATUS_CONFIG) {
    return status as TProfileItemStatus;
  }

  return "pending";
}

export type TBalanceHistoryItem = {
  id: string;
  label: string;
  amount: number;
  status: string;
  createdAt?: string;
};

export const BALANCE_AMOUNT_PRESETS = [50, 100, 200, 500, 1000] as const;

export type TSalesStatsPeriod = "7d" | "30d" | "90d" | "all";

export type TSalesStatsData = {
  periodLabel: string;
  revenue: number;
  /** Against the previous period; null when there is nothing to compare. */
  revenueChange: number | null;
  ordersCount: number;
  ordersChange: number | null;
  averageOrderValue: number;
  /** Null while no paid deal has ended. */
  successRate: number | null;
  dailyRevenue: Array<{ label: string; value: number }>;
  topProducts: Array<{
    id: string;
    title: string;
    salesCount: number;
    revenue: number;
    views?: number;
    image?: string | null;
    game?: string | null;
  }>;
  avgResponseMinutes: number | null;
  repeatBuyersPercent: number;
  activeListings: number;
  views?: number;
  purchases?: number;
  viewsToPurchasePercent: number | null;
};

export const SALES_STATS_PERIODS: Array<{
  id: TSalesStatsPeriod;
  label: string;
}> = [
  { id: "7d", label: "7 дней" },
  { id: "30d", label: "30 дней" },
  { id: "90d", label: "90 дней" },
  { id: "all", label: "Всё время" },
];

export const EMPTY_SALES_STATS: TSalesStatsData = {
  periodLabel: "",
  revenue: 0,
  revenueChange: null,
  ordersCount: 0,
  ordersChange: null,
  averageOrderValue: 0,
  successRate: null,
  dailyRevenue: [],
  topProducts: [],
  avgResponseMinutes: null,
  repeatBuyersPercent: 0,
  activeListings: 0,
  viewsToPurchasePercent: null,
};

