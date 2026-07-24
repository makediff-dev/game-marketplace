"use client";

import { GuestOnlyRoute } from "@/components/auth/guest-only-route/guest-only-route";
import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { RegisterPageContent } from "@/components/auth/register-page-content/register-page-content";
import { Footer } from "@/components/footer/footer/footer";
import styles from "@/app/register/page.module.css";

interface AuthPageShellProps {
  mode: "login" | "register";
  returnUrl?: string;
}

export function AuthPageShell({ mode, returnUrl }: AuthPageShellProps) {
  const redirectTo = returnUrl || "/profile";

  return (
    <GuestOnlyRoute redirectTo={redirectTo}>
      <div className="container">
        <div className={`pageContent ${styles.pageContent}`}>
          <AppNavbar activeAuth={mode} />
          <RegisterPageContent returnUrl={returnUrl} />
          <Footer />
        </div>
      </div>
    </GuestOnlyRoute>
  );
}
