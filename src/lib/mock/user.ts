export interface UserProfile {
  id: string;
  name: string;
  email: string;
  balance: number;
  rating: number;
  memberSince: string;
}

export const mockUser: UserProfile = {
  id: "client-1",
  name: "Client",
  email: "client@example.com",
  balance: 0,
  rating: 1,
  memberSince: "июня 2026",
};

export const profileTabs = ["Мои товары", "Покупки", "Продажи"] as const;
export const profileFilters = ["Активные", "Завершённые", "Спорные"] as const;
