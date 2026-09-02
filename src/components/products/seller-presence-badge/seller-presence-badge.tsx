import { getSellerPresenceLabel } from "@/lib/deal/deal-timer";
import styles from "./seller-presence-badge.module.css";

interface SellerPresenceBadgeProps {
  sellerName: string;
  isOnline: boolean;
  compact?: boolean;
  viewerRole?: "purchases" | "sales";
}

export function SellerPresenceBadge({
  sellerName,
  isOnline,
  compact = false,
  viewerRole = "purchases",
}: SellerPresenceBadgeProps) {
  const presenceLabel = compact
    ? isOnline
      ? "В сети"
      : "Не в сети"
    : getSellerPresenceLabel(sellerName, isOnline, viewerRole);

  return (
    <span
      className={`${styles.badge} ${compact ? styles.compact : ""}`}
      aria-label={isOnline ? "В сети" : "Не в сети"}
    >
      <span
        className={`${styles.dot} ${isOnline ? styles.dotOnline : styles.dotOffline}`}
        aria-hidden
      />
      <span className={styles.text}>{presenceLabel}</span>
    </span>
  );
}
