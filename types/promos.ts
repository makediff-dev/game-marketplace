export type TPromoContext = "topup" | "marketplace";

export type TPromoQuote = {
  valid: boolean;
  message: string;
  code?: string;
  feeRate: number;
  discountAmount: number;
  amountAfterDiscount: number;
  payable: number;
  badgeLabel: string;
  promoId?: number;
};

export type TValidatePromoPayload = {
  code: string;
  context: TPromoContext;
  amount: number;
  currency?: string;
};
