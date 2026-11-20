import type { TUser } from "@/types/auth";

const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export function isPlaceholderUsername(user: TUser): boolean {
  return (
    user.username === user.email ||
    user.username.startsWith("vk_") ||
    user.username.includes("@")
  );
}

export function signedInWithVk(user: TUser): boolean {
  return (
    user.username.startsWith("vk_") || /^vk-\d+@example\.com$/i.test(user.email)
  );
}

export function memberSince(createdAt: string): string {
  const date = new Date(createdAt);
  const month = MONTHS[date.getMonth()] ?? "";

  return `${month} ${date.getFullYear()}`;
}

export function formatMoney(amount: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(amount)} ₽`;
}

export function avatarSrc(user: TUser): string | null {
  if (!user.avatarUpdatedAt) {
    return null;
  }

  const base = process.env.NEXT_PUBLIC_API_URL ?? "";

  return `${base}/auth/avatars/${user.id}?v=${user.avatarUpdatedAt}`;
}
