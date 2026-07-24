"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthForm } from "@/components/auth/auth-form/auth-form";
import { ProfileIntroModal } from "@/components/auth/profile-intro-modal/profile-intro-modal";
import { VerifyCodeModal } from "@/components/auth/verify-code-modal/verify-code-modal";
import { useAuthStore } from "@/lib/store/auth-store";
import styles from "./checkout-auth-prompt.module.css";

type CheckoutAuthStep = "auth" | "verify" | "intro";

interface CheckoutAuthPromptProps {
  productId: string;
}

export function CheckoutAuthPrompt({ productId }: CheckoutAuthPromptProps) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [step, setStep] = useState<CheckoutAuthStep>("auth");
  const [email, setEmail] = useState("");
  const returnUrl = `/product/${productId}/checkout`;

  const finishAuth = () => {
    login();
    router.push(returnUrl);
  };

  return (
    <>
      <div className={styles.page} aria-label="Требуется авторизация">
        <div className={styles.inner}>
          <AuthForm
            returnUrl={returnUrl}
            onEmailSubmit={(value) => {
              setEmail(value);
              setStep("verify");
            }}
            onVkSubmit={() => {
              setStep("intro");
            }}
          />
        </div>
      </div>

      <VerifyCodeModal
        isOpen={step === "verify"}
        email={email}
        onClose={() => setStep("auth")}
        onConfirm={() => setStep("intro")}
      />

      <ProfileIntroModal
        isOpen={step === "intro"}
        onClose={() => setStep(email ? "verify" : "auth")}
        onSave={finishAuth}
      />
    </>
  );
}
