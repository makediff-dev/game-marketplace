import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteShell } from "@/components/site-shell";
import { ListPageSkeleton } from "@/components/skeleton";

import "./globals.scss";
import "./interactive.scss";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Playnox — маркетплейс игровых товаров",
  description: "Маркетплейс игровых товаров и услуг",
};

const themeBootScript = `(function(){try{var t=localStorage.getItem("playnox-theme");if(t==="dark"){document.documentElement.setAttribute("data-theme","dark");document.documentElement.style.colorScheme="dark";}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <Providers>
          <SiteShell>
            <Suspense fallback={<ListPageSkeleton rows={5} />}>
              {children}
            </Suspense>
          </SiteShell>
        </Providers>
      </body>
    </html>
  );
}
