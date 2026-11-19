"use client";

import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  CalendarPlus,
  MapPin,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getWeekdayZh } from "@/lib/date";
import { generateHearingIcs } from "@/lib/ics";
import {
  downloadTextFile,
  isHearingSaved,
  toggleSaveHearing,
} from "@/lib/storage";
import type { Hearing } from "@/lib/types";

interface CalendarEventCardProps {
  hearing: Hearing;
  variant?: "paper" | "dark";
  showCourt?: boolean;
}

export function CalendarEventCard({
  hearing,
  variant = "paper",
  showCourt = true,
}: CalendarEventCardProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(isHearingSaved(hearing.id));
    sync();
    window.addEventListener("tw-court-watch-storage", sync);
    return () => window.removeEventListener("tw-court-watch-storage", sync);
  }, [hearing.id]);

  const [yearStr, monthStr, dayStr] = hearing.date.split("-");
  const monthNum = Number.parseInt(monthStr ?? "1", 10);
  const dayNum = Number.parseInt(dayStr ?? "1", 10);
  const rocYear = Number.parseInt(yearStr ?? "2026", 10) - 1911;
  const weekday = getWeekdayZh(hearing.date);

  const isDark = variant === "dark";

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(toggleSaveHearing(hearing));
  };

  const handleDownloadIcs = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ics = generateHearingIcs(hearing);
    downloadTextFile(
      ics,
      `hearing-${hearing.crtid}-${hearing.date}.ics`,
      "text/calendar;charset=utf-8",
    );
  };

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all sm:flex-row ${
        isDark
          ? "border-[#f6f2e9]/18 bg-[#1e3d31] text-[#f6f2e9] hover:border-[#e9b949]/60"
          : "border-[#1c1a17]/15 bg-[#fffdf8] text-[#1c1a17] shadow-[0_2px_10px_-4px_rgba(28,26,23,0.12)] hover:-translate-y-0.5 hover:border-[#1f4b3b]/45 hover:shadow-[0_12px_28px_-14px_rgba(28,26,23,0.22)]"
      }`}
    >
      {/* Left Calendar Date Spine (Tear-off calendar pass style) */}
      <div
        className={`relative flex shrink-0 items-center justify-between border-b border-dashed px-4 py-3 sm:w-[104px] sm:flex-col sm:justify-center sm:border-b-0 sm:border-r sm:px-3 sm:py-4 ${
          isDark
            ? "border-[#f6f2e9]/20 bg-[#152d24]"
            : hearing.isLayJudge
              ? "border-[#c78a1f]/35 bg-[#faf0d7]"
              : "border-[#1c1a17]/18 bg-[#efe8d8]"
        }`}
      >
        {/* Subtle semicircular ticket notches on desktop */}
        <span
          aria-hidden="true"
          className={`pointer-events-none hidden h-3 w-3 rounded-full sm:block sm:absolute -top-1.5 -right-1.5 ${
            isDark ? "bg-[#173026]" : "bg-[#f6f2e9]"
          }`}
        />
        <span
          aria-hidden="true"
          className={`pointer-events-none hidden h-3 w-3 rounded-full sm:block sm:absolute -bottom-1.5 -right-1.5 ${
            isDark ? "bg-[#173026]" : "bg-[#f6f2e9]"
          }`}
        />

        <div className="flex items-baseline gap-2 sm:flex-col sm:items-center sm:gap-0">
          <span
            className={`text-[11px] font-semibold tracking-wider ${
              isDark
                ? "text-[#e9b949]"
                : hearing.isLayJudge
                  ? "text-[#925f0c]"
                  : "text-[#5c564c]"
            }`}
          >
            {monthNum}月 · 週{weekday}
          </span>
          <span
            className={`font-editorial text-3xl leading-none font-bold tracking-tight sm:mt-1 sm:text-[34px] ${
              isDark ? "text-[#fffdf8]" : "text-[#1c1a17]"
            }`}
          >
            {dayNum}
          </span>
          <span
            className={`font-tabular text-[10px] sm:mt-1 ${
              isDark ? "text-[#f6f2e9]/65" : "text-[#6b6458]"
            }`}
          >
            民{rocYear}/{monthStr}/{dayStr}
          </span>
        </div>

        <span
          className={`rounded-md px-2 py-1 font-tabular text-xs font-semibold tracking-tight sm:mt-2.5 ${
            isDark
              ? "bg-[#e9b949] text-[#152d24]"
              : "bg-[#1c1a17] text-[#f6f2e9]"
          }`}
        >
          {hearing.time}
        </span>
      </div>

      {/* Right Event Body */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
        <div className="space-y-1.5">
          {/* Eyebrow: Court + Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {hearing.isLayJudge && (
                <span
                  className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-bold ${
                    isDark
                      ? "bg-[#e9b949]/20 text-[#f7d47c] ring-1 ring-[#e9b949]/40"
                      : "bg-[#c78a1f]/15 text-[#8a5a08] ring-1 ring-[#c78a1f]/30"
                  }`}
                >
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  國民法官
                </span>
              )}
              <span
                className={`rounded-sm px-1.5 py-0.5 text-[11px] font-semibold ${
                  isDark
                    ? "bg-[#f6f2e9]/12 text-[#f6f2e9]"
                    : hearing.category === "trial"
                      ? "bg-[#1f4b3b]/12 text-[#1f4b3b]"
                      : "bg-[#1c1a17]/8 text-[#5c564c]"
                }`}
              >
                {hearing.dukd}
              </span>
              <span
                className={`text-[11px] font-medium ${
                  isDark ? "text-[#f6f2e9]/65" : "text-[#6b6458]"
                }`}
              >
                {hearing.sysLabel}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSave}
              aria-label={saved ? "取消收藏" : "收藏這場庭"}
              className={`rounded-md p-1.5 transition-colors ${
                saved
                  ? isDark
                    ? "bg-[#e9b949] text-[#152d24]"
                    : "bg-[#1f4b3b] text-white"
                  : isDark
                    ? "text-[#f6f2e9]/60 hover:bg-[#f6f2e9]/10 hover:text-white"
                    : "text-[#6b6458] hover:bg-[#1c1a17]/6 hover:text-[#1c1a17]"
              }`}
            >
              {saved ? (
                <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Bookmark className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Main Event Title */}
          <Link
            href={`/hearings/${hearing.id}`}
            className={`block no-underline ${
              isDark
                ? "text-[#fffdf8] group-hover:text-[#f7d47c]"
                : "text-[#1c1a17] group-hover:text-[#1f4b3b]"
            }`}
          >
            <h3 className="font-editorial text-lg leading-snug font-bold">
              {hearing.reason || `${hearing.sysLabel}${hearing.dukd}`}
            </h3>
          </Link>

          {/* Case number & courtroom */}
          <p
            className={`font-tabular text-xs ${
              isDark ? "text-[#f6f2e9]/70" : "text-[#6b6458]"
            }`}
          >
            {hearing.caseNo}
            {hearing.division ? ` · ${hearing.division}股` : ""}
          </p>

          <p
            className={`flex items-center gap-1.5 pt-0.5 text-xs ${
              isDark ? "text-[#f6f2e9]/85" : "text-[#4a453c]"
            }`}
          >
            <MapPin
              className={`h-3.5 w-3.5 shrink-0 ${
                isDark ? "text-[#e9b949]" : "text-[#b85432]"
              }`}
              aria-hidden="true"
            />
            <span className="truncate">
              {showCourt ? `${hearing.courtShortName} · ` : ""}
              <strong className="font-semibold">{hearing.courtroom}</strong>
            </span>
          </p>
        </div>

        {/* Bottom tactile action bar */}
        <div
          className={`mt-3.5 flex items-center justify-between gap-2 border-t pt-2.5 text-xs ${
            isDark ? "border-[#f6f2e9]/12" : "border-[#1c1a17]/10"
          }`}
        >
          <button
            type="button"
            onClick={handleDownloadIcs}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors ${
              isDark
                ? "bg-[#f6f2e9]/10 text-[#f6f2e9] hover:bg-[#e9b949] hover:text-[#152d24]"
                : "bg-[#f1eadc] text-[#1c1a17] hover:bg-[#1f4b3b] hover:text-white"
            }`}
          >
            <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>加入行事曆</span>
          </button>

          <Link
            href={`/hearings/${hearing.id}`}
            className={`inline-flex items-center gap-0.5 font-semibold no-underline ${
              isDark
                ? "text-[#f7d47c] hover:text-white"
                : "text-[#1f4b3b] hover:text-[#b85432]"
            }`}
          >
            <span>查看詳情與交通</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
