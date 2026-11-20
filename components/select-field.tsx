"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { cx } from "@/lib/cx";
import styles from "@/styles/fulfillment-fields.module.scss";

// Room the list needs below the button before it opens upwards.
const LIST_ROOM = 260;

/** A listbox in the site style instead of the system one. */
export function SelectField({
  id,
  value,
  options,
  placeholder,
  required,
  invalid,
  describedBy,
  onChange,
}: {
  id: string;
  value: string;
  options: string[];
  placeholder?: string;
  required: boolean;
  invalid: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = `${id}-list`;
  // An optional field can be cleared again.
  const items = required ? options : ["", ...options];
  const emptyLabel = placeholder || "Не выбрано";

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  function show() {
    const rect = buttonRef.current?.getBoundingClientRect();
    setUp(Boolean(rect && window.innerHeight - rect.bottom < LIST_ROOM && rect.top > LIST_ROOM));
    setActive(Math.max(0, items.indexOf(value)));
    setOpen(true);
  }

  function choose(next: string) {
    onChange(next);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        show();
      }
      return;
    }

    const moves: Record<string, number> = {
      ArrowDown: Math.min(items.length - 1, active + 1),
      ArrowUp: Math.max(0, active - 1),
      Home: 0,
      End: items.length - 1,
    };

    if (event.key in moves) {
      event.preventDefault();
      setActive(moves[event.key]);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(items[active]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className={styles["fulfillment-fields__select"]}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        className={cx(
          styles["fulfillment-fields__input"],
          styles["fulfillment-fields__select-button"],
          !value && styles["fulfillment-fields__select-button--empty"],
        )}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-required={required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKeyDown}
      >
        <span>{value || emptyLabel}</span>
        <svg
          className={cx(
            styles["fulfillment-fields__chevron"],
            open && styles["fulfillment-fields__chevron--open"],
          )}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className={cx(
            styles["fulfillment-fields__options"],
            up && styles["fulfillment-fields__options--up"],
          )}
        >
          {items.map((option, index) => {
            const selected = option === value;
            return (
              <li
                key={option || "empty"}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={selected}
                className={cx(
                  styles["fulfillment-fields__option"],
                  index === active && styles["fulfillment-fields__option--active"],
                  selected && styles["fulfillment-fields__option--selected"],
                  !option && styles["fulfillment-fields__option--empty"],
                )}
                onPointerEnter={() => setActive(index)}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
              >
                {option || emptyLabel}
                {selected ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="m5 12.5 4.5 4.5L19 7.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
