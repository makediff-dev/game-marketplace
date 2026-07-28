import { Icon } from "@/components/ui/icon/icon";
import styles from "./modal-close-button.module.css";

interface ModalCloseButtonProps {
  onClick: () => void;
  className?: string;
}

export function ModalCloseButton({ onClick, className }: ModalCloseButtonProps) {
  return (
    <button
      type="button"
      className={[styles.closeButton, className].filter(Boolean).join(" ")}
      onClick={onClick}
      aria-label="Закрыть"
    >
      <Icon
        src="/assets/modal-close.svg"
        width={24}
        height={24}
        tone="muted"
        className={styles.closeIcon}
      />
    </button>
  );
}
