import type { Metadata } from "next";
import { NoteFormClient } from "@/components/NoteFormClient";
import { getHearingById } from "@/lib/data-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "撰寫個人觀庭筆記",
  robots: { index: false, follow: false },
};

interface NewNotePageProps {
  searchParams: Promise<{ hearing?: string; edit?: string }>;
}

export default async function NewNotePage({ searchParams }: NewNotePageProps) {
  const params = await searchParams;
  const hearing = params.hearing ? await getHearingById(params.hearing) : null;

  return (
    <div className="space-y-6">
      <header className="legal-rule-bottom space-y-1.5 pb-4">
        <h1 className="font-editorial text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
          {params.edit ? "編輯個人觀庭筆記" : "撰寫個人觀庭筆記"}
        </h1>
        <p className="text-sm text-[var(--ink-secondary)]">
          紀錄法庭程序順序、爭點脈絡與動線觀察，儲存於本機瀏覽器並可匯出 Markdown／JSON。
        </p>
      </header>

      <NoteFormClient
        initialHearing={hearing}
        editNoteId={params.edit ?? null}
      />
    </div>
  );
}
