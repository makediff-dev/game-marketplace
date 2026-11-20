export type TListingStatus =
  | "moderation"
  | "active"
  | "rejected"
  | "blocked"
  | "archived"
  | "sold"
  | "disputed";
export type TListingType = "one-time" | "permanent";

export interface TSellerListing {
  id: string;
  ownerId: number;
  status: TListingStatus;
  rejectReason: string | null;
  gameId: string;
  gameName: string;
  categoryId: string;
  categoryLabel: string;
  deliveryMethodId: string;
  deliveryMethodLabel: string;
  listingType: TListingType;
  title: string;
  description: string;
  comment: string;
  price: number;
  income: number;
  server: string | null;
  genre: string | null;
  region: string | null;
  images: string[];
  imageIds: number[];
  /** Delivery data for the buyer, only in the owner's own listing. */
  sellerDeliveryPayload?: Record<string, string> | null;
  /** Owner only: how the buyer gets the goods, shown after payment. */
  deliveryInstruction?: string | null;
  /** Owner only: the delivery format, raw as the API sends it. */
  fulfillmentFormat?: unknown;
  /** Owner only, auto-delivery: units left and sold. */
  stock?: { free: number; sold: number } | null;
  productSlug: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TCreateListingPayload {
  gameId: string;
  gameName: string;
  categoryId: string;
  categoryLabel: string;
  listingType: TListingType;
  title: string;
  description?: string;
  comment?: string;
  deliveryInstruction: string;
  price: number;
  server?: string | null;
  genre?: string | null;
  region?: string | null;
  images?: File[];
}

/** A photo kept from the listing (its id) or a new file to upload. */
export type TListingPhoto = number | File;

export interface TUpdateListingPayload {
  title?: string;
  description?: string;
  comment?: string;
  deliveryInstruction?: string;
  price?: number;
  server?: string;
  genre?: string;
  region?: string;
  sellerDeliveryPayload?: Record<string, string>;
  /** New auto-delivery units, added to the stock. */
  stockItems?: Record<string, string>[];
  photos?: TListingPhoto[];
}

/** A paid lift to the top of the catalog. */
export type TPromotionTerms = { price: number; hours: number };

export type TPromotionMethod = "balance" | "card";

export type TPromotionResult = TPromotionTerms & { promotedUntil: string };
