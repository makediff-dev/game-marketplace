"use client";

import shellStyles from "./navbar-shell.module.css";

interface NavbarMenuButtonProps {
  isOpen: boolean;
  controlsId: string;
  onClick: () => void;
}

export function NavbarMenuButton({ isOpen, controlsId, onClick }: NavbarMenuButtonProps) {
  return (
    <button
      type="button"
      className={`${shellStyles.menuButton} ${isOpen ? shellStyles.menuButtonOpen : ""}`}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
      onClick={onClick}
    >
      <span className={shellStyles.menuIcon} aria-hidden>
        <span className={shellStyles.menuLine} />
        <span className={shellStyles.menuLine} />
        <span className={shellStyles.menuLine} />
      </span>
    </button>
  );
}
