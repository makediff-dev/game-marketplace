"use client";

import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

import { getErrorMessage } from "@/api/error";
import { useRequestEmailCode, useVerifyEmailCode } from "@/hooks/use-auth";
import styles from "@/styles/email-code-dialog.module.scss";

const CODE_LENGTH = 6;

interface EmailCodeDialogProps {
  email: string;
  retryAfterSeconds: number;
  devCode?: string;
  onClose: () => void;
}

export function EmailCodeDialog({
  email,
  retryAfterSeconds,
  devCode,
  onClose,
}: EmailCodeDialogProps) {
  const requestCode = useRequestEmailCode();
  const verifyCode = useVerifyEmailCode();
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: CODE_LENGTH }, () => ""),
  );
  const [seconds, setSeconds] = useState(retryAfterSeconds);
  const [testCode, setTestCode] = useState(devCode);

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSeconds((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [seconds]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!devCode) {
      return;
    }

    setTestCode(devCode);
  }, [devCode]);

  function submitCode(code: string) {
    if (verifyCode.isPending) {
      return;
    }

    verifyCode.mutate({ email, code });
  }

  function updateDigits(next: string[]) {
    setDigits(next);

    if (next.every((digit) => digit !== "")) {
      submitCode(next.join(""));
    }
  }

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = digits.slice();

    next[index] = digit;
    updateDigits(next);

    if (digit && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (!text) {
      return;
    }

    event.preventDefault();

    const next = Array.from(
      { length: CODE_LENGTH },
      (_, index) => text[index] ?? "",
    );

    updateDigits(next);
    inputs.current[Math.min(text.length, CODE_LENGTH) - 1]?.focus();
  }

  function handleResend() {
    requestCode.mutate(email, {
      onSuccess: (result) => {
        setSeconds(result.retryAfterSeconds);
        setTestCode(result.devCode);
        setDigits(Array.from({ length: CODE_LENGTH }, () => ""));
        verifyCode.reset();
        inputs.current[0]?.focus();
      },
    });
  }

  const error = verifyCode.isError
    ? getErrorMessage(verifyCode.error)
    : requestCode.isError
      ? getErrorMessage(requestCode.error)
      : "";

  return (
    <div
      className={styles["email-code-dialog__overlay"]}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={styles["email-code-dialog"]}
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-code-title"
      >
        <div className={styles["email-code-dialog__header"]}>
          <h2
            className={styles["email-code-dialog__title"]}
            id="email-code-title"
          >
            Вход
          </h2>
          <button
            className={styles["email-code-dialog__close"]}
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <img src="/auth/close.svg" alt="" width={24} height={24} />
          </button>
        </div>

        <div className={styles["email-code-dialog__body"]}>
          <div className={styles["email-code-dialog__intro"]}>
            <p
              className={styles["email-code-dialog__emoji"]}
              aria-hidden="true"
            >
              🔑
            </p>
            <p className={styles["email-code-dialog__heading"]}>
              Введите код из почты
            </p>
            <p className={styles["email-code-dialog__hint"]}>
              Мы отправили письмо на {email}
            </p>
            {testCode ? (
              <p
                className={styles["email-code-dialog__dev-code"]}
                role="status"
              >
                Локальный код: <strong>{testCode}</strong>
              </p>
            ) : null}
          </div>

          <div className={styles["email-code-dialog__code-block"]}>
            <div className={styles["email-code-dialog__digits"]}>
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    inputs.current[index] = node;
                  }}
                  className={styles["email-code-dialog__digit"]}
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  aria-label={`Цифра ${index + 1}`}
                  value={digit}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                />
              ))}
            </div>

            <button
              className={styles["email-code-dialog__resend"]}
              type="button"
              disabled={seconds > 0 || requestCode.isPending}
              onClick={handleResend}
            >
              {seconds > 0
                ? `Отправить повторно через ${seconds} с.`
                : "Отправить повторно"}
            </button>

            {error && (
              <p className={styles["email-code-dialog__error"]} role="alert">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className={styles["email-code-dialog__spacer"]} />
      </div>
    </div>
  );
}
