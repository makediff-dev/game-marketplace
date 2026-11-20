"use client";

import { useState } from "react";

import styles from "@/styles/auth.module.scss";

type TProps = {
  id: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  hint?: string;
};

function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.9 5.2A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a18 18 0 0 1-3.3 4.2" />
      <path d="M6.3 6.8A17.9 17.9 0 0 0 2 12s3.6 7 10 7c2 0 3.7-.7 5.1-1.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="m3 3 18 18" />
    </svg>
  );
}

export function PasswordField({
  id,
  label,
  autoComplete,
  minLength,
  hint,
}: TProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles["auth__field"]}>
      <label htmlFor={id}>{label}</label>

      <div className={styles["auth__password"]}>
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          required
        />

        <button
          className={styles["auth__toggle"]}
          type="button"
          aria-controls={id}
          aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
          aria-pressed={visible}
          onClick={() => setVisible((prev) => !prev)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {hint && <small className={styles.hint}>{hint}</small>}
    </div>
  );
}
