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
      <p className="py-12 text-center text-sm text-[var(--ink-secondary)]">
        載入筆記中…
      </p>
    );
  }

  if (note === null) {
    return (
      <div className="rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center">
        <p className="font-editorial text-base font-semibold text-[var(--ink)]">
          找不到這篇本機觀庭筆記
        </p>
        <p className="mt-1 text-sm text-[var(--ink-secondary)]">
          個人筆記儲存在瀏覽器本機，更換裝置或清除瀏覽資料後會消失。
        </p>
        <Link
          href="/saved"
          className="btn-formal-primary mt-4 !px-4 !py-2 !text-xs"
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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-secondary)] hover:text-[var(--ink)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        回到清單與筆記
      </Link>

      <article className="space-y-5 rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6">
        <div className="space-y-2 border-b border-[var(--rule)] pb-4">
          <p className="text-xs font-medium text-[var(--robe-text)]">
            個人觀庭筆記（本機私密儲存）
          </p>
          <h1 className="font-editorial text-xl font-semibold text-[var(--ink)] sm:text-2xl">
            {note.reason || note.caseNo}
          </h1>
          <div className="space-y-0.5 text-sm text-[var(--ink-secondary)]">
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
                  className="rounded-[2px] border border-[var(--rule)] bg-[var(--bg-paper)] px-2.5 py-0.5 text-xs text-[var(--ink-body)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <section className="space-y-2">
          <h2 className="font-editorial text-sm font-semibold text-[var(--ink)]">
            程序與觀察摘要
          </h2>
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--ink-body)]">
            {note.summary}
          </div>
        </section>

        {note.rulesMemo && (
          <section className="space-y-1.5 rounded-[2px] border border-[var(--rule)] bg-[var(--bg-paper)] p-4">
            <h2 className="font-editorial text-sm font-semibold text-[var(--ink)]">
              現場動線與實務提醒
            </h2>
            <p className="whitespace-pre-wrap text-sm text-[var(--ink-body)]">
              {note.rulesMemo}
            </p>
          </section>
        )}

        {(note.clarity || note.friendliness || note.wouldRecommend !== null) && (
          <section className="flex flex-wrap gap-4 border-t border-[var(--rule)] pt-4 text-xs text-[var(--ink-secondary)]">
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

        <div className="flex flex-wrap items-center gap-2.5 border-t border-[var(--rule)] pt-4">
          <button
            type="button"
            onClick={handleDownloadMd}
            className="btn-formal-primary !px-3.5 !py-2 !text-xs"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            匯出 Markdown
          </button>
          <button
            type="button"
            onClick={handleDownloadJson}
            className="btn-formal-secondary !px-3.5 !py-2 !text-xs"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            匯出 JSON
          </button>
          <Link
            href={`/notes/new?edit=${encodeURIComponent(note.id)}`}
            className="btn-formal-secondary !px-3.5 !py-2 !text-xs"
          >
            <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
            編輯
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto inline-flex items-center gap-1.5 rounded-[2px] border border-[var(--seal-text)]/45 bg-[var(--bg-alert)] px-3.5 py-2 text-xs font-medium text-[var(--seal-text)] transition-colors hover:border-[var(--seal)] hover:bg-[var(--seal)] hover:text-[#fcfbf8]"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            刪除
          </button>
        </div>
      </article>
    </div>
  );
}
