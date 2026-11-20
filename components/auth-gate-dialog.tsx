"use client";

import Link from "next/link";

import styles from "@/styles/auth-gate.module.scss";

export function AuthGateDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  // Sign-in and sign-up are one flow; both come back to this page.
  const here =
    typeof window === "undefined"
      ? ""
      : `${window.location.pathname}${window.location.search}`;
  const loginHref = here
    ? `/login?from=${encodeURIComponent(here)}`
    : "/login";

  return (
    <div className={styles["auth-gate"]} role="presentation" onClick={onClose}>
      <div
        className={styles["auth-gate__dialog"]}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-gate-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="auth-gate-title" className={styles["auth-gate__title"]}>
          Войдите в аккаунт
        </h2>
        <p className={styles["auth-gate__text"]}>
          Войдите в аккаунт, чтобы продолжить
        </p>
        <Link className={styles["auth-gate__primary"]} href={loginHref}>
          Войти
        </Link>
        <Link className={styles["auth-gate__secondary"]} href={loginHref}>
          Регистрация
        </Link>
        <button
          className={styles["auth-gate__home"]}
          type="button"
          onClick={onClose}
        >
          На главную
        </button>
      </div>
    </div>
  );
}
