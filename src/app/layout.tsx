import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import { AuthHydrator } from "@/components/auth/auth-hydrator/auth-hydrator";
import { ThemeHydrator } from "@/components/theme/theme-hydrator/theme-hydrator";
import { ToastProvider } from "@/components/ui/toast/toast-provider";
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
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
