import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "旁聽小幫手｜台灣法院庭期查詢與個人觀庭筆記",
    template: "%s｜旁聽小幫手",
  },
  description:
    "讓一般人 3 分鐘內找到今天或這週值得旁聽的台灣法院公開庭期，含庭類白話解說、國民法官標記、正確院區交通、新手守則與本機觀庭筆記。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant-TW">
      <body className="flex min-h-dvh flex-col bg-[#faf9f6] text-stone-900">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[960px] flex-1 px-4 pb-16 pt-6 sm:px-6">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
