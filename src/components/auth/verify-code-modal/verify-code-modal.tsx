"use client";

import { useEffect, useRef, useState } from "react";
import { ModalCloseButton } from "@/components/ui/modal-close-button/modal-close-button";
import { AuthModalPortal } from "@/components/auth/auth-modal/auth-modal-portal";
import styles from "./verify-code-modal.module.css";
import modalStyles from "../auth-modal/auth-modal.module.css";

interface VerifyCodeModalProps {
  isOpen: boolean;
  email?: string;
  onClose: () => void;
  onConfirm: () => void;
}

const RESEND_TIMEOUT_SECONDS = 50;
const EMPTY_CODE = ["", "", "", "", "", ""];

export function VerifyCodeModal({ isOpen, email, onClose, onConfirm }: VerifyCodeModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [code, setCode] = useState(EMPTY_CODE);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_TIMEOUT_SECONDS);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setCode(EMPTY_CODE);
    setSecondsLeft(RESEND_TIMEOUT_SECONDS);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Enter") {
        onConfirm();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    const frameId = window.requestAnimationFrame(() => {
      inputsRef.current[0]?.focus();
    });

    const intervalId = window.setInterval(() => {
      setSecondsLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      window.cancelAnimationFrame(frameId);
      window.clearInterval(intervalId);
    };
  }, [isOpen, onClose, onConfirm]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    setCode((previous) => {
      const next = [...previous];
      next[index] = digit;
      return next;
    });

    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (code.join("").length === 6) {
      onConfirm();
    }
  }, [code, isOpen, onConfirm]);

  const handleKeyDown = (index: number, key: string) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (secondsLeft > 0) {
      return;
    }

    setSecondsLeft(RESEND_TIMEOUT_SECONDS);
    setCode(EMPTY_CODE);
    inputsRef.current[0]?.focus();
  };

  return (
    <AuthModalPortal isOpen={isOpen}>
      <div
        ref={overlayRef}
        className={modalStyles.overlay}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-code-title"
        onClick={(event) => {
          if (event.target === overlayRef.current) {
            onClose();
          }
        }}
      >
        <div className={modalStyles.panel} onClick={(event) => event.stopPropagation()}>
          <ModalCloseButton onClick={onClose} />

          <div className={modalStyles.header}>
            <p className={modalStyles.topTitle}>Вход</p>
            <span className={modalStyles.iconWrap} aria-hidden>
              <span className={modalStyles.keyIcon}>🔑</span>
            </span>
            <h2 id="verify-code-title" className={modalStyles.heading}>
              Введите код из почты
            </h2>
            <p className={modalStyles.subtitle}>
              {email
                ? `Мы отправили письмо на ${email}`
                : "Мы отправили письмо на вашу почту"}
            </p>
          </div>

          <div className={modalStyles.body}>
            <div className={styles.codeInputs}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputsRef.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  className={styles.codeInput}
                  aria-label={`Цифра ${index + 1}`}
                  value={digit}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event.key)}
                />
              ))}
            </div>
          </div>

          <div className={modalStyles.footer}>
            <p className={modalStyles.footerText}>
              {secondsLeft > 0 ? (
                <>Отправить повторно через {secondsLeft} с.</>
              ) : (
                <>
                  Не получили код?{" "}
                  <button type="button" className={modalStyles.footerAction} onClick={handleResend}>
                    Отправить повторно
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </AuthModalPortal>
  );
}
