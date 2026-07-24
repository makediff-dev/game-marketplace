import { profileStatusConfig, type ProfileItemStatus } from "@/lib/mock/profile-items";
import styles from "./profile-status-badge.module.css";

interface ProfileStatusBadgeProps {
  status: ProfileItemStatus;
}

export function ProfileStatusBadge({ status }: ProfileStatusBadgeProps) {
  const config = profileStatusConfig[status];

  return (
    <span className={[styles.badge, styles[config.tone]].join(" ")}>
      {config.label}
    </span>
  );
}
