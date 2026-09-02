import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import { AuthHydrator } from "@/components/auth/auth-hydrator/auth-hydrator";
import { DealHydrator } from "@/components/deal/deal-hydrator/deal-hydrator";
import { ThemeHydrator } from "@/components/theme/theme-hydrator/theme-hydrator";
import { ToastProvider } from "@/components/ui/toast/toast-provider";
import { ActiveDealTimerDock } from "@/components/deal/active-deal-timer-dock/active-deal-timer-dock";
import { ActiveDealExpiredModal } from "@/components/deal/active-deal-expired-modal/active-deal-expired-modal";
import "@/styles/globals.css";

const interTight = Inter_Tight({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Playnox — маркетплейс игровых товаров",
  description: "Playnox — маркетплейс игровых товаров и услуг",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("playnox-theme");if(t==="dark"){document.documentElement.setAttribute("data-theme","dark");document.documentElement.style.colorScheme="dark";}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={interTight.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeHydrator />
        <AuthHydrator />
        <DealHydrator />
        <ToastProvider>
          {children}
          <ActiveDealTimerDock />
          <ActiveDealExpiredModal />
        </ToastProvider>
      </body>
    </html>
  );
}
