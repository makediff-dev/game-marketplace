import { Icon } from "@/components/ui/icon/icon";
import styles from "./safe-payment-block.module.css";

const paymentIcons = [
  "/assets/card-ru.svg",
  "/assets/sbp.svg",
  "/assets/card-by.svg",
  "/assets/card-kz.svg",
  "/assets/visa.svg",
  "/assets/mastercard.svg",
  "/assets/mir.svg",
];

export function SafePaymentBlock() {
  return (
    <div className={styles.paymentBlock}>
      <p className={styles.paymentLabel}>🔒 Безопасная оплата</p>
      <div className={styles.paymentRow}>
        {paymentIcons.map((icon) => (
          <Icon key={icon} src={icon} width={32} height={32} className={styles.paymentIcon} />
        ))}
      </div>
    </div>
  );
}
