"use client";

import { useEffect, useState } from "react";

import { cx } from "@/lib/cx";
import styles from "@/styles/filter-modal.module.scss";
import type { TCatalogFilterField } from "@/types/catalog";

export type TFilterValues = Record<string, string | boolean | undefined>;

export function FilterModal({
  title,
  filters,
  initialValues,
  onClose,
  onApply,
}: {
  title: string;
  filters: TCatalogFilterField[];
  initialValues: TFilterValues;
  onClose: () => void;
  onApply: (values: TFilterValues) => void;
}) {
  const [values, setValues] = useState<TFilterValues>(initialValues);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function setValue(key: string, value: string | boolean | undefined) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <div
      className={styles["filter-modal"]}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={styles["filter-modal__dialog"]}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles["filter-modal__header"]}>
          <button
            className={styles["filter-modal__reset"]}
            type="button"
            onClick={() => setValues({})}
          >
            Сбросить
          </button>
          <h2 className={styles["filter-modal__title"]}>{title}</h2>
          <span />
        </div>

        <div className={styles["filter-modal__body"]}>
          {filters.map((field) => {
            if (field.fieldType === "radio" || field.fieldType === "checkbox") {
              const multiple = field.fieldType === "checkbox";
              // Several options travel as one comma-separated value.
              const picked = String(values[field.key] ?? "")
                .split(",")
                .filter(Boolean);
              const pick = (value: string) => {
                if (!multiple) {
                  setValue(field.key, value);
                  return;
                }
                const next = picked.includes(value)
                  ? picked.filter((item) => item !== value)
                  : [...picked, value];
                setValue(field.key, next.length > 0 ? next.join(",") : undefined);
              };

              return (
                <section
                  key={field.id}
                  className={styles["filter-modal__section"]}
                >
                  <h3
                    className={cx(
                      styles["filter-modal__section-title"],
                      styles["filter-modal__section-title--muted"],
                    )}
                  >
                    📦 {field.label}
                  </h3>
                  {(field.config?.options ?? []).map((option) => {
                    const selected = multiple
                      ? picked.includes(option.value)
                      : values[field.key] === option.value;

                    return (
                      <button
                        key={option.value}
                        className={styles["filter-modal__option"]}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => pick(option.value)}
                      >
                        <span className={styles["filter-modal__option-copy"]}>
                          <span
                            className={styles["filter-modal__option-label"]}
                          >
                            {option.label}
                          </span>
                          {option.description && (
                            <span
                              className={
                                styles["filter-modal__option-description"]
                              }
                            >
                              {option.description}
                            </span>
                          )}
                        </span>
                        {selected ? (
                          <img
                            className={styles["filter-modal__check-image"]}
                            src="/catalog/checkbox-on.svg"
                            alt=""
                            width={32}
                            height={32}
                          />
                        ) : (
                          <span
                            className={styles["filter-modal__check"]}
                            aria-hidden
                          />
                        )}
                      </button>
                    );
                  })}
                </section>
              );
            }

            if (field.fieldType === "range") {
              const minKey = `${field.key}Min`;
              const maxKey = `${field.key}Max`;

              return (
                <section
                  key={field.id}
                  className={styles["filter-modal__section"]}
                >
                  <h3
                    className={cx(
                      styles["filter-modal__section-title"],
                      styles["filter-modal__section-title--muted"],
                    )}
                  >
                    {field.label}
                  </h3>
                  <div className={styles["filter-modal__range"]}>
                    <input
                      className={styles["filter-modal__range-input"]}
                      value={String(values[minKey] ?? "")}
                      placeholder={field.config?.minPlaceholder ?? "От"}
                      inputMode="numeric"
                      onChange={(event) => setValue(minKey, event.target.value)}
                    />
                    <span
                      className={styles["filter-modal__dash"]}
                      aria-hidden
                    />
                    <input
                      className={styles["filter-modal__range-input"]}
                      value={String(values[maxKey] ?? "")}
                      placeholder={field.config?.maxPlaceholder ?? "До"}
                      inputMode="numeric"
                      onChange={(event) => setValue(maxKey, event.target.value)}
                    />
                  </div>
                </section>
              );
            }

            if (field.fieldType === "boolean") {
              const enabled = values[field.key] === true;

              return (
                <div
                  key={field.id}
                  className={styles["filter-modal__toggle-row"]}
                >
                  <span className={styles["filter-modal__toggle-label"]}>
                    {field.config?.icon === "discount" && (
                      <span
                        className={styles["filter-modal__discount-badge"]}
                        aria-hidden
                      >
                        -%
                      </span>
                    )}
                    {field.config?.icon === "star" && (
                      <img
                        src="/catalog/filter-star.svg"
                        alt=""
                        width={26}
                        height={26}
                      />
                    )}
                    {field.label}
                  </span>
                  <button
                    className={cx(
                      styles["filter-modal__switch"],
                      enabled && styles["filter-modal__switch--on"],
                    )}
                    type="button"
                    aria-label={field.label}
                    aria-pressed={enabled}
                    onClick={() => setValue(field.key, !enabled)}
                  >
                    <span className={styles["filter-modal__switch-knob"]} />
                  </button>
                </div>
              );
            }

            return null;
          })}
        </div>

        <div className={styles["filter-modal__footer"]}>
          <button
            className={styles["filter-modal__submit"]}
            type="button"
            onClick={() => onApply(values)}
          >
            Показать
          </button>
        </div>
      </div>
    </div>
  );
}
