"use client";

import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCompactDualDate } from "@/lib/date";
import { isHearingSaved, toggleSaveHearing } from "@/lib/storage";
import type { Hearing } from "@/lib/types";

interface HearingCardProps {
  hearing: Hearing;
  showCourt?: boolean;
}

function getCategoryBadgeClass(category: Hearing["category"]): string {
  switch (category) {
    case "trial":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "prep":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "verdict":
      return "border-stone-200 bg-stone-100 text-stone-600";
    default:
      return "border-stone-200 bg-stone-50 text-stone-700";
  }
}

export function HearingCard({ hearing, showCourt = true }: HearingCardProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(isHearingSaved(hearing.id));
    sync();
    window.addEventListener("tw-court-watch-storage", sync);
    return () => window.removeEventListener("tw-court-watch-storage", sync);
  }, [hearing.id]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleSaveHearing(hearing);
    setSaved(next);
  };

  return (
    <article className="group rounded-xl border border-stone-200 bg-white p-4 shadow-2xs transition-colors hover:border-emerald-700/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Date & Time row */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-stone-600">
            <span className="inline-flex items-center gap-1 text-stone-800">
              <Calendar className="h-3.5 w-3.5 text-emerald-800" aria-hidden="true" />
              {formatCompactDualDate(hearing.date)}
            </span>
            <span className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-stone-900">
              {hearing.time}
            </span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {hearing.isLayJudge && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-900">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                國民法官
              </span>
            )}
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getCategoryBadgeClass(hearing.category)}`}
            >
              {hearing.dukd}
              {hearing.category === "trial" ? " · 新手推" : ""}
              {hearing.category === "verdict" ? " · 約1分鐘" : ""}
            </span>
            <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-xs text-stone-700">
              {hearing.sysLabel}
            </span>
          </div>

          {/* Title / Reason */}
          <Link
            href={`/hearings/${hearing.id}`}
            className="block pt-0.5 text-stone-900 no-underline group-hover:text-emerald-900"
          >
            <h3 className="text-base font-semibold leading-snug">
              {hearing.reason || `${hearing.sysLabel}${hearing.dukd}`}
            </h3>
            <p className="mt-0.5 text-sm text-stone-600">
              {hearing.caseNo}
              {hearing.division ? ` · ${hearing.division}股` : ""}
            </p>
          </Link>

          {/* Court & courtroom */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-xs text-stone-500">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden="true" />
              {showCourt ? `${hearing.courtShortName} · ` : ""}
              <strong className="font-medium text-stone-700">
                {hearing.courtroom}
              </strong>
            </span>
            {hearing.campusName !== hearing.courtName && (
              <span className="text-stone-400">({hearing.campusName})</span>
            )}
          </div>
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleToggleSave}
          aria-label={saved ? "取消收藏此庭期" : "收藏此庭期"}
          className={`inline-flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors ${
            saved
              ? "border-emerald-700 bg-emerald-800 text-white"
              : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300 hover:bg-stone-100"
          }`}
        >
          {saved ? (
            <>
              <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
              <span>已收藏</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" aria-hidden="true" />
              <span>收藏</span>
            </>
          )}
        </button>
      </div>

      {/* Footer actions */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-2.5 text-xs">
        <Link
          href={`/hearings/${hearing.id}`}
          className="font-semibold text-emerald-800 hover:text-emerald-950"
        >
          查看詳情與交通 →
        </Link>
        <a
          href={hearing.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800"
        >
          <span>到司法院確認</span>
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}
