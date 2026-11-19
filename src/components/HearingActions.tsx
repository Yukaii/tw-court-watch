"use client";

import {
  Bookmark,
  BookmarkCheck,
  CalendarPlus,
  ExternalLink,
  FileText,
  PenLine,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { OFFICIAL_LIVE_STATUS_URL } from "@/lib/courts";
import { formatCompactDualDate } from "@/lib/date";
import { generateHearingIcs } from "@/lib/ics";
import {
  downloadTextFile,
  getNotesForHearing,
  isHearingSaved,
  toggleSaveHearing,
} from "@/lib/storage";
import type { Hearing, PersonalNote } from "@/lib/types";

interface HearingActionsProps {
  hearing: Hearing;
}

export function HearingActions({ hearing }: HearingActionsProps) {
  const [saved, setSaved] = useState(false);
  const [notes, setNotes] = useState<PersonalNote[]>([]);

  useEffect(() => {
    const sync = () => {
      setSaved(isHearingSaved(hearing.id));
      setNotes(getNotesForHearing(hearing.id));
    };
    sync();
    window.addEventListener("tw-court-watch-storage", sync);
    return () => window.removeEventListener("tw-court-watch-storage", sync);
  }, [hearing.id]);

  const handleToggleSave = () => {
    setSaved(toggleSaveHearing(hearing));
  };

  const handleDownloadIcs = () => {
    const ics = generateHearingIcs(hearing);
    downloadTextFile(
      ics,
      `hearing-${hearing.crtid}-${hearing.date}.ics`,
      "text/calendar;charset=utf-8",
    );
  };

  return (
    <div className="space-y-6">
      {/* Primary interactive action bar */}
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={handleToggleSave}
          className={saved ? "btn-formal-primary" : "btn-formal-secondary"}
        >
          {saved ? (
            <>
              <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
              <span>已加入我的清單</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" aria-hidden="true" />
              <span>收藏到我的清單</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleDownloadIcs}
          className="btn-formal-secondary"
        >
          <CalendarPlus
            className="h-4 w-4 text-[var(--robe-text)]"
            aria-hidden="true"
          />
          <span>加入行事曆（.ics）</span>
        </button>

        <Link
          href={`/notes/new?hearing=${encodeURIComponent(hearing.id)}`}
          className="btn-formal-secondary"
        >
          <PenLine
            className="h-4 w-4 text-[var(--robe-text)]"
            aria-hidden="true"
          />
          <span>寫個人觀庭筆記</span>
        </Link>
      </div>

      {/* Official verification links */}
      <div className="flex flex-wrap items-center gap-3 rounded-[2px] border border-[var(--rule)] bg-[var(--bg-tint)] p-3.5 text-sm">
        <a
          href={hearing.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-[var(--robe-text)] underline decoration-[var(--robe-text)]/40 underline-offset-4 hover:text-[var(--ink)]"
        >
          <span>到司法院查詢頁確認（已預選{hearing.courtShortName}）</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        <span className="text-[var(--rule)]" aria-hidden="true">
          |
        </span>
        <a
          href={OFFICIAL_LIVE_STATUS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-[var(--ink-body)] underline decoration-[var(--border-medium)] underline-offset-4 hover:text-[var(--ink)]"
        >
          <Radio
            className="h-3.5 w-3.5 text-[var(--seal-text)]"
            aria-hidden="true"
          />
          <span>開庭當日查即時開庭進度</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      {/* Personal notes linked to this hearing */}
      <section className="rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-editorial text-base font-semibold text-[var(--ink)]">
              我的觀庭筆記（本機私密儲存）
            </h2>
            <p className="text-xs text-[var(--ink-secondary)]">
              僅儲存在此瀏覽器的本機儲存空間，不會公開上傳；可隨時匯出 Markdown 或 JSON。
            </p>
          </div>
          <Link
            href={`/notes/new?hearing=${encodeURIComponent(hearing.id)}`}
            className="btn-formal-primary !px-3 !py-1.5 !text-xs"
          >
            <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
            <span>新增筆記</span>
          </Link>
        </div>

        {notes.length === 0 ? (
          <p className="mt-4 rounded-[2px] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-paper)] px-4 py-5 text-center text-sm text-[var(--ink-secondary)]">
            你尚未為這場庭寫過筆記。旁聽結束後，可以用紙筆記錄重點再回來整理。
          </p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {notes.map((note) => (
              <li key={note.id}>
                <Link
                  href={`/notes/${note.id}`}
                  className="block rounded-[2px] border border-[var(--rule)] p-3.5 transition-colors hover:border-[var(--robe-text)] hover:bg-[var(--bg-paper)]"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-[var(--ink-secondary)]">
                    <span className="inline-flex items-center gap-1 font-medium text-[var(--ink)]">
                      <FileText
                        className="h-3.5 w-3.5 text-[var(--robe-text)]"
                        aria-hidden="true"
                      />
                      {formatCompactDualDate(note.attendedAt || note.date)}
                    </span>
                    {note.clarity && <span>程序清楚度 {note.clarity}/5</span>}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-[var(--ink-body)]">
                    {note.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
