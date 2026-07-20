"use client";

import { Icon } from "@/components/ui/icon/icon";
import styles from "./arrow-button.module.css";

interface ArrowButtonProps {
  direction?: "left" | "right";
  onClick?: () => void;
  ariaLabel: string;
}

export function ArrowButton({
  direction = "right",
  onClick,
  ariaLabel,
}: ArrowButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.arrowButton} ${direction === "left" ? styles.arrowButtonLeft : ""}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <Icon src="/assets/arrow.svg" width={16} height={13} className={styles.icon} />
    </button>
  );
}
