import { mockSecurityInfo } from "@/lib/mock/security";
import styles from "./security-content.module.css";

export function SecurityContent() {
  return (
    <div className={styles.security}>
      <ul className={styles.list}>
        <li className={styles.item}>
          Двухфакторная аутентификация —{" "}
          <span className={styles.muted}>{mockSecurityInfo.twoFactorStatus}</span>
        </li>
        <li className={styles.item}>
          Активные сессии —{" "}
          <span className={styles.muted}>{mockSecurityInfo.activeSessions}</span>
        </li>
        <li className={styles.item}>
          Последний вход — <span className={styles.muted}>{mockSecurityInfo.lastLogin}</span>
        </li>
      </ul>
    </div>
  );
}
