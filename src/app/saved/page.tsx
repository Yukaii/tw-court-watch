import type { Metadata } from "next";
import { SavedClient } from "@/components/SavedClient";

export const metadata: Metadata = {
  title: "我的清單與個人筆記",
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return (
    <div className="space-y-6">
      <header className="legal-rule-bottom space-y-1.5 pb-4">
        <h1 className="font-editorial text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
          我的旁聽清單與個人筆記
        </h1>
        <p className="text-sm text-[var(--ink-secondary)]">
          所有收藏與筆記皆私密儲存在你的瀏覽器本機，不需登入、不會上傳至伺服器。
        </p>
      </header>

      <SavedClient />
    </div>
  );
}
