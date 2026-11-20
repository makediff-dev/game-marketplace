"use client";

import { FulfillmentFields } from "@/components/fulfillment-fields";
import styles from "@/styles/stock-editor.module.scss";
import type { TFulfillmentField } from "@/types/fulfillment";

/**
 * Units of an auto-delivered listing. Each unit goes to one buyer, so a
 * permanent listing sells as many times as it has units.
 */
export function StockEditor({
  fields,
  items,
  errors = [],
  max,
  onChange,
}: {
  fields: TFulfillmentField[];
  items: Record<string, string>[];
  errors?: Array<Record<string, string>>;
  max: number;
  onChange: (items: Record<string, string>[]) => void;
}) {
  function update(index: number, key: string, value: string) {
    onChange(
      items.map((item, position) =>
        position === index ? { ...item, [key]: value } : item,
      ),
    );
  }

  return (
    <div className={styles["stock-editor"]}>
      <ol className={styles["stock-editor__list"]}>
        {items.map((item, index) => (
          <li key={index} className={styles["stock-editor__item"]}>
            {max > 1 ? (
              <div className={styles["stock-editor__head"]}>
                <span className={styles["stock-editor__title"]}>
                  Позиция {index + 1}
                </span>
                {items.length > 1 ? (
                  <button
                    type="button"
                    className={styles["stock-editor__remove"]}
                    aria-label={`Удалить позицию ${index + 1}`}
                    onClick={() =>
                      onChange(items.filter((_, position) => position !== index))
                    }
                  >
                    Удалить
                  </button>
                ) : null}
              </div>
            ) : null}
            <FulfillmentFields
              fields={fields}
              values={item}
              errors={errors[index]}
              raised
              onChange={(key, value) => update(index, key, value)}
            />
          </li>
        ))}
      </ol>
      {items.length < max ? (
        <button
          type="button"
          className={styles["stock-editor__add"]}
          onClick={() => onChange([...items, {}])}
        >
          + Добавить позицию
        </button>
      ) : null}
    </div>
  );
}
