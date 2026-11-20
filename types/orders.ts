import type { TFulfillmentFormat } from "@/types/fulfillment";

export type TOrderStatus =
  | "pending_payment"
  | "paid"
  | "awaiting_fulfillment"
  | "awaiting_confirm"
  | "completed"
  | "disputed"
  | "cancelled"
  | "refunded";

export type TPaymentMethod = "balance" | "card";

export interface TOrder {
  id: string;
  code: string;
  title: string;
  price: number;
  status: TOrderStatus;
  paymentMethod: TPaymentMethod;
  buyerPayload: Record<string, string>;
  productSlug?: string;
  productId?: number;
  listingId?: string;
  listingType?: "one-time" | "permanent" | null;
  gameId?: string | null;
  categoryId?: string | null;
  /** First photo of the listing or the catalog product. */
  image?: string | null;
  buyerId: number;
  sellerId: number | null;
  role: "buyer" | "seller";
  counterpartyUsername?: string | null;
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
  paidAt?: string | null;
  fulfilledAt?: string | null;
  confirmedAt?: string | null;
  disputedAt?: string | null;
  disputeReason?: string | null;
  cancelledAt?: string | null;
  autoConfirmAt?: string | null;
  fulfillmentMode?: "seller" | "instant";
  deliveryPayload?: Record<string, string>;
  /** The seller's note on how to get the goods, after payment. */
  deliveryInstruction?: string | null;
  fulfillmentFormat?: TFulfillmentFormat | null;
  createdAt: string;
  updatedAt: string;
}

export interface TOrderChatMessage {
  id: string;
  orderId: string;
  authorId: number;
  authorRole: "buyer" | "seller" | "system";
  text: string;
  createdAt: string;
  /** A link to a site outside the trusted list. */
  externalLink?: boolean;
}

export interface TCreateOrderPayload {
  productId: number;
  paymentMethod: TPaymentMethod;
  buyerPayload?: Record<string, string>;
  promoCode?: string;
}
