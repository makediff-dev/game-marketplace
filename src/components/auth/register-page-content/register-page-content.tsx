"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form/auth-form";
import { ProfileIntroModal } from "@/components/auth/profile-intro-modal/profile-intro-modal";
import { VerifyCodeModal } from "@/components/auth/verify-code-modal/verify-code-modal";
import { markWelcomePending } from "@/lib/auth/welcome";
import { useAuthStore } from "@/lib/store/auth-store";
import styles from "./register-page-content.module.css";

type RegistrationStep = "auth" | "verify" | "intro";

interface RegisterPageContentProps {
  returnUrl?: string;
}

export function RegisterPageContent({ returnUrl }: RegisterPageContentProps) {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [step, setStep] = useState<RegistrationStep>("auth");
  const [email, setEmail] = useState("");

  const finishRegistration = (nickname: string) => {
    const normalizedNickname = nickname.trim() || "Client";

    login();
    markWelcomePending(normalizedNickname, returnUrl);
    router.push(`/profile?welcome=1&name=${encodeURIComponent(normalizedNickname)}`);
  };

  return (
    <div className={styles.page}>
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

      <VerifyCodeModal
        isOpen={step === "verify"}
        email={email}
        onClose={() => setStep("auth")}
        onConfirm={() => setStep("intro")}
      />

      <ProfileIntroModal
        isOpen={step === "intro"}
        onClose={() => setStep(email ? "verify" : "auth")}
        onSave={finishRegistration}
      />
    </div>
  );
}
