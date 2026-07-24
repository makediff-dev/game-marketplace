import Link from "next/link";
import { formatProfilePrice, type ProfileListItem } from "@/lib/mock/profile-items";
import { ProfileStatusBadge } from "@/components/profile/profile-status-badge/profile-status-badge";
import styles from "./profile-item-card.module.css";

interface ProfileItemCardProps {
  item: ProfileListItem;
  highlighted?: boolean;
}

export function ProfileItemCard({ item, highlighted = false }: ProfileItemCardProps) {
  const content = (
    <>
      <span className={styles.title}>{item.title}</span>
      <div className={styles.meta}>
        <ProfileStatusBadge status={item.status} />
        <span className={styles.price}>{formatProfilePrice(item.price)}</span>
      </div>
    </>
  );

  const cardClassName = `${styles.card} ${highlighted ? styles.cardHighlighted : ""}`;

  if (item.href) {
    return (
      <Link href={item.href} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return <article className={cardClassName}>{content}</article>;
}
