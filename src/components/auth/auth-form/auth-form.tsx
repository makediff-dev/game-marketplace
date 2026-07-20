"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon/icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button/button";
import styles from "./auth-form.module.css";

const emailSchema = z.object({
  email: z.string().email("Введите корректный email"),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface AuthFormProps {
  title?: string;
}

export function AuthForm({ title = "Вход или регистрация" }: AuthFormProps) {
  const router = useRouter();
  const [focused, setFocused] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const emailField = register("email");

  const onSubmit = () => {
    router.push("/register/verify");
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>{title}</h2>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <button type="button" className={styles.vkButton} onClick={() => router.push("/welcome")}>
          <Icon src="/assets/vk-icon.svg" width={32} height={32} className={styles.vkIcon} />
          <span className={styles.vkLabel}>Войти с VK ID</span>
          <Icon
            src="/assets/arrow-small.svg"
            width={16}
            height={13}
            className={styles.arrowIcon}
          />
        </button>

        <div className={`${styles.emailField} ${focused ? styles.emailFieldFocused : ""}`}>
          <input
            type="email"
            className={styles.emailInput}
            placeholder="Адрес электронной почты"
            aria-label="Адрес электронной почты"
            aria-invalid={!!errors.email}
            onFocus={() => setFocused(true)}
            name={emailField.name}
            ref={emailField.ref}
            onChange={emailField.onChange}
            onBlur={(e) => {
              setFocused(false);
              emailField.onBlur(e);
            }}
          />
        </div>
        {errors.email ? (
          <span role="alert" style={{ color: "var(--text-error)", fontSize: "14px" }}>
            {errors.email.message}
          </span>
        ) : null}

        <Button variant="primary" fullWidth large className={styles.submitButton}>
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
