import Link from "next/link";

import styles from "@/styles/back-link.module.scss";

export function BackLink({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  return (
    <Link
      className={`${styles["back-link"]}${className ? ` ${className}` : ""}`}
      href={href}
      aria-label="Назад"
    >
      <img
        className={styles["back-link__icon"]}
        src="/assets/arrow.svg"
        alt=""
        width={16}
        height={13}
      />
    </Link>
  );
}
