import styles from "./icon.module.css";

interface IconProps {
  src: string;
  alt?: string;
  width: number;
  height: number;
  className?: string;
}

export function Icon({ src, alt = "", width, height, className }: IconProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className ? `${styles.icon} ${className}` : styles.icon}
      aria-hidden={alt === ""}
    />
  );
}
