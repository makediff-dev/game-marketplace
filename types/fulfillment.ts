export type TFulfillmentMode = "instant" | "seller" | "gift";

/** How a deal goes. Admins add formats and fields, a new kind needs code. */
export type TFulfillmentKind =
  | "stock"
  | "trade"
  | "topup"
  | "account_service"
  | "gift"
  | "handover";

export type TFulfillmentInputType =
  | "text"
  | "password"
  | "email"
  | "textarea"
  | "phone"
  | "url"
  | "number"
  | "select";

export type TFulfillmentValidation =
  | "none"
  | "steam_trade_url"
  | "roblox_username"
  | "player_id"
  | "custom";

export type TFulfillmentFilledBy = "buyer" | "seller";

export type TFulfillmentField = {
  key: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  inputType: TFulfillmentInputType;
  options?: string[];
  validation?: TFulfillmentValidation;
  pattern?: string;
  filledBy: TFulfillmentFilledBy;
  required: boolean;
  /** Passwords and keys: masked on screen, hidden from the seller after the deal. */
  sensitive?: boolean;
  sortOrder: number;
};

export type TFulfillmentFormat = {
  id?: number;
  slug: string;
  name: string;
  title: string;
  description?: string | null;
  kind: TFulfillmentKind;
  mode: TFulfillmentMode;
  /** Hours the seller has after payment. Null for instant delivery. */
  deadlineHours?: number | null;
  /** Empty: the format fits every offer type of its game. */
  offerTypeSlugs?: string[];
  fields: TFulfillmentField[];
};

const KINDS: TFulfillmentKind[] = [
  "stock",
  "trade",
  "topup",
  "account_service",
  "gift",
  "handover",
];

const INPUT_TYPES: TFulfillmentInputType[] = [
  "text",
  "password",
  "email",
  "textarea",
  "phone",
  "url",
  "number",
  "select",
];

const VALIDATIONS: TFulfillmentValidation[] = [
  "none",
  "steam_trade_url",
  "roblox_username",
  "player_id",
  "custom",
];

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function list(value: unknown): string[] {
  const items = Array.isArray(value) ? value : text(value).split("\n");
  return items.map((item) => text(item)).filter(Boolean);
}

export function kindOfFormat(record: {
  kind?: unknown;
  mode?: unknown;
}): TFulfillmentKind {
  if (KINDS.includes(record.kind as TFulfillmentKind)) {
    return record.kind as TFulfillmentKind;
  }

  if (record.mode === "instant") {
    return "stock";
  }

  return record.mode === "gift" ? "gift" : "handover";
}

export function parseFulfillmentFormat(
  value: unknown,
): TFulfillmentFormat | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const slug = text(record.slug);
  const name = text(record.name);
  const title = text(record.title) || name;

  if (!slug || !title) {
    return null;
  }

  const kind = kindOfFormat(record);
  const rawFields = Array.isArray(record.fields) ? record.fields : [];
  const fields: TFulfillmentField[] = [];

  for (const item of rawFields) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const field = item as Record<string, unknown>;
    const key = text(field.key);
    const label = text(field.label);

    if (!key || !label) {
      continue;
    }

    fields.push({
      key,
      label,
      placeholder: text(field.placeholder),
      helpText: text(field.helpText),
      inputType: INPUT_TYPES.includes(field.inputType as TFulfillmentInputType)
        ? (field.inputType as TFulfillmentInputType)
        : "text",
      options: list(field.options),
      validation: VALIDATIONS.includes(
        field.validation as TFulfillmentValidation,
      )
        ? (field.validation as TFulfillmentValidation)
        : "none",
      pattern: text(field.pattern),
      filledBy: field.filledBy === "seller" ? "seller" : "buyer",
      required: field.required !== false,
      sensitive: field.sensitive === true,
      sortOrder: Number(field.sortOrder) || 0,
    });
  }

  fields.sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: typeof record.id === "number" ? record.id : undefined,
    slug,
    name: name || title,
    title,
    description: text(record.description) || null,
    kind,
    mode: kind === "stock" ? "instant" : kind === "gift" ? "gift" : "seller",
    deadlineHours: Number(record.deadlineHours) || null,
    offerTypeSlugs: list(record.offerTypeSlugs),
    fields,
  };
}

export function buyerFieldsOf(format: TFulfillmentFormat | null): TFulfillmentField[] {
  return (format?.fields ?? []).filter((field) => field.filledBy === "buyer");
}

export function sellerFieldsOf(
  format: TFulfillmentFormat | null,
): TFulfillmentField[] {
  return (format?.fields ?? []).filter((field) => field.filledBy === "seller");
}

/** Formats of a game that fit one offer type (section). */
export function formatsForOfferType<T extends { offerTypeSlugs?: string[] }>(
  formats: T[],
  offerTypeSlug: string | null | undefined,
): T[] {
  return formats.filter(
    (format) =>
      !format.offerTypeSlugs?.length ||
      (offerTypeSlug != null && format.offerTypeSlugs.includes(offerTypeSlug)),
  );
}
