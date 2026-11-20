"use client";

import { type FormEvent, useState } from "react";

import { getErrorMessage } from "@/api/error";
import { PasswordField } from "@/components/password-field";
import { useLogin } from "@/hooks/use-auth";
import styles from "@/styles/auth.module.scss";

export function LoginForm() {
  const [error, setError] = useState("");
  const login = useLogin();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);

    login.mutate(
      {
        email: String(form.get("email")),
        password: String(form.get("password")),
      },
      { onError: (cause) => setError(getErrorMessage(cause)) },
    );
  }

  return (
    <form className={styles["auth__form"]} onSubmit={handleSubmit}>
      <div className={styles["auth__field"]}>
        <label htmlFor="email">Почта</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <PasswordField
        id="password"
        label="Пароль"
        autoComplete="current-password"
      />

      {error && (
        <p className={styles["auth__error"]} role="alert">
          {error}
        </p>
      )}

      <button
        className={styles["auth__submit"]}
        type="submit"
        disabled={login.isPending}
      >
        {login.isPending ? "Входим" : "Войти"}
      </button>
    </form>
  );
}
