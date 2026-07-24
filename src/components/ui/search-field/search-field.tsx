"use client";

import { useRef } from "react";
import { Icon } from "@/components/ui/icon/icon";
import styles from "./search-field.module.css";

type SearchFieldWidth = "fixed" | "full" | "flexible";

interface SearchFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  readOnly?: boolean;
  autoFocus?: boolean;
  width?: SearchFieldWidth;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
}

export function SearchField({
  value = "",
  onChange,
  onSubmit,
  readOnly = false,
  autoFocus = false,
  width = "fixed",
  className,
  placeholder = "Поиск товаров...",
  ariaLabel = "Поиск товаров",
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    onSubmit?.();
  };

  const fieldClassName = [
    styles.field,
    width === "full" ? styles.fullWidth : "",
    width === "flexible" ? styles.flexible : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={fieldClassName}>
      {readOnly ? (
        <span className={styles.iconWrap} aria-hidden>
          <Icon
            src="/assets/magnifying-glass.svg"
            width={20}
            height={20}
            className={styles.icon}
          />
        </span>
      ) : (
        <button
          type="button"
          className={styles.iconWrap}
          onClick={handleSubmit}
          aria-label="Искать"
        >
          <Icon
            src="/assets/magnifying-glass.svg"
            width={20}
            height={20}
            className={styles.icon}
          />
        </button>
      )}
      <input
        ref={inputRef}
        type="search"
        className={styles.input}
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={value}
        readOnly={readOnly}
        autoFocus={autoFocus}
        onChange={(event) => onChange?.(event.target.value)}
        onKeyDown={(event) => {
          if (readOnly) {
            return;
          }

          if (event.key === "Enter") {
            event.preventDefault();
            handleSubmit();
          }
        }}
      />
    </div>
  );
}
