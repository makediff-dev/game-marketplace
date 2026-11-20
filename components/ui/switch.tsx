"use client";

import { cx } from "@/lib/cx";
import styles from "@/styles/switch.module.scss";

/** An on/off switch: the knob slides, the track fills with the brand colour. */
export function Switch({
  checked,
  label,
  disabled,
  onChange,
}: {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      className={cx(styles.switch, checked && styles["switch--on"])}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.switch__thumb} aria-hidden />
    </button>
  );
}
