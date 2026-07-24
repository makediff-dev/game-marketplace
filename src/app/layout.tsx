import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import { AuthHydrator } from "@/components/auth/auth-hydrator/auth-hydrator";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={interTight.variable}>
      <body>
        <AuthHydrator />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
