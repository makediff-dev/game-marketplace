"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { ProfileContent } from "@/components/profile/profile-content/profile-content";
import { Footer } from "@/components/footer/footer/footer";
import { WelcomeModal } from "@/components/auth/welcome-modal/welcome-modal";
import {
  clearWelcomePending,
  readWelcomeNickname,
  readWelcomeReturnUrl,
  shouldShowWelcomeModal,
} from "@/lib/auth/welcome";
import { mockUser } from "@/lib/mock/user";
import { useAuthStore } from "@/lib/store/auth-store";

function ProfilePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const welcomeHandledRef = useRef(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [username, setUsername] = useState(mockUser.name);

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
      <ProfileContent />
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
        <Footer />
      </div>
    </div>
  );
}
