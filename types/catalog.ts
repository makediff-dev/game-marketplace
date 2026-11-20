import type { TFulfillmentFormat } from "@/types/fulfillment";

export type {
  TFulfillmentField,
  TFulfillmentFormat,
  TFulfillmentMode,
} from "@/types/fulfillment";

export type THeroBanner = {
  id: number;
  title: string;
  caption?: string | null;
  image: string;
  objectPosition?: string;
  href?: string | null;
  sortOrder: number;
};

export type TCatalogSegment = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
  count: number;
};

export type TCatalogCategory = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  banner?: string;
  badge?: string;
  sortOrder: number;
  isPopular?: boolean;
  /** Shown in the home “Пополнить …” platform grid when true. */
  showInTopup?: boolean;
  segmentSlug?: string;
  productCount?: number;
};

export type TCatalogOfferType = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
};

export type TCatalogFilterOption = {
  value: string;
  label: string;
  description?: string;
};

export type TCatalogFilterField = {
  id: number;
  key: string;
  label: string;
  fieldType: "range" | "boolean" | "radio" | "checkbox";
  scope: "common" | "category";
  sortOrder: number;
  config?: {
    icon?: string;
    minPlaceholder?: string;
    maxPlaceholder?: string;
    options?: TCatalogFilterOption[];
  };
  offerTypeSlug?: string;
};

export type TCatalogProductTone = "sale" | "brand" | "ok";

export type TCatalogProduct = {
  id: number;
  slug: string;
  title: string;
  productType: string;
  offerTypeSlug?: string;
  game: string;
  categorySlug: string;
  logo: string;
  /** Smaller copy of the image for product cards. */
  thumb?: string;
  image: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  tone: TCatalogProductTone;
  seller?: string;
  sellerVerified?: boolean;
  sellerSubtitle?: string;
  /** Marketplace listing owner — used to block self-purchase. */
  sellerUserId?: number;
  /** Average of reviews about the seller, 1–5. */
  sellerRating?: number;
  sellerReviewCount?: number;
  /** Completed orders of this product. */
  soldCount?: number;
  /** The seller paid to lift it to the top of the catalog. */
  promoted?: boolean;
  rating?: string;
  description?: string;
  deliveryTitle?: string;
  deliveryOption?: string;
  deliveryDescription?: string;
  warrantyText?: string;
  fulfillmentTime?: string;
  sellerOnline?: boolean;
  unitHint?: string;
  attributes?: Record<string, unknown>;
  sortOrder: number;
};

export type TCatalogCategoryPage = {
  category: TCatalogCategory;
  offerTypes: TCatalogOfferType[];
  filters: TCatalogFilterField[];
  products: TCatalogProduct[];
  total: number;
  fulfillmentFormats?: TFulfillmentFormat[];
  defaultFulfillmentFormatSlug?: string | null;
  /** Fee of this category, or the platform fee. */
  feePercent?: number;
};

export type TCatalogFees = {
  feePercent: number;
  minFeePercent: number;
};

export type TCatalogSearchHit = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  offerTypes: string[];
  isPopular?: boolean;
};

export type TCatalogSearchResult = {
  recent: TCatalogSearchHit[];
  popular: TCatalogSearchHit[];
  /** Goods by title first, then goods of the games found. */
  products?: TCatalogProduct[];
};
