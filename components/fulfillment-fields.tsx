"use client";

import { useId, useState } from "react";

import { SelectField } from "@/components/select-field";
import { cx } from "@/lib/cx";
import styles from "@/styles/fulfillment-fields.module.scss";
import type { TFulfillmentField } from "@/types/fulfillment";

const INPUT_TYPES: Partial<Record<TFulfillmentField["inputType"], string>> = {
  email: "email",
  phone: "tel",
  url: "url",
};

const INPUT_MODES: Partial<
  Record<TFulfillmentField["inputType"], "tel" | "url" | "email" | "decimal">
> = {
  phone: "tel",
  url: "url",
  email: "email",
  number: "decimal",
};

function FieldInput({
  id,
  field,
  value,
  invalid,
  describedBy,
  onChange,
}: {
  id: string;
  field: TFulfillmentField;
  value: string;
  invalid: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
}) {
  const [shown, setShown] = useState(false);
  const common = {
    id,
    className: styles["fulfillment-fields__input"],
    value,
    autoComplete: "off",
    placeholder: field.placeholder || undefined,
    "aria-required": field.required,
    "aria-invalid": invalid || undefined,
    "aria-describedby": describedBy,
  };

  if (field.inputType === "select" && field.options?.length) {
    return (
      <SelectField
        id={id}
        value={value}
        options={field.options}
        placeholder={field.placeholder || undefined}
        required={field.required}
        invalid={invalid}
        describedBy={describedBy}
        onChange={onChange}
      />
    );
  }

  if (field.inputType === "textarea") {
    return (
      <textarea
        {...common}
        className={cx(
          styles["fulfillment-fields__input"],
          styles["fulfillment-fields__input--area"],
        )}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.inputType === "password") {
    return (
      <span className={styles["fulfillment-fields__secret"]}>
        <input
          {...common}
          type={shown ? "text" : "password"}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className={styles["fulfillment-fields__toggle"]}
          aria-label={shown ? "Скрыть" : "Показать"}
          aria-pressed={shown}
          onClick={() => setShown((current) => !current)}
        >
          {shown ? "Скрыть" : "Показать"}
        </button>
      </span>
    );
  }

  return (
    <input
      {...common}
      type={INPUT_TYPES[field.inputType] ?? "text"}
      inputMode={INPUT_MODES[field.inputType]}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

/** Inputs of a fulfillment format, the same on checkout, sale and handover. */
export function FulfillmentFields({
  fields,
  values,
  errors = {},
  onChange,
  raised = false,
}: {
  fields: TFulfillmentField[];
  values: Record<string, string>;
  errors?: Record<string, string>;
  onChange: (key: string, value: string) => void;
  /** On a grey card: white inputs. */
  raised?: boolean;
}) {
  const baseId = useId();

  return (
    <div
      className={cx(
        styles["fulfillment-fields"],
        raised && styles["fulfillment-fields--raised"],
      )}
    >
      {fields.map((field) => {
        const id = `${baseId}-${field.key}`;
        const error = errors[field.key];
        const hintId = field.helpText ? `${id}-hint` : undefined;
        const errorId = error ? `${id}-error` : undefined;

        return (
          <div key={field.key} className={styles["fulfillment-fields__field"]}>
            <label className={styles["fulfillment-fields__label"]} htmlFor={id}>
              {field.label}
              {field.required ? null : (
                <span className={styles["fulfillment-fields__optional"]}>
                  {" "}
                  (необязательно)
                </span>
              )}
            </label>
            <FieldInput
              id={id}
              field={field}
              value={values[field.key] ?? ""}
              invalid={Boolean(error)}
              describedBy={[hintId, errorId].filter(Boolean).join(" ") || undefined}
              onChange={(value) => onChange(field.key, value)}
            />
            {field.helpText ? (
              <span id={hintId} className={styles["fulfillment-fields__hint"]}>
                {field.helpText}
              </span>
            ) : null}
            {error ? (
              <span id={errorId} className={styles["fulfillment-fields__error"]}>
                {error}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
