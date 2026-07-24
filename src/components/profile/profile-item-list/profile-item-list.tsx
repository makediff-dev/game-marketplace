import { ProfileItemCard } from "@/components/profile/profile-item-card/profile-item-card";
import type { ProfileListItem } from "@/lib/mock/profile-items";
import styles from "./profile-item-list.module.css";

interface ProfileItemListProps {
  items: ProfileListItem[];
  highlightProductId?: string | null;
}

export function ProfileItemList({ items, highlightProductId }: ProfileItemListProps) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.id}>
          <ProfileItemCard
            item={item}
            highlighted={highlightProductId === item.id}
          />
        </li>
      ))}
    </ul>
  );
}
