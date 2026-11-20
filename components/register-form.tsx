"use client";

import { type FormEvent, useState } from "react";

import { getErrorMessage } from "@/api/error";
import { PasswordField } from "@/components/password-field";
import { useRegister } from "@/hooks/use-auth";
import styles from "@/styles/auth.module.scss";

const MIN_PASSWORD_LENGTH = 8;

export function RegisterForm() {
  const [error, setError] = useState("");
  const register = useRegister();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));

    if (password !== String(form.get("passwordConfirmation"))) {
      setError("Пароли не совпадают");

      return;
    }

    register.mutate(
      { email: String(form.get("email")), password },
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
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        hint={`Минимум ${MIN_PASSWORD_LENGTH} символов`}
      />

      <PasswordField
        id="passwordConfirmation"
        label="Пароль ещё раз"
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
      />

      {error && (
        <p className={styles["auth__error"]} role="alert">
          {error}
        </p>
      )}

      <button
        className={styles["auth__submit"]}
        type="submit"
        disabled={register.isPending}
      >
        {register.isPending ? "Регистрируем" : "Зарегистрироваться"}
      </button>
    </form>
  );
}
