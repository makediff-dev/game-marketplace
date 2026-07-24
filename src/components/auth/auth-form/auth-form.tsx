"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon/icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { getEmailValidationError } from "@/lib/validation/email";
import styles from "./auth-form.module.css";

interface AuthFormProps {
  title?: string;
  returnUrl?: string;
  onEmailSubmit?: (email: string) => void;
  onVkSubmit?: () => void;
}

export function AuthForm({
  title = "Вход или регистрация",
  returnUrl,
  onEmailSubmit,
  onVkSubmit,
}: AuthFormProps) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [focused, setFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (emailError) {
      setEmailError(getEmailValidationError(value));
    }
  };

  const handleEmailSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = getEmailValidationError(email);
    if (validationError) {
      setEmailError(validationError);
      return;
    }

    const normalizedEmail = email.trim();

    if (onEmailSubmit) {
      onEmailSubmit(normalizedEmail);
      return;
    }

    login();
    router.push(returnUrl || "/register/verify");
  };

  const handleVkLogin = () => {
    setEmailError(null);

    if (onVkSubmit) {
      onVkSubmit();
      return;
    }

    login();
    router.push(returnUrl || "/welcome");
  };

  const emailFieldClassName = [
    styles.emailField,
    focused ? styles.emailFieldFocused : "",
    emailError ? styles.emailFieldError : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.page}>
      {title ? <h2 className={styles.title}>{title}</h2> : null}
      <form className={styles.form} onSubmit={handleEmailSubmit} noValidate>
        <button type="button" className={styles.vkButton} onClick={handleVkLogin}>
          <Icon src="/assets/vk-icon.svg" width={32} height={32} className={styles.vkIcon} />
          <span className={styles.vkLabel}>Войти с VK ID</span>
          <Icon
            src="/assets/arrow-small.svg"
            width={16}
            height={13}
            className={styles.arrowIcon}
          />
        </button>

        <div className={styles.emailFieldGroup}>
          <div className={emailFieldClassName}>
            <input
              type="email"
              className={styles.emailInput}
              placeholder="Адрес электронной почты"
              aria-label="Адрес электронной почты"
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "email-error" : undefined}
              value={email}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={(event) => handleEmailChange(event.target.value)}
            />
          </div>
          {emailError ? (
            <p id="email-error" className={styles.fieldError} role="alert">
              {emailError}
            </p>
          ) : null}
        </div>

        <Button type="submit" variant="gradient" fullWidth large className={styles.submitButton}>
          Получить код
        </Button>

        <p className={styles.legal}>
          Продолжая регистрацию или вход, вы принимаете условия{" "}
          <Link href="/terms" className={styles.legalLink}>
            Пользовательского соглашения
          </Link>
          , а также предоставляете{" "}
          <Link href="/privacy" className={styles.legalLink}>
            Согласие
          </Link>{" "}
          на обработку персональных данных на условиях{" "}
          <Link href="/privacy" className={styles.legalLink}>
            Политики конфиденциальности
          </Link>
        </p>
      </form>
    </div>
  );
}
