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
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          {params.edit ? "編輯個人觀庭筆記" : "撰寫個人觀庭筆記"}
        </h1>
        <p className="text-sm text-stone-500">
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
