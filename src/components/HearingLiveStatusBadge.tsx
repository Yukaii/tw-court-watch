"use client";

import { getHearingLiveStatus } from "@/lib/date";
import { useNowMs } from "@/lib/use-now";
import type { HearingCategory } from "@/lib/types";

interface HearingLiveStatusBadgeProps {
  date: string;
  time: string;
  category: HearingCategory;
  isLayJudge?: boolean;
  variant?: "paper" | "dark";
  /** Optional externally provided nowMs to avoid redundant timers in lists */
  nowMs?: number | null;
}

export function HearingLiveStatusBadge({
  date,
  time,
  category,
  isLayJudge = false,
  variant = "paper",
  nowMs: externalNowMs,
}: HearingLiveStatusBadgeProps) {
  const internalNowMs = useNowMs(60_000, externalNowMs === undefined);
  const nowMs = externalNowMs !== undefined ? externalNowMs : internalNowMs;

  if (nowMs === null) return null;

  const status = getHearingLiveStatus(
    { date, time, category, isLayJudge },
    nowMs,
  );
  if (status.kind === "upcoming" || !status.label) return null;

  const isDark = variant === "dark";

  if (status.kind === "in_progress") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 border px-1.5 py-0.5 text-xs font-medium ${
          isDark
            ? "border-[#d4b06a] bg-[#d4b06a]/15 text-[#e7ca8b]"
            : "border-[var(--robe)] bg-[var(--robe)] text-[#fcfbf8]"
        }`}
      >
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full motion-safe:animate-pulse ${
            isDark ? "bg-[#e7ca8b]" : "bg-[#fcfbf8]"
          }`}
        />
        <span>{status.label}</span>
      </span>
    );
  }

  if (status.kind === "soon") {
    return (
      <span
        className={`inline-flex items-center border px-1.5 py-0.5 text-xs font-medium ${
          isDark
            ? "border-[#fcfbf8]/45 text-[#fcfbf8]"
            : "border-[var(--border-medium)] bg-[var(--bg-tint)] text-[var(--ink)]"
        }`}
      >
        {status.label}
      </span>
    );
  }

  // status.kind === "ended"
  return (
    <span
      className={`text-xs ${
        isDark ? "text-[#fcfbf8]/50" : "text-[var(--ink-muted)]"
      }`}
    >
      {status.label}
    </span>
  );
}
