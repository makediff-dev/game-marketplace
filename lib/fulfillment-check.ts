import type { TFulfillmentField } from "@/types/fulfillment";

// Same rules and texts as the API, so the site stops the mistake first.

const PRESETS: Record<string, { pattern: RegExp; message: string }> = {
  steam_trade_url: {
    pattern:
      /^https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[\w-]+$/,
    message: "Нужна ссылка на обмен Steam",
  },
  roblox_username: {
    pattern: /^[A-Za-z0-9_]{3,20}$/,
    message: "Ник Roblox: 3–20 латинских букв, цифр или _",
  },
  player_id: {
    pattern: /^\d{4,20}$/,
    message: "ID состоит только из цифр",
  },
};

const BY_TYPE: Partial<
  Record<TFulfillmentField["inputType"], { pattern: RegExp; message: string }>
> = {
  email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Нужна почта" },
  phone: { pattern: /^\+?[\d\s()-]{10,20}$/, message: "Нужен номер телефона" },
  url: { pattern: /^https?:\/\/\S+$/, message: "Нужна ссылка" },
  number: { pattern: /^\d+([.,]\d+)?$/, message: "Нужно число" },
};

export const MAX_FIELD_LENGTH = 5000;

export function fieldError(field: TFulfillmentField, raw: string): string | null {
  const value = raw.trim();

  if (!value) {
    return field.required ? `Заполните поле «${field.label}»` : null;
  }

  if (value.length > MAX_FIELD_LENGTH) {
    return `Поле «${field.label}» слишком длинное`;
  }

  if (field.inputType === "select" && field.options?.length) {
    return field.options.includes(value)
      ? null
      : `Выберите вариант в поле «${field.label}»`;
  }

  const preset = PRESETS[field.validation ?? "none"];

  if (preset) {
    return preset.pattern.test(value) ? null : preset.message;
  }

  const byType = BY_TYPE[field.inputType];

  if (byType && !byType.pattern.test(value)) {
    return `${byType.message} в поле «${field.label}»`;
  }

  if (field.validation === "custom" && field.pattern) {
    try {
      if (!new RegExp(`^(?:${field.pattern})$`).test(value)) {
        return `Проверьте поле «${field.label}»`;
      }
    } catch {
      // A broken pattern from the admin must not block the form.
    }
  }

  return null;
}

/** Errors by field key, empty when everything fits. */
export function payloadErrors(
  fields: TFulfillmentField[],
  payload: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const error = fieldError(field, payload[field.key] ?? "");
    if (error) {
      errors[field.key] = error;
    }
  }

  return errors;
}

/** Trimmed values of the given fields, empty ones left out. */
export function cleanPayload(
  fields: TFulfillmentField[],
  payload: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    fields
      .map((field) => [field.key, (payload[field.key] ?? "").trim()] as const)
      .filter(([, value]) => value.length > 0),
  );
}
