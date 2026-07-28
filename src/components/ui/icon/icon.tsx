import styles from "./icon.module.css";

export type IconTone = "primary" | "muted" | "inverse";

interface IconProps {
  src: string;
  alt?: string;
  width: number;
  height: number;
  className?: string;
  adaptive?: boolean;
  tone?: IconTone;
}

const COLORED_ICON_PATTERN =
  /(?:visa|mastercard|mir|sbp|card-|umoney|social-|menu-bell|menu-lock|menu-chat|menu-envelope|menu-sign-out|checkmark-white|heart-brand|heart-white|avatar-placeholder|green-dot|red-dot|icon-wallet-brand|currency-|verified-icon|check-brand|seal-check|star-filled|star-empty|star-purple|vk-icon|check-brand)/i;

function shouldUseAdaptive(src: string, adaptive?: boolean) {
  if (adaptive !== undefined) {
    return adaptive;
  }

  return !COLORED_ICON_PATTERN.test(src);
}

const toneClassMap: Record<IconTone, string> = {
  primary: styles.tonePrimary,
  muted: styles.toneMuted,
  inverse: styles.toneInverse,
};

function getDefaultTone(src: string): IconTone {
  if (
    /arrow-small|modal-close|magnifying-glass|faders-horizontal|arrows-down-up|grid-four|circles-four|info\.svg|arrow\.svg|shopping-bag|promo-arrow|range-dash|heart\.svg/i.test(
      src,
    )
  ) {
    return "muted";
  }

  return "primary";
}

export function Icon({
  src,
  alt = "",
  width,
  height,
  className,
  adaptive,
  tone,
}: IconProps) {
  const resolvedTone = tone ?? getDefaultTone(src);
  const useAdaptive = shouldUseAdaptive(src, adaptive);

  const classes = [
    styles.icon,
    useAdaptive ? styles.adaptive : "",
    useAdaptive ? toneClassMap[resolvedTone] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (useAdaptive) {
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt === "" ? true : undefined}
        className={classes}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          WebkitMaskImage: `url("${src}")`,
          maskImage: `url("${src}")`,
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={classes}
      aria-hidden={alt === "" ? true : undefined}
    />
  );
}
