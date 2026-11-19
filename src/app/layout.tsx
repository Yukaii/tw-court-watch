import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const notoSans = Noto_Sans_TC({
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans",
  display: "swap",
  preload: false,
});

const notoSerif = Noto_Serif_TC({
  weight: ["600", "700"],
  variable: "--font-noto-serif",
  display: "swap",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "旁聽小幫手｜台灣公開審判日曆與個人觀庭筆記",
    template: "%s｜旁聽小幫手",
  },
  description:
    "讓一般人 3 分鐘內找到今天或這週值得旁聽的台灣法院公開庭期，以日曆票卡呈現開庭時間、庭類白話解說、國民法官專區、正確院區交通與本機觀庭筆記。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant-TW"
      className={`${notoSans.variable} ${notoSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col font-sans text-[#1c1a17]">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
