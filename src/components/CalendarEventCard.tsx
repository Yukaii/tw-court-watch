"use client";

import {
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  CalendarPlus,
  MapPin,
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
      className={`group relative flex flex-col overflow-hidden rounded-[2px] border transition-colors sm:flex-row ${
        isDark
          ? "border-[#fcfbf8]/22 bg-[#1c322b] text-[#fcfbf8] hover:border-[#d4b06a]"
          : "border-[#191816]/20 bg-[#fcfbf8] text-[#191816] hover:border-[#191816]/65"
      }`}
    >
      {/* Left Date Spine (Formal Court Notice Stub) */}
      <div
        className={`relative flex shrink-0 items-center justify-between border-b border-dashed px-4 py-3 sm:w-[104px] sm:flex-col sm:justify-center sm:border-b-0 sm:border-r sm:px-3 sm:py-4 ${
          isDark
            ? "border-[#fcfbf8]/25 bg-[#13241e]"
            : hearing.isLayJudge
              ? "border-[#8f2d1c]/35 bg-[#f5efe6]"
              : "border-[#191816]/25 bg-[#efece4]"
        }`}
      >
        <div className="flex items-baseline gap-2 sm:flex-col sm:items-center sm:gap-0">
          <span
            className={`text-[11px] font-medium tracking-[0.04em] ${
              isDark
                ? "text-[#d4b06a]"
                : hearing.isLayJudge
                  ? "text-[#8f2d1c]"
                  : "text-[#524e47]"
            }`}
          >
            {monthNum}月 · 週{weekday}
          </span>
          <span
            className={`font-editorial text-3xl leading-none font-semibold sm:mt-1 sm:text-[34px] ${
              isDark ? "text-[#fcfbf8]" : "text-[#191816]"
            }`}
          >
            {dayNum}
          </span>
          <span
            className={`font-tabular text-[10px] sm:mt-1 ${
              isDark ? "text-[#fcfbf8]/60" : "text-[#706b62]"
            }`}
          >
            民{rocYear}/{monthStr}/{dayStr}
          </span>
        </div>

        <span
          className={`border px-2 py-0.5 font-tabular text-xs font-medium tracking-tight sm:mt-2.5 ${
            isDark
              ? "border-[#d4b06a] bg-[#d4b06a] text-[#13241e]"
              : "border-[#191816] bg-[#fcfbf8] text-[#191816]"
          }`}
        >
          {hearing.time}
        </span>
      </div>

      {/* Right Docket Body */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
        <div className="space-y-1.5">
          {/* Formal stamp row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {hearing.isLayJudge && (
                <span
                  className={`border px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] ${
                    isDark
                      ? "border-[#d4b06a] text-[#e7ca8b]"
                      : "border-[#8f2d1c] bg-[#8f2d1c]/6 text-[#8f2d1c]"
                  }`}
                >
                  國民法官
                </span>
              )}
              <span
                className={`border px-1.5 py-0.5 text-[10px] font-medium tracking-[0.04em] ${
                  isDark
                    ? "border-[#fcfbf8]/25 text-[#fcfbf8]/90"
                    : hearing.category === "trial"
                      ? "border-[#1b382f]/40 bg-[#1b382f]/6 text-[#1b382f]"
                      : "border-[#191816]/20 bg-[#f7f5f0] text-[#524e47]"
                }`}
              >
                {hearing.dukd}
              </span>
              <span
                className={`text-[11px] ${
                  isDark ? "text-[#fcfbf8]/65" : "text-[#706b62]"
                }`}
              >
                {hearing.sysLabel}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSave}
              aria-label={saved ? "取消收藏" : "收藏這場庭"}
              className={`border p-1 transition-colors ${
                saved
                  ? isDark
                    ? "border-[#d4b06a] bg-[#d4b06a] text-[#13241e]"
                    : "border-[#1b382f] bg-[#1b382f] text-[#fcfbf8]"
                  : isDark
                    ? "border-[#fcfbf8]/20 text-[#fcfbf8]/65 hover:border-[#fcfbf8]/50 hover:text-white"
                    : "border-transparent text-[#706b62] hover:border-[#191816]/25 hover:text-[#191816]"
              }`}
            >
              {saved ? (
                <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Main Case Title */}
          <Link
            href={`/hearings/${hearing.id}`}
            className={`block no-underline ${
              isDark
                ? "text-[#fcfbf8] group-hover:text-[#e7ca8b]"
                : "text-[#191816] group-hover:text-[#1b382f]"
            }`}
          >
            <h3 className="font-editorial text-[17px] leading-snug font-semibold">
              {hearing.reason || `${hearing.sysLabel}${hearing.dukd}`}
            </h3>
          </Link>

          {/* Case number & division */}
          <p
            className={`font-tabular text-xs ${
              isDark ? "text-[#fcfbf8]/70" : "text-[#706b62]"
            }`}
          >
            {hearing.caseNo}
            {hearing.division ? ` · ${hearing.division}股` : ""}
          </p>

          {/* Courtroom */}
          <p
            className={`flex items-center gap-1.5 pt-0.5 text-xs ${
              isDark ? "text-[#fcfbf8]/85" : "text-[#524e47]"
            }`}
          >
            <MapPin
              className={`h-3.5 w-3.5 shrink-0 ${
                isDark ? "text-[#d4b06a]" : "text-[#8f2d1c]"
              }`}
              aria-hidden="true"
            />
            <span className="truncate">
              {showCourt ? `${hearing.courtShortName} · ` : ""}
              <strong className="font-medium text-current">
                {hearing.courtroom}
              </strong>
            </span>
          </p>
        </div>

        {/* Structural footer action bar */}
        <div
          className={`mt-3.5 flex items-center justify-between gap-2 border-t pt-2.5 text-xs ${
            isDark ? "border-[#fcfbf8]/15" : "border-[#d6d0c4]"
          }`}
        >
          <button
            type="button"
            onClick={handleDownloadIcs}
            className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-medium transition-colors ${
              isDark
                ? "border-[#fcfbf8]/25 text-[#fcfbf8]/90 hover:border-[#d4b06a] hover:bg-[#d4b06a] hover:text-[#13241e]"
                : "border-[#191816]/25 bg-[#f7f5f0] text-[#191816] hover:border-[#1b382f] hover:bg-[#1b382f] hover:text-[#fcfbf8]"
            }`}
          >
            <CalendarPlus className="h-3 w-3" aria-hidden="true" />
            <span>加入行事曆</span>
          </button>

          <Link
            href={`/hearings/${hearing.id}`}
            className={`inline-flex items-center gap-0.5 font-medium underline underline-offset-4 ${
              isDark
                ? "text-[#e7ca8b] decoration-[#e7ca8b]/40 hover:text-white"
                : "text-[#1b382f] decoration-[#1b382f]/40 hover:text-[#191816]"
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
