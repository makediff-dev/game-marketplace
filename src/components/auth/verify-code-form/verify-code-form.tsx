"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button/button";
import styles from "../auth-form/auth-form.module.css";

export function VerifyCodeForm() {
  const router = useRouter();
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length === 1 && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
    const code = inputsRef.current.map((input) => input?.value ?? "").join("");
    if (code.length === 6) {
      router.push("/register/profile");
    }
  };

  const handleKeyDown = (index: number, key: string) => {
    if (key === "Backspace" && !inputsRef.current[index]?.value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Подтверждение</h2>
      <p className={styles.legal} style={{ textAlign: "center" }}>
        Введите код из письма, отправленного на вашу почту
      </p>
      <div className={styles.codeInputs}>
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className={styles.codeInput}
            aria-label={`Цифра ${index + 1}`}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e.key)}
          />
        ))}
      </div>
      <p className={styles.resend}>
        Не получили код?{" "}
        <button type="button" className={styles.resendLink}>
          Отправить повторно
        </button>
      </p>
      <Button variant="primary" fullWidth large onClick={() => router.push("/register/profile")}>
        Подтвердить
      </Button>
    </div>
  );
}
