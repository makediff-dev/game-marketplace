import { Icon } from "@/components/ui/icon/icon";
import styles from "./sell-wizard.module.css";

interface SellWizardHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function SellWizardHeader({ title, showBack = false, onBack }: SellWizardHeaderProps) {
  return (
    <div className={styles.header}>
      {showBack ? (
        <button type="button" className={styles.backButton} onClick={onBack} aria-label="Назад">
          <Icon src="/assets/arrow.svg" width={16} height={13} className={styles.backIcon} />
        </button>
      ) : null}
      <h1 className={styles.title}>{title}</h1>
    </div>
  );
}
