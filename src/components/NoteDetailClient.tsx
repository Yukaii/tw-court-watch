"use client";

import { ArrowLeft, Download, PenLine, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDualDate } from "@/lib/date";
import {
  deletePersonalNote,
  downloadTextFile,
  formatNoteAsMarkdown,
  getPersonalNoteById,
} from "@/lib/storage";
import type { PersonalNote } from "@/lib/types";

export function NoteDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [note, setNote] = useState<PersonalNote | null | undefined>(undefined);

  useEffect(() => {
    setNote(getPersonalNoteById(id));
  }, [id]);

  if (note === undefined) {
    return (
      <p className="py-12 text-center text-sm text-stone-500">載入筆記中…</p>
    );
  }

  if (note === null) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <p className="text-base font-semibold text-stone-800">
          找不到這篇本機觀庭筆記
        </p>
        <p className="mt-1 text-sm text-stone-500">
          個人筆記儲存在瀏覽器本機（localStorage），更換裝置或清除瀏覽資料後會消失。
        </p>
        <Link
          href="/saved"
          className="mt-4 inline-block rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white"
        >
          回到清單與筆記
        </Link>
      </div>
    );
  }

  const handleDownloadMd = () => {
    downloadTextFile(
      formatNoteAsMarkdown(note),
      `court-note-${note.date}-${note.id}.md`,
      "text/markdown;charset=utf-8",
    );
  };

  const handleDownloadJson = () => {
    downloadTextFile(
      JSON.stringify(note, null, 2),
      `court-note-${note.date}-${note.id}.json`,
      "application/json;charset=utf-8",
    );
  };

  const handleDelete = () => {
    if (!window.confirm("確定要刪除這篇本機觀庭筆記嗎？")) return;
    deletePersonalNote(note.id);
    router.push("/saved");
  };

  return (
    <div className="space-y-5">
      <Link
        href="/saved"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        回到清單與筆記
      </Link>

      <article className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <div className="space-y-2 border-b border-stone-100 pb-4">
          <p className="text-xs font-medium text-emerald-800">
            個人觀庭筆記（本機私密儲存）
          </p>
          <h1 className="text-xl font-bold text-stone-900 sm:text-2xl">
            {note.reason || note.caseNo}
          </h1>
          <div className="space-y-0.5 text-sm text-stone-600">
            <p>開庭日期：{formatDualDate(note.date)}</p>
            <p>
              法院與法庭：{note.courtName} · {note.courtroom}
            </p>
            <p>
              案號：{note.caseNo}
              {note.dukd ? ` · ${note.dukd}` : ""}
            </p>
          </div>

          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs text-stone-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-stone-900">程序與觀察摘要</h2>
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-stone-800">
            {note.summary}
          </div>
        </section>

        {note.rulesMemo && (
          <section className="space-y-1.5 rounded-xl border border-stone-200 bg-stone-50 p-4">
            <h2 className="text-sm font-bold text-stone-900">
              現場動線與實務提醒
            </h2>
            <p className="whitespace-pre-wrap text-sm text-stone-700">
              {note.rulesMemo}
            </p>
          </section>
        )}

        {(note.clarity || note.friendliness || note.wouldRecommend !== null) && (
          <section className="flex flex-wrap gap-4 border-t border-stone-100 pt-4 text-xs text-stone-600">
            {note.clarity && <span>程序清楚度：{note.clarity} / 5</span>}
            {note.friendliness && (
              <span>旁聽指引友善度：{note.friendliness} / 5</span>
            )}
            {note.wouldRecommend !== null && (
              <span>
                推薦新手：{note.wouldRecommend ? "推薦" : "較進階／暫不推薦"}
              </span>
            )}
          </section>
        )}

        <div className="flex flex-wrap items-center gap-2.5 border-t border-stone-100 pt-4">
          <button
            type="button"
            onClick={handleDownloadMd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-900"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            匯出 Markdown
          </button>
          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            匯出 JSON
          </button>
          <Link
            href={`/notes/new?edit=${encodeURIComponent(note.id)}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
          >
            <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
            編輯
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            刪除
          </button>
        </div>
      </article>
    </div>
  );
}
