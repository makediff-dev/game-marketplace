"use client";

import { useState, type FormEvent } from "react";

import { getErrorMessage } from "@/api/error";
import { EmailCodeDialog } from "@/components/email-code-dialog";
import { VkOneTap } from "@/components/vk-one-tap";
import { useRequestEmailCode, useVkLogin } from "@/hooks/use-auth";
import styles from "@/styles/auth-screen.module.scss";

const VK_ERROR_TEXT: Record<string, string> = {
  denied: "Вход через VK ID отменён",
  invalid: "VK ID вернул неполный ответ",
  failed: "Не удалось войти через VK ID",
};

export function AuthScreen({ vkError }: { vkError?: string }) {
  const vkLogin = useVkLogin();
  const requestCode = useRequestEmailCode();
  const [codeEmail, setCodeEmail] = useState<string | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(50);
  const [devCode, setDevCode] = useState<string | undefined>();
  const [vkWidgetError, setVkWidgetError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = String(new FormData(event.currentTarget).get("email"));

    requestCode.mutate(email, {
      onSuccess: (result) => {
        setRetryAfterSeconds(result.retryAfterSeconds);
        setDevCode(result.devCode);
        setCodeEmail(email);
      },
    });
  }

  return (
    <>
      <h1 className={styles["auth-screen__heading"]}>Вход или регистрация</h1>

      <section className={styles["auth-screen__section"]}>
        <VkOneTap
          onToken={(accessToken) => {
            setVkWidgetError(null);
            vkLogin.mutate(accessToken);
          }}
          onError={setVkWidgetError}
        />
        {(vkWidgetError || vkLogin.isError || vkError) && (
          <p className={styles["auth-screen__error"]} role="alert">
            {vkWidgetError ??
              (vkLogin.isError
                ? getErrorMessage(vkLogin.error)
                : (VK_ERROR_TEXT[vkError ?? ""] ?? VK_ERROR_TEXT.failed))}
          </p>
        )}

        <form className={styles["auth-screen__form"]} onSubmit={handleSubmit}>
          <label className={styles["auth-screen__email-field"]}>
            <input
              className={styles["auth-screen__email-input"]}
              type="email"
              name="email"
              placeholder="Адрес электронной почты"
              autoComplete="email"
              required
              aria-label="Адрес электронной почты"
            />
          </label>

          {requestCode.isError && !codeEmail && (
            <p className={styles["auth-screen__error"]} role="alert">
              {getErrorMessage(requestCode.error)}
            </p>
          )}

          <button
            className={styles["auth-screen__submit"]}
            type="submit"
            disabled={requestCode.isPending}
          >
            Получить код
          </button>
        </form>

        <p className={styles["auth-screen__legal"]}>
          Продолжая регистрацию или вход, вы принимаете условия{" "}
          <a href="/terms">Пользовательского соглашения</a>, а также
          предоставляете <a href="/terms">Согласие</a>
          <br />
          на обработку персональных данных на условиях{" "}
          <a href="/privacy">Политики конфиденциальности</a>
        </p>
      </section>

      {codeEmail && (
        <EmailCodeDialog
          email={codeEmail}
          retryAfterSeconds={retryAfterSeconds}
          devCode={devCode}
          onClose={() => setCodeEmail(null)}
        />
      )}
    </>
  );
}
