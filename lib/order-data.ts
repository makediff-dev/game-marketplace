import {
  buyerFieldsOf,
  parseFulfillmentFormat,
  sellerFieldsOf,
  type TFulfillmentField,
} from "@/types/fulfillment";
import type { TOrder } from "@/types/orders";

export type TOrderDataRow = {
  key: string;
  label: string;
  value: string;
  /** Masked until the viewer asks to see it. */
  sensitive: boolean;
};

export type TOrderData = {
  title: string;
  hint: string;
  rows: TOrderDataRow[];
};

// Values in the format's field order, then keys the format no longer knows.
function toRows(
  payload: Record<string, string> | undefined,
  fields: TFulfillmentField[],
): TOrderDataRow[] {
  const values = Object.entries(payload ?? {}).filter(
    ([, value]) => typeof value === "string" && value.trim(),
  );
  const byKey = new Map(fields.map((field) => [field.key, field]));
  const order = fields.map((field) => field.key);
  const rank = (key: string) => {
    const index = order.indexOf(key);
    return index === -1 ? order.length : index;
  };

  return values
    .sort(([a], [b]) => rank(a) - rank(b))
    .map(([key, value]) => ({
      key,
      label: byKey.get(key)?.label ?? key,
      value: value.trim(),
      sensitive: byKey.get(key)?.sensitive === true,
    }));
}

// The buyer gets what the seller handed over, the seller gets what the
// buyer typed at checkout. Null when there is nothing to show.
export function orderDataFor(
  order: TOrder,
  viewer: "buyer" | "seller",
): TOrderData | null {
  const format = parseFulfillmentFormat(order.fulfillmentFormat);
  const data =
    viewer === "buyer"
      ? {
          title: "Данные товара",
          hint: "Продавец передал эти данные. Проверьте их и подтвердите получение.",
          rows: toRows(order.deliveryPayload, sellerFieldsOf(format)),
        }
      : {
          title: "Данные покупателя",
          hint: "Покупатель указал их при оплате. По ним передайте товар.",
          rows: toRows(order.buyerPayload, buyerFieldsOf(format)),
        };

  return data.rows.length > 0 ? data : null;
}
