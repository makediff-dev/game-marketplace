export type StatsPeriod = "7d" | "30d" | "90d" | "all";

export interface DailyRevenuePoint {
  label: string;
  value: number;
}

export interface TopProductStat {
  id: string;
  title: string;
  salesCount: number;
  revenue: number;
}

export interface SellerStatsPeriodData {
  periodLabel: string;
  revenue: number;
  revenueChange: number;
  ordersCount: number;
  ordersChange: number;
  averageOrderValue: number;
  successRate: number;
  dailyRevenue: DailyRevenuePoint[];
  topProducts: TopProductStat[];
  avgResponseMinutes: number;
  repeatBuyersPercent: number;
  activeListings: number;
  viewsToPurchasePercent: number;
}

export const statsPeriodOptions: { id: StatsPeriod; label: string }[] = [
  { id: "7d", label: "7 дней" },
  { id: "30d", label: "30 дней" },
  { id: "90d", label: "90 дней" },
  { id: "all", label: "Всё время" },
];

export const sellerStatsByPeriod: Record<StatsPeriod, SellerStatsPeriodData> = {
  "7d": {
    periodLabel: "за 7 дней",
    revenue: 18450,
    revenueChange: 12.4,
    ordersCount: 14,
    ordersChange: 8.3,
    averageOrderValue: 1318,
    successRate: 92,
    dailyRevenue: [
      { label: "Пн", value: 1890 },
      { label: "Вт", value: 2450 },
      { label: "Ср", value: 3120 },
      { label: "Чт", value: 2780 },
      { label: "Пт", value: 4210 },
      { label: "Сб", value: 2650 },
      { label: "Вс", value: 1350 },
    ],
    topProducts: [
      {
        id: "prod-1",
        title: "Cyberpunk 2077: Ultimate Edition — ключ Steam",
        salesCount: 5,
        revenue: 6450,
      },
      {
        id: "prod-4",
        title: "Пополнение Steam 1 000 ₽",
        salesCount: 4,
        revenue: 4200,
      },
      {
        id: "prod-2",
        title: "EA SPORTS FC 25 — ключ Xbox Series X|S",
        salesCount: 3,
        revenue: 5670,
      },
    ],
    avgResponseMinutes: 18,
    repeatBuyersPercent: 21,
    activeListings: 6,
    viewsToPurchasePercent: 4.8,
  },
  "30d": {
    periodLabel: "за 30 дней",
    revenue: 72800,
    revenueChange: 18.6,
    ordersCount: 52,
    ordersChange: 14.2,
    averageOrderValue: 1400,
    successRate: 94,
    dailyRevenue: [
      { label: "1–5", value: 11200 },
      { label: "6–10", value: 14800 },
      { label: "11–15", value: 12600 },
      { label: "16–20", value: 16400 },
      { label: "21–25", value: 9800 },
      { label: "26–30", value: 8000 },
    ],
    topProducts: [
      {
        id: "prod-1",
        title: "Cyberpunk 2077: Ultimate Edition — ключ Steam",
        salesCount: 18,
        revenue: 23220,
      },
      {
        id: "prod-3",
        title: "Minecraft: Java & Bedrock Edition — ключ",
        salesCount: 11,
        revenue: 43890,
      },
      {
        id: "prod-4",
        title: "Пополнение Steam 1 000 ₽",
        salesCount: 14,
        revenue: 14700,
      },
      {
        id: "prod-2",
        title: "EA SPORTS FC 25 — ключ Xbox Series X|S",
        salesCount: 9,
        revenue: 17010,
      },
    ],
    avgResponseMinutes: 22,
    repeatBuyersPercent: 27,
    activeListings: 6,
    viewsToPurchasePercent: 5.2,
  },
  "90d": {
    periodLabel: "за 90 дней",
    revenue: 198400,
    revenueChange: 9.1,
    ordersCount: 141,
    ordersChange: 6.8,
    averageOrderValue: 1407,
    successRate: 93,
    dailyRevenue: [
      { label: "Янв", value: 58200 },
      { label: "Фев", value: 62400 },
      { label: "Мар", value: 77800 },
    ],
    topProducts: [
      {
        id: "prod-3",
        title: "Minecraft: Java & Bedrock Edition — ключ",
        salesCount: 28,
        revenue: 111720,
      },
      {
        id: "prod-1",
        title: "Cyberpunk 2077: Ultimate Edition — ключ Steam",
        salesCount: 42,
        revenue: 54180,
      },
      {
        id: "prod-4",
        title: "Пополнение Steam 1 000 ₽",
        salesCount: 36,
        revenue: 37800,
      },
    ],
    avgResponseMinutes: 25,
    repeatBuyersPercent: 31,
    activeListings: 6,
    viewsToPurchasePercent: 4.6,
  },
  all: {
    periodLabel: "за всё время",
    revenue: 412600,
    revenueChange: 0,
    ordersCount: 286,
    ordersChange: 0,
    averageOrderValue: 1443,
    successRate: 95,
    dailyRevenue: [
      { label: "2023", value: 84200 },
      { label: "2024", value: 148400 },
      { label: "2025", value: 126800 },
      { label: "2026", value: 53200 },
    ],
    topProducts: [
      {
        id: "prod-3",
        title: "Minecraft: Java & Bedrock Edition — ключ",
        salesCount: 64,
        revenue: 255360,
      },
      {
        id: "prod-1",
        title: "Cyberpunk 2077: Ultimate Edition — ключ Steam",
        salesCount: 78,
        revenue: 100620,
      },
      {
        id: "prod-4",
        title: "Пополнение Steam 1 000 ₽",
        salesCount: 52,
        revenue: 54600,
      },
      {
        id: "prod-2",
        title: "EA SPORTS FC 25 — ключ Xbox Series X|S",
        salesCount: 41,
        revenue: 77490,
      },
    ],
    avgResponseMinutes: 24,
    repeatBuyersPercent: 34,
    activeListings: 6,
    viewsToPurchasePercent: 5.1,
  },
};

export function getSellerStats(period: StatsPeriod): SellerStatsPeriodData {
  return sellerStatsByPeriod[period];
}

export function formatStatsCurrency(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

export function formatStatsChange(value: number): string {
  if (value === 0) {
    return "—";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
