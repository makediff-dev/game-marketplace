import { SELL_WIZARD_TOTAL_STEPS } from "@/lib/mock/sell-wizard";
import styles from "./sell-wizard.module.css";

interface SellWizardProgressProps {
  currentStep: number;
}

export function SellWizardProgress({ currentStep }: SellWizardProgressProps) {
  const progress = (currentStep / SELL_WIZARD_TOTAL_STEPS) * 100;

  return (
    <div
      className={styles.progress}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={SELL_WIZARD_TOTAL_STEPS}
      aria-valuenow={currentStep}
      aria-label={`Шаг ${currentStep} из ${SELL_WIZARD_TOTAL_STEPS}`}
    >
      <div className={styles.progressFill} style={{ width: `${progress}%` }} />
    </div>
  );
}
