import type { TUser } from "@/types/auth";
import type { TCatalogProduct } from "@/types/catalog";
import type { TOrder } from "@/types/orders";

export const STAMP = "2026-09-20T10:00:00.000Z";

export function makeUser(patch: Partial<TUser> = {}): TUser {
  return {
    id: 7,
    username: "player",
    email: "player@mail.ru",
    provider: "local",
    confirmed: true,
    blocked: false,
    createdAt: STAMP,
    updatedAt: STAMP,
    ...patch,
  };
}

export function makeOrder(patch: Partial<TOrder> = {}): TOrder {
  return {
    id: "101",
    code: "ORD-7-101",
    title: "Аккаунт CS2 Prime",
    price: 1490,
    status: "awaiting_fulfillment",
    paymentMethod: "balance",
    buyerPayload: {},
    buyerId: 7,
    sellerId: 11,
    role: "buyer",
    counterpartyUsername: "seller_pro",
    paidAt: STAMP,
    createdAt: STAMP,
    updatedAt: STAMP,
    ...patch,
  };
}

export function makeProduct(patch: Partial<TCatalogProduct> = {}): TCatalogProduct {
  return {
    id: 1,
    slug: "cs2-prime",
    title: "Аккаунт CS2 Prime",
    productType: "Аккаунт",
    game: "Counter-Strike 2",
    price: 1490,
    image: "/img.png",
    logo: "/logo.png",
    categorySlug: "cs2",
    tone: "ok",
    sortOrder: 1,
    ...patch,
  };
}
