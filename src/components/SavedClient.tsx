"use client";

import {
  Bookmark,
  CalendarPlus,
  Download,
  ExternalLink,
  FileText,
  PenLine,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCompactDualDate } from "@/lib/date";
import { generateBatchIcs, generateHearingIcs } from "@/lib/ics";
import {
  deletePersonalNote,
  downloadTextFile,
  formatNoteAsMarkdown,
  loadPersonalNotes,
  loadSavedHearings,
  removeSavedHearing,
} from "@/lib/storage";
import type { PersonalNote, SavedHearing } from "@/lib/types";

export function SavedClient() {
  const [saved, setSaved] = useState<SavedHearing[]>([]);
  const [notes, setNotes] = useState<PersonalNote[]>([]);

  useEffect(() => {
    const sync = () => {
      setSaved(loadSavedHearings());
      setNotes(loadPersonalNotes());
    };
    sync();
    window.addEventListener("tw-court-watch-storage", sync);
    return () => window.removeEventListener("tw-court-watch-storage", sync);
  }, []);

  const handleExportAllIcs = () => {
    if (saved.length === 0) return;
    const ics = generateBatchIcs(saved.map((s) => s.snapshot));
    downloadTextFile(
      ics,
      `tw-court-watch-saved-${saved.length}.ics`,
      "text/calendar;charset=utf-8",
    );
  };

  const handleExportNotesJson = () => {
    if (notes.length === 0) return;
    downloadTextFile(
      JSON.stringify(notes, null, 2),
      `court-watch-notes-${new Date().toISOString().slice(0, 10)}.json`,
      "application/json;charset=utf-8",
    );
  };

  const handleExportNotesMarkdown = () => {
    if (notes.length === 0) return;
    const md = notes.map(formatNoteAsMarkdown).join("\n\n");
    downloadTextFile(
      md,
      `court-watch-notes-${new Date().toISOString().slice(0, 10)}.md`,
      "text/markdown;charset=utf-8",
    );
  };

  return (
    <div className="space-y-8">
      {/* Saved hearings section */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 font-editorial text-lg font-semibold text-[var(--ink)]">
              <Bookmark
                className="h-5 w-5 text-[var(--robe-text)]"
                aria-hidden="true"
              />
              收藏的庭期（{saved.length}）
            </h2>
            <p className="text-xs text-[var(--ink-secondary)]">
              資料僅儲存在此瀏覽器；出發前建議點「司法院確認」檢查是否臨時改期。
            </p>
          </div>
          {saved.length > 0 && (
            <button
              type="button"
              onClick={handleExportAllIcs}
              className="btn-formal-primary !px-3 !py-1.5 !text-xs"
            >
              <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
              全部匯出 .ics 行事曆
            </button>
          )}
        </div>

        {saved.length === 0 ? (
          <div className="rounded-[2px] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-8 text-center">
            <p className="text-sm font-medium text-[var(--ink)]">
              尚未收藏任何庭期
            </p>
            <p className="mt-1 text-xs text-[var(--ink-secondary)]">
              在找庭列表點「收藏」，就能整理你想去的場次並一鍵加入行事曆。
            </p>
            <Link
              href="/search"
              className="btn-formal-primary mt-3 !px-4 !py-2 !text-xs"
            >
              去逛今天的庭期 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-[2px] border border-[var(--robe-text)]/35 bg-[var(--bg-sage)] px-4 py-3 text-xs leading-relaxed text-[var(--ink-body)]">
              <strong className="text-[var(--ink)]">出發前小提醒：</strong>
              提前 15–20 分鐘抵達以通過金屬探測門與 X 光安檢；進入法庭前手機切靜音；準備紙本筆記本與筆，庭內嚴禁錄音、錄影、拍照。
            </div>

            {saved.map(({ hearingId, snapshot }) => (
              <article
                key={hearingId}
                className="rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[var(--ink-secondary)]">
                      {formatCompactDualDate(snapshot.date)} ·{" "}
                      <span className="font-tabular font-semibold text-[var(--ink)]">
                        {snapshot.time}
                      </span>
                    </p>
                    <Link
                      href={`/hearings/${snapshot.id}`}
                      className="block font-editorial text-base font-semibold text-[var(--ink)] hover:text-[var(--robe-text)]"
                    >
                      {snapshot.reason || `${snapshot.sysLabel}${snapshot.dukd}`}
                    </Link>
                    <p className="text-xs text-[var(--ink-body)]">
                      {snapshot.courtName} · {snapshot.courtroom} ·{" "}
                      {snapshot.caseNo} · {snapshot.dukd}
                    </p>
                    <p className="text-xs text-[var(--ink-secondary)]">
                      {snapshot.address}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeSavedHearing(hearingId)}
                    aria-label="從清單移除"
                    className="rounded-[2px] border border-[var(--rule)] p-2 text-[var(--ink-muted)] hover:border-[var(--seal-text)]/45 hover:bg-[var(--bg-alert)] hover:text-[var(--seal-text)]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-[var(--rule)] pt-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      const ics = generateHearingIcs(snapshot);
                      downloadTextFile(
                        ics,
                        `hearing-${snapshot.crtid}-${snapshot.date}.ics`,
                        "text/calendar;charset=utf-8",
                      );
                    }}
                    className="inline-flex items-center gap-1 font-medium text-[var(--robe-text)] hover:text-[var(--ink)]"
                  >
                    <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
                    下載 .ics
                  </button>
                  <Link
                    href={`/notes/new?hearing=${encodeURIComponent(snapshot.id)}`}
                    className="inline-flex items-center gap-1 font-medium text-[var(--ink-body)] hover:text-[var(--ink)]"
                  >
                    <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
                    寫觀庭筆記
                  </Link>
                  <a
                    href={snapshot.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1 text-[var(--ink-secondary)] hover:text-[var(--ink)]"
                  >
                    司法院確認
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Personal notes section */}
      <section className="space-y-3 border-t border-[var(--rule)] pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 font-editorial text-lg font-semibold text-[var(--ink)]">
              <FileText
                className="h-5 w-5 text-[var(--robe-text)]"
                aria-hidden="true"
              />
              我的個人觀庭筆記（{notes.length}）
            </h2>
            <p className="text-xs text-[var(--ink-secondary)]">
              私密儲存於本機瀏覽器，不會公開發布；支援匯出 Markdown 或 JSON 備份。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {notes.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleExportNotesMarkdown}
                  className="btn-formal-secondary !px-2.5 !py-1.5 !text-xs"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  匯出 Markdown
                </button>
                <button
                  type="button"
                  onClick={handleExportNotesJson}
                  className="btn-formal-secondary !px-2.5 !py-1.5 !text-xs"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  匯出 JSON
                </button>
              </>
            )}
            <Link
              href="/notes/new"
              className="btn-formal-primary !px-3 !py-1.5 !text-xs"
            >
              <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
              寫新筆記
            </Link>
          </div>
        </div>

        {notes.length === 0 ? (
          <div className="rounded-[2px] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-8 text-center">
            <p className="text-sm font-medium text-[var(--ink)]">
              還沒有個人觀庭筆記
            </p>
            <p className="mt-1 text-xs text-[var(--ink-secondary)]">
              看完庭之後可以回來整理程序重點、動線心得與新手提醒。
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <article
                key={note.id}
                className="rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/notes/${note.id}`}
                    className="min-w-0 flex-1 space-y-1 no-underline"
                  >
                    <p className="text-xs text-[var(--ink-secondary)]">
                      {formatCompactDualDate(note.date)} · {note.courtName}{" "}
                      {note.courtroom}
                    </p>
                    <h3 className="font-editorial text-base font-semibold text-[var(--ink)] hover:text-[var(--robe-text)]">
                      {note.reason || note.caseNo}
                    </h3>
                    <p className="line-clamp-2 text-sm text-[var(--ink-body)]">
                      {note.summary}
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("確定要刪除這篇本機觀庭筆記嗎？")) {
                        deletePersonalNote(note.id);
                      }
                    }}
                    aria-label="刪除此筆記"
                    className="rounded-[2px] border border-[var(--rule)] p-2 text-[var(--ink-muted)] hover:border-[var(--seal-text)]/45 hover:bg-[var(--bg-alert)] hover:text-[var(--seal-text)]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
