import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "旁聽小幫手｜臺灣公開審判庭期與觀庭筆記",
    template: "%s｜旁聽小幫手",
  },
  description:
    "協助一般民眾在 3 分鐘內查詢臺灣主要法院公開庭期，提供開庭日曆票卡、Google 日曆訂閱、國民法官專區、院區交通與本機觀庭筆記。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant-TW" className={jetbrainsMono.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700&family=Noto+Serif+TC:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="flex min-h-dvh flex-col font-sans text-[#191816]">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
