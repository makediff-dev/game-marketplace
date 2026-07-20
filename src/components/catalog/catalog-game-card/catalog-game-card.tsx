import Image from "next/image";
import Link from "next/link";
import type { CatalogGame } from "@/lib/mock/catalog-games";
import styles from "./catalog-game-card.module.css";

interface CatalogGameCardProps {
  game: CatalogGame;
}

export function CatalogGameCard({ game }: CatalogGameCardProps) {
  return (
    <Link href={game.href} className={styles.card}>
      <div className={styles.iconWrapper}>
        <Image
          src={game.image}
          alt={game.name}
          width={90}
          height={90}
          className={styles.icon}
        />
        {game.badge === "new" ? (
          <span className={`${styles.badge} ${styles.badgeNew}`}>Новое</span>
        ) : null}
        {game.badge === "viewed" ? (
          <span className={`${styles.badge} ${styles.badgeViewed}`}>👀</span>
        ) : null}
      </div>
      <span className={styles.name}>{game.name}</span>
    </Link>
  );
}
