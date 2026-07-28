"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { PageHeader } from "@/components/layout/page-header/page-header";
import { ProfileContent } from "@/components/profile/profile-content/profile-content";
import { ProfileMenuModal } from "@/components/profile/profile-menu-modal/profile-menu-modal";
import { Footer } from "@/components/footer/footer/footer";
import { WelcomeModal } from "@/components/auth/welcome-modal/welcome-modal";
import { Icon } from "@/components/ui/icon/icon";
import {
  clearWelcomePending,
  readWelcomeNickname,
  readWelcomeReturnUrl,
  shouldShowWelcomeModal,
} from "@/lib/auth/welcome";
import { mockUser } from "@/lib/mock/user";
import { useAuthStore } from "@/lib/store/auth-store";
import styles from "./profile-page-content.module.css";

function formatBalance(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const welcomeHandledRef = useRef(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState(mockUser.name);

  useEffect(() => {
    if (searchParams.get("menu") === "1") {
      setMenuOpen(true);
      router.replace("/profile");
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (welcomeHandledRef.current) {
      return;
    }

    const welcomeParam = searchParams.get("welcome");
    if (!shouldShowWelcomeModal(welcomeParam)) {
      return;
    }

    login();

    const nameFromQuery = searchParams.get("name");
    setUsername(readWelcomeNickname(nameFromQuery) || mockUser.name);
    setWelcomeOpen(true);
  }, [login, searchParams]);

  const handleCloseWelcome = () => {
    welcomeHandledRef.current = true;

    const returnUrl = readWelcomeReturnUrl();
    clearWelcomePending();
    setWelcomeOpen(false);

    if (returnUrl) {
      router.replace(returnUrl);
      return;
    }

    router.replace("/profile");
  };

  return (
    <>
      <AppNavbar />
      <div className="contentBlock">
        <PageHeader title={`Профиль ${username}`} onMenuClick={() => setMenuOpen(true)} />
        <Link href="/profile/balance" className={styles.balanceLink}>
          <span className={styles.balanceAmount}>
            <span className={styles.balanceIcon} aria-hidden>
              💳
            </span>
            <span className={styles.balanceText}>{formatBalance(mockUser.balance)}</span>
          </span>
          <Icon
            src="/assets/arrow-small.svg"
            width={16}
            height={13}
            tone="muted"
            className={styles.balanceArrow}
          />
        </Link>
      </div>
      <ProfileContent />
      <Footer />
      <ProfileMenuModal isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <WelcomeModal isOpen={welcomeOpen} username={username} onClose={handleCloseWelcome} />
    </>
  );
}

export function ProfilePageContent() {
  return (
    <div className="container">
      <div className="pageContent">
        <Suspense fallback={null}>
          <ProfilePageInner />
        </Suspense>
      </div>
    </div>
  );
}
