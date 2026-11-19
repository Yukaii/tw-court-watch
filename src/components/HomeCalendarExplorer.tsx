"use client";

import { ArrowRight, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  addDaysIso,
  getHearingLiveStatus,
  getHearingLiveStatusRank,
  getTaipeiTodayIso,
  getWeekdayZh,
} from "@/lib/date";
import { hydrateHearing } from "@/lib/hydrate";
import type {
  CourtHearingsFile,
  Hearing,
  HearingsMeta,
  HighlightsData,
} from "@/lib/types";
import { useNowMs } from "@/lib/use-now";
import { CalendarEventCard } from "./CalendarEventCard";

const QUICK_TABS = [
  { id: "ALL", label: "全台精選" },
  { id: "TPD", label: "臺北地院" },
  { id: "PCD", label: "新北地院" },
  { id: "SLD", label: "士林地院" },
  { id: "TPH", label: "臺灣高院" },
  { id: "TCD", label: "臺中地院" },
  { id: "TND", label: "臺南地院" },
  { id: "KSD", label: "高雄地院" },
] as const;

interface HomeCalendarExplorerProps {
  meta: HearingsMeta;
  highlights: HighlightsData;
}

export function HomeCalendarExplorer({
  meta,
  highlights,
}: HomeCalendarExplorerProps) {
  const today = meta.todayDate;
  const nowMs = useNowMs();
  const liveTodayIso = nowMs !== null ? getTaipeiTodayIso(new Date(nowMs)) : today;

  const days = useMemo(() => {
    const arr: Array<{
      iso: string;
      count: number;
      weekday: string;
      day: number;
      month: number;
    }> = [];
    for (let i = 0; i < 14; i++) {
      const iso = addDaysIso(today, i);
      const [, mStr, dStr] = iso.split("-");
      arr.push({
        iso,
        count: meta.countsByDate[iso] ?? 0,
        weekday: getWeekdayZh(iso),
        day: Number.parseInt(dStr, 10),
        month: Number.parseInt(mStr, 10),
      });
    }
    return arr;
  }, [today, meta.countsByDate]);

  const firstActiveDay = days.find((d) => d.count > 0)?.iso ?? today;

  const [selectedDate, setSelectedDate] = useState(firstActiveDay);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [courtCache, setCourtCache] = useState<Record<string, Hearing[]>>({});
  const loadingRef = useRef<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "ALL") return;
    if (courtCache[activeTab]) return;
    if (loadingRef.current.has(activeTab)) return;

    let cancelled = false;
    loadingRef.current.add(activeTab);
    setLoading(true);

    fetch(`/data/hearings/by-court/${activeTab}.json`)
      .then((res) =>
        res.ok ? (res.json() as Promise<CourtHearingsFile>) : null,
      )
      .then((file) => {
        if (cancelled || !file) return;
        const hydrated = file.rows.map((row) =>
          hydrateHearing(file.crtid, row),
        );
        setCourtCache((prev) => ({ ...prev, [activeTab]: hydrated }));
      })
      .finally(() => {
        loadingRef.current.delete(activeTab);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, courtCache]);

  const visibleHearings = useMemo(() => {
    const prioritizeByLiveTime = (list: Hearing[]): Hearing[] => {
      if (nowMs === null) return list;
      return [...list].sort((a, b) => {
        const ra = getHearingLiveStatusRank(getHearingLiveStatus(a, nowMs).kind);
        const rb = getHearingLiveStatusRank(getHearingLiveStatus(b, nowMs).kind);
        return ra - rb;
      });
    };

    if (activeTab === "ALL") {
      const dayMatches = highlights.featuredTrials.filter(
        (h) => h.date === selectedDate,
      );
      if (dayMatches.length > 0) {
        return prioritizeByLiveTime(dayMatches).slice(0, 4);
      }
      const ljMatches = highlights.layJudgeHearings.filter(
        (h) => h.date === selectedDate,
      );
      return prioritizeByLiveTime(ljMatches).slice(0, 4);
    }

    const courtData = courtCache[activeTab];
    if (!courtData) {
      const fallback = highlights.featuredTrials.filter(
        (h) => h.crtid === activeTab && h.date === selectedDate,
      );
      return prioritizeByLiveTime(fallback).slice(0, 4);
    }

    const onDay = courtData.filter((h) => h.date === selectedDate);
    const sorted = [...onDay].sort((a, b) => {
      if (nowMs !== null) {
        const ra = getHearingLiveStatusRank(getHearingLiveStatus(a, nowMs).kind);
        const rb = getHearingLiveStatusRank(getHearingLiveStatus(b, nowMs).kind);
        if (ra !== rb) return ra - rb;
      }
      const score = (h: Hearing) =>
        (h.isLayJudge ? 4 : 0) +
        (h.category === "trial" ? 2 : 0) +
        (h.reason ? 1 : 0);
      const diff = score(b) - score(a);
      return diff !== 0 ? diff : a.time.localeCompare(b.time);
    });
    return sorted.slice(0, 4);
  }, [activeTab, selectedDate, highlights, courtCache, nowMs]);

  const searchHref =
    activeTab === "ALL"
      ? `/search?court=TPD&start=${selectedDate}&end=${selectedDate}&category=trial`
      : `/search?court=${activeTab}&start=${selectedDate}&end=${selectedDate}`;

  return (
    <section className="space-y-6">
      <div className="legal-rule-bottom flex flex-wrap items-end justify-between gap-3 pb-3.5">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-[var(--ink)] sm:text-[28px]">
            未來兩週開庭日曆
          </h2>
          <p className="mt-1 text-[15px] text-[var(--ink-secondary)]">
            點選日期與法院，優先顯示適合旁聽的審理與言詞辯論庭。
          </p>
        </div>
        <Link
          href={searchHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--ink)] underline decoration-[var(--border-medium)] underline-offset-4 hover:text-[var(--robe-text)]"
        >
          <span>查看全部 38 所法院</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* 14-day connected date ledger — Larger cells, calm 2-ink colors */}
      <div
        role="tablist"
        aria-label="選擇未來 14 天開庭日期"
        className="no-scrollbar flex overflow-x-auto border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
      >
        {days.map((d, idx) => {
          const active = d.iso === selectedDate;
          const isQuiet = d.count === 0;
          return (
            <button
              key={d.iso}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedDate(d.iso)}
              className={`flex w-[86px] shrink-0 flex-col items-center px-2.5 py-3 text-center transition-colors ${
                idx > 0 ? "border-l border-[var(--rule)]" : ""
              } ${
                active
                  ? "bg-[var(--robe)] text-[#fcfbf8]"
                  : isQuiet
                    ? "bg-[#efece4]/70 text-[var(--ink-faint)] hover:bg-[var(--bg-tint)] dark:bg-[#23211e]/75"
                    : "bg-[var(--bg-surface)] text-[var(--ink)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <span
                className={`text-xs ${
                  active ? "text-[#fcfbf8]/80" : "text-[var(--ink-secondary)]"
                }`}
              >
                {d.iso === liveTodayIso ? "今天" : `${d.month}月 週${d.weekday}`}
              </span>
              <span className="mt-1 font-editorial text-[26px] leading-none font-semibold">
                {d.day}
              </span>
              <span
                className={`mt-1.5 font-tabular text-xs ${
                  active
                    ? "text-[#fcfbf8]/85"
                    : isQuiet
                      ? "text-[var(--ink-faint)]"
                      : "text-[var(--ink-secondary)]"
                }`}
              >
                {isQuiet ? "休庭" : `${d.count} 場`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Court tabs — Larger, clearer 14px tabs */}
      <div className="flex flex-wrap items-center border-b border-[var(--rule)]">
        {QUICK_TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors ${
                active
                  ? "border-[var(--ink)] font-semibold text-[var(--ink)]"
                  : "border-transparent font-normal text-[var(--ink-secondary)] hover:border-[var(--rule)] hover:text-[var(--ink)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Generous 2x2 Calendar Event Cards Grid */}
      {loading && visibleHearings.length === 0 ? (
        <div className="flex items-center justify-center gap-2 border border-[var(--rule)] bg-[var(--bg-surface)] py-14 text-sm text-[var(--ink-secondary)]">
          <Loader2
            className="h-4 w-4 animate-spin text-[var(--robe-text)]"
            aria-hidden="true"
          />
          <span>載入庭期資料中…</span>
        </div>
      ) : visibleHearings.length === 0 ? (
        <div className="border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-12 text-center">
          <Calendar
            className="mx-auto h-5 w-5 text-[var(--ink-secondary)]"
            aria-hidden="true"
          />
          <p className="mt-2.5 font-editorial text-xl font-semibold text-[var(--ink)]">
            這一天目前沒有公開開庭
          </p>
          <p className="mt-1.5 text-sm text-[var(--ink-secondary)]">
            週末與國定假日法院通常休庭，請改選其他平日日期查看。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-5 md:grid-cols-2">
            {visibleHearings.map((hearing) => (
              <CalendarEventCard
                key={hearing.id}
                hearing={hearing}
                showCourt={activeTab === "ALL"}
                nowMs={nowMs}
              />
            ))}
          </div>
          <div className="flex justify-end">
            <Link
              href={searchHref}
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--ink)] underline decoration-[var(--border-medium)] underline-offset-4 hover:text-[var(--robe-text)]"
            >
              <span>查看這一天更多場次</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
