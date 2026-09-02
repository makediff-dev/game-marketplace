import type { Product } from "@/lib/mock/products";

const defaultFulfillmentTime = "до 30 мин";

const fulfillmentByGame: Record<string, string> = {
  cs2: "до 30 мин",
  roblox: "до 15 мин",
  steam: "до 10 мин",
  telegram: "до 5 мин",
  brawl: "до 15 мин",
  pubg: "до 20 мин",
  mlbb: "до 15 мин",
  genshin: "до 15 мин",
  honkai: "до 15 мин",
  tarkov: "до 1 часа",
  wow: "до 30 мин",
  discord: "до 10 мин",
  spotify: "до 10 мин",
  chatgpt: "до 10 мин",
  tiktok: "до 15 мин",
  xbox: "до 10 мин",
};

const categoryFulfillmentRules: { match: RegExp; time: string }[] = [
  { match: /пополнен/i, time: "до 15 мин" },
  { match: /ключ|активац/i, time: "до 10 мин" },
  { match: /аккаунт/i, time: "до 1 часа" },
  { match: /скин|предмет/i, time: "до 30 мин" },
];

export function getProductFulfillmentTime(product: Product): string {
  if (product.fulfillmentTime) {
    return product.fulfillmentTime;
  }

  if (product.verified) {
    return "до 5 мин";
  }

  const categoryMatch = categoryFulfillmentRules.find((rule) =>
    rule.match.test(product.category),
  );
  if (categoryMatch) {
    return categoryMatch.time;
  }

  return fulfillmentByGame[product.gameId] ?? defaultFulfillmentTime;
}
