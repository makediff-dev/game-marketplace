import profileStyles from "@/styles/profile.module.scss";
import styles from "@/styles/skeleton.module.scss";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  radius?: string | number;
}

export function Skeleton({
  className,
  width,
  height,
  radius,
}: SkeletonProps) {
  return (
    <span
      className={`${styles["skeleton__bone"]} ${className ?? ""}`.trim()}
      style={{
        width,
        height,
        borderRadius: radius,
      }}
      aria-hidden
    />
  );
}

export function CatalogPageSkeleton() {
  return (
    <div
      className={styles["skeleton__catalog"]}
      aria-busy="true"
      aria-label="Загрузка"
    >
      <Skeleton className={styles["skeleton__hero"]} radius={20} />
      <div className={styles["skeleton__topup"]}>
        <Skeleton className={styles["skeleton__pay-grid"]} radius={20} />
        <Skeleton className={styles["skeleton__topup-panel"]} radius={24} />
      </div>
      <div className={styles["skeleton__apps"]}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={styles["skeleton__app"]}>
            <Skeleton width={80} height={80} radius={24} />
            <Skeleton width={72} height={16} radius={8} />
          </div>
        ))}
      </div>
      <div className={styles["skeleton__cards"]}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className={styles["skeleton"]} radius={20} />
        ))}
      </div>
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <div
      className={styles["skeleton__product"]}
      aria-busy="true"
      aria-label="Загрузка"
    >
      <Skeleton className={styles["skeleton__product-image"]} radius={20} />
      <div className={styles["skeleton__product-side"]}>
        <Skeleton width="40%" height={32} radius={8} />
        <Skeleton width="90%" height={24} radius={8} />
        <Skeleton width="100%" height={120} radius={16} />
        <Skeleton width="100%" height={56} radius={16} />
      </div>
    </div>
  );
}

export function ListPageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div
      className={styles["skeleton__list"]}
      aria-busy="true"
      aria-label="Загрузка"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          className={styles["skeleton__list-row"]}
          radius={16}
        />
      ))}
    </div>
  );
}

// Same grid as the profile page, so nothing jumps when it loads.
export function ProfilePageSkeleton() {
  return (
    <div
      className={profileStyles["profile"]}
      aria-busy="true"
      aria-label="Загрузка"
    >
      <div className={profileStyles["profile__card"]}>
        <Skeleton width={72} height={72} radius="50%" />
        <div className={styles["skeleton__person-text"]}>
          <Skeleton width={140} height={24} radius={8} />
          <Skeleton width={100} height={16} radius={8} />
          <Skeleton width={160} height={16} radius={8} />
        </div>
      </div>
      <Skeleton
        className={styles["skeleton__profile-balance"]}
        height={86}
        radius={24}
      />
      <Skeleton
        className={styles["skeleton__profile-menu"]}
        height={480}
        radius={24}
      />
      <div className={profileStyles["profile__main-head"]}>
        <Skeleton width="100%" height={48} radius={999} />
        <Skeleton width={320} height={34} radius={999} />
      </div>
      <div className={profileStyles["profile__list"]}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} height={280} radius={20} />
        ))}
      </div>
    </div>
  );
}
