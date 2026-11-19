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
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
            saved
              ? "border-emerald-800 bg-emerald-800 text-white"
              : "border-emerald-800 bg-white text-emerald-900 hover:bg-emerald-50"
          }`}
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
          className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
        >
          <CalendarPlus className="h-4 w-4 text-emerald-800" aria-hidden="true" />
          <span>加入行事曆（.ics）</span>
        </button>

        <Link
          href={`/notes/new?hearing=${encodeURIComponent(hearing.id)}`}
          className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
        >
          <PenLine className="h-4 w-4 text-emerald-800" aria-hidden="true" />
          <span>寫個人觀庭筆記</span>
        </Link>
      </div>

      {/* Official verification links */}
      <div className="flex flex-wrap gap-3 rounded-xl border border-stone-200 bg-stone-50/80 p-3.5 text-sm">
        <a
          href={hearing.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-emerald-900 underline decoration-emerald-700/40 underline-offset-4 hover:text-emerald-700"
        >
          <span>到司法院查詢頁確認（已預選{hearing.courtShortName}）</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        <span className="text-stone-300" aria-hidden="true">
          |
        </span>
        <a
          href={OFFICIAL_LIVE_STATUS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-stone-700 underline decoration-stone-400 underline-offset-4 hover:text-stone-900"
        >
          <Radio className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
          <span>開庭當日查即時開庭進度</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      {/* Personal notes linked to this hearing */}
      <section className="rounded-xl border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              我的觀庭筆記（本機私密儲存）
            </h2>
            <p className="text-xs text-stone-500">
              僅儲存在此瀏覽器的 localStorage，不會公開上傳；可隨時匯出 Markdown 或 JSON。
            </p>
          </div>
          <Link
            href={`/notes/new?hearing=${encodeURIComponent(hearing.id)}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-900"
          >
            <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
            <span>新增筆記</span>
          </Link>
        </div>

        {notes.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-stone-200 bg-stone-50/60 px-4 py-5 text-center text-sm text-stone-500">
            你尚未為這場庭寫過筆記。旁聽結束後，可以用紙筆記錄重點再回來整理。
          </p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {notes.map((note) => (
              <li key={note.id}>
                <Link
                  href={`/notes/${note.id}`}
                  className="block rounded-lg border border-stone-200 p-3.5 transition-colors hover:border-emerald-700/40 hover:bg-stone-50"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
                    <span className="inline-flex items-center gap-1 font-medium text-stone-700">
                      <FileText className="h-3.5 w-3.5 text-emerald-800" aria-hidden="true" />
                      {formatCompactDualDate(note.attendedAt || note.date)}
                    </span>
                    {note.clarity && <span>程序清楚度 {note.clarity}/5</span>}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-stone-800">
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
