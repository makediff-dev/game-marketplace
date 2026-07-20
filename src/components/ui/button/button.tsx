import styles from "./button.module.css";

type ButtonVariant = "primary" | "outline" | "gradient" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  large?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth = false,
  large = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    fullWidth ? styles.fullWidth : "",
    large ? styles.large : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={classNames} {...props}>
      {children}
    </button>
  );
}
