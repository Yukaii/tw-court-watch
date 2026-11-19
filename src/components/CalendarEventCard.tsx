"use client";

import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  CalendarPlus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getHearingLiveStatus, getWeekdayZh } from "@/lib/date";
import { generateHearingIcs } from "@/lib/ics";
import {
  downloadTextFile,
  isHearingSaved,
  toggleSaveHearing,
} from "@/lib/storage";
import type { Hearing } from "@/lib/types";
import { useNowMs } from "@/lib/use-now";
import { HearingLiveStatusBadge } from "./HearingLiveStatusBadge";

interface CalendarEventCardProps {
  hearing: Hearing;
  variant?: "paper" | "dark";
  showCourt?: boolean;
  /** Optional externally shared clock (UTC ms) to avoid per-card timers in lists */
  nowMs?: number | null;
}

export function CalendarEventCard({
  hearing,
  variant = "paper",
  showCourt = true,
  nowMs: externalNowMs,
}: CalendarEventCardProps) {
  const [saved, setSaved] = useState(false);
  const internalNowMs = useNowMs(60_000, externalNowMs === undefined);
  const resolvedNowMs =
    externalNowMs !== undefined ? externalNowMs : internalNowMs;

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
  const isEnded =
    resolvedNowMs !== null &&
    getHearingLiveStatus(hearing, resolvedNowMs).kind === "ended";

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
      className={`group relative flex flex-col overflow-hidden rounded-[2px] border transition-[border-color,opacity] sm:flex-row ${
        isDark
          ? "border-[#fcfbf8]/22 bg-[#1c322b] text-[#fcfbf8] hover:border-[#fcfbf8]/55"
          : "border-[#191816]/20 bg-[#fcfbf8] text-[#191816] hover:border-[#191816]/60"
      } ${isEnded ? "opacity-70 hover:opacity-100" : ""}`}
    >
      {/* Left Calendar Date Spine — Priority 1: When */}
      <div
        className={`flex shrink-0 items-center justify-between border-b border-dashed px-5 py-4 sm:w-[118px] sm:flex-col sm:justify-center sm:border-b-0 sm:border-r sm:px-3.5 sm:py-5 ${
          isDark
            ? "border-[#fcfbf8]/25 bg-[#13241e]"
            : "border-[#191816]/20 bg-[#efece4]"
        }`}
      >
        <div className="flex items-baseline gap-2.5 sm:flex-col sm:items-center sm:gap-0">
          <span
            className={`text-xs font-medium ${
              isDark ? "text-[#fcfbf8]/70" : "text-[#5c574f]"
            }`}
          >
            {monthNum}月 週{weekday}
          </span>
          <span
            className={`font-editorial text-3xl leading-none font-semibold sm:mt-1.5 sm:text-[38px] ${
              isDark ? "text-[#fcfbf8]" : "text-[#191816]"
            }`}
          >
            {dayNum}
          </span>
          <span
            className={`font-tabular text-xs sm:mt-1.5 ${
              isDark ? "text-[#fcfbf8]/55" : "text-[#5c574f]"
            }`}
          >
            民{rocYear}/{monthStr}/{dayStr}
          </span>
        </div>

        <span
          className={`border px-2.5 py-0.5 font-tabular text-sm font-medium sm:mt-3 ${
            isDark
              ? "border-[#fcfbf8]/35 bg-[#1c322b] text-[#fcfbf8]"
              : "border-[#191816]/35 bg-[#fcfbf8] text-[#191816]"
          }`}
        >
          {hearing.time}
        </span>
      </div>

      {/* Right Event Body — Clean 3-tier hierarchy & restrained 2-ink palette */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          {/* Top quiet context line + bookmark */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <HearingLiveStatusBadge
                date={hearing.date}
                time={hearing.time}
                category={hearing.category}
                isLayJudge={hearing.isLayJudge}
                variant={variant}
                nowMs={resolvedNowMs}
              />
              {hearing.isLayJudge && (
                <span
                  className={`border px-1.5 py-0.5 font-medium ${
                    isDark
                      ? "border-[#d4b06a] text-[#e7ca8b]"
                      : "border-[#8f2d1c] text-[#8f2d1c]"
                  }`}
                >
                  國民法官
                </span>
              )}
              <span
                className={isDark ? "text-[#fcfbf8]/70" : "text-[#5c574f]"}
              >
                {hearing.dukd} · {hearing.sysLabel}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSave}
              aria-label={saved ? "取消收藏" : "收藏這場庭"}
              className={`border p-1.5 transition-colors ${
                saved
                  ? isDark
                    ? "border-[#fcfbf8] bg-[#fcfbf8] text-[#13241e]"
                    : "border-[#191816] bg-[#191816] text-[#fcfbf8]"
                  : isDark
                    ? "border-transparent text-[#fcfbf8]/60 hover:border-[#fcfbf8]/30 hover:text-[#fcfbf8]"
                    : "border-transparent text-[#5c574f] hover:border-[#191816]/25 hover:text-[#191816]"
              }`}
            >
              {saved ? (
                <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Bookmark className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Tier 1: What (Largest, Primary Ink) */}
          <Link
            href={`/hearings/${hearing.id}`}
            className={`mt-2 block no-underline ${
              isDark ? "text-[#fcfbf8]" : "text-[#191816]"
            }`}
          >
            <h3 className="font-editorial text-xl leading-snug font-semibold group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
              {hearing.reason || `${hearing.sysLabel}${hearing.dukd}`}
            </h3>
          </Link>

          {/* Tier 2: Where (Comfortable 14px, Primary Ink) */}
          <p
            className={`mt-2.5 truncate text-sm font-medium ${
              isDark ? "text-[#fcfbf8]/90" : "text-[#191816]"
            }`}
          >
            {showCourt ? `${hearing.courtShortName} · ` : ""}
            {hearing.courtroom}
          </p>

          {/* Tier 3: Reference metadata (Quiet 12px, Muted Ink) */}
          <p
            className={`mt-1 font-tabular text-xs ${
              isDark ? "text-[#fcfbf8]/60" : "text-[#5c574f]"
            }`}
          >
            {hearing.caseNo}
          </p>
        </div>

        {/* Clean Action Bar */}
        <div
          className={`mt-5 flex items-center justify-between gap-3 border-t pt-3.5 text-sm ${
            isDark ? "border-[#fcfbf8]/15" : "border-[#d6d0c4]"
          }`}
        >
          <button
            type="button"
            onClick={handleDownloadIcs}
            className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors ${
              isDark
                ? "border-[#fcfbf8]/30 text-[#fcfbf8] hover:bg-[#fcfbf8] hover:text-[#13241e]"
                : "border-[#191816]/25 bg-[#f7f5f0] text-[#191816] hover:border-[#1b382f] hover:bg-[#1b382f] hover:text-[#fcfbf8]"
            }`}
          >
            <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>加入行事曆</span>
          </button>

          <Link
            href={`/hearings/${hearing.id}`}
            className={`inline-flex items-center gap-0.5 text-xs font-medium underline underline-offset-4 ${
              isDark
                ? "text-[#fcfbf8]/85 decoration-[#fcfbf8]/40 hover:text-white"
                : "text-[#191816] decoration-[#191816]/35 hover:text-[#1b382f]"
            }`}
          >
            <span>詳情與交通</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
