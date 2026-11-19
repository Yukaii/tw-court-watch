"use client";

import { ArrowRight, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { addDaysIso, getWeekdayZh } from "@/lib/date";
import { hydrateHearing } from "@/lib/hydrate";
import type {
  CourtHearingsFile,
  Hearing,
  HearingsMeta,
  HighlightsData,
} from "@/lib/types";
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
    if (activeTab === "ALL") {
      const dayMatches = highlights.featuredTrials.filter(
        (h) => h.date === selectedDate,
      );
      if (dayMatches.length > 0) return dayMatches.slice(0, 6);
      const ljMatches = highlights.layJudgeHearings.filter(
        (h) => h.date === selectedDate,
      );
      return ljMatches.slice(0, 6);
    }

    const courtData = courtCache[activeTab];
    if (!courtData) {
      return highlights.featuredTrials
        .filter((h) => h.crtid === activeTab && h.date === selectedDate)
        .slice(0, 6);
    }

    const onDay = courtData.filter((h) => h.date === selectedDate);
    const sorted = [...onDay].sort((a, b) => {
      const score = (h: Hearing) =>
        (h.isLayJudge ? 4 : 0) +
        (h.category === "trial" ? 2 : 0) +
        (h.reason ? 1 : 0);
      const diff = score(b) - score(a);
      return diff !== 0 ? diff : a.time.localeCompare(b.time);
    });
    return sorted.slice(0, 6);
  }, [activeTab, selectedDate, highlights, courtCache]);

  const searchHref =
    activeTab === "ALL"
      ? `/search?court=TPD&start=${selectedDate}&end=${selectedDate}&category=trial`
      : `/search?court=${activeTab}&start=${selectedDate}&end=${selectedDate}`;

  return (
    <section className="space-y-5">
      <div className="legal-rule-bottom flex flex-wrap items-end justify-between gap-3 pb-3">
        <div>
          <p className="text-xs font-medium tracking-[0.08em] text-[#8f2d1c]">
            壹、未來十四日開庭日曆
          </p>
          <h2 className="mt-1 font-editorial text-2xl font-semibold text-[#191816] sm:text-[28px]">
            按日期與法院檢視公開開庭
          </h2>
        </div>
        <Link
          href={searchHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-[#1b382f] underline decoration-[#1b382f]/40 underline-offset-4 hover:text-[#191816]"
        >
          <span>進階條件檢索</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Architectural 14-day connected date ledger */}
      <div
        role="tablist"
        aria-label="選擇未來 14 天開庭日期"
        className="no-scrollbar flex overflow-x-auto border border-[#191816]/25 bg-[#fcfbf8]"
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
              className={`flex w-[78px] shrink-0 flex-col items-center px-2 py-2.5 text-center transition-colors ${
                idx > 0 ? "border-l border-[#d6d0c4]" : ""
              } ${
                active
                  ? "bg-[#1b382f] text-[#fcfbf8]"
                  : isQuiet
                    ? "bg-[#efece4]/70 text-[#8a8478] hover:bg-[#efece4]"
                    : "bg-[#fcfbf8] text-[#191816] hover:bg-[#f2efe8]"
              }`}
            >
              <span
                className={`text-[10px] font-medium tracking-[0.04em] ${
                  active ? "text-[#d4b06a]" : "text-[#706b62]"
                }`}
              >
                {d.iso === today ? "今日" : `${d.month}月 週${d.weekday}`}
              </span>
              <span className="mt-0.5 font-editorial text-2xl leading-none font-semibold">
                {d.day}
              </span>
              <span
                className={`mt-1.5 font-tabular text-[10px] ${
                  active
                    ? "text-[#fcfbf8]/85"
                    : isQuiet
                      ? "text-[#9a9387]"
                      : "text-[#1b382f]"
                }`}
              >
                {isQuiet ? "休庭" : `${d.count} 場`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Formal structural tab bar for courts */}
      <div className="flex flex-wrap items-center border-b border-[#d6d0c4]">
        {QUICK_TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px border-b-2 px-3.5 py-2 text-xs tracking-[0.04em] transition-colors ${
                active
                  ? "border-[#191816] font-semibold text-[#191816]"
                  : "border-transparent font-normal text-[#524e47] hover:border-[#d6d0c4] hover:text-[#191816]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Calendar Event Cards Grid */}
      {loading && visibleHearings.length === 0 ? (
        <div className="flex items-center justify-center gap-2 border border-[#d6d0c4] bg-[#fcfbf8] py-12 text-sm text-[#524e47]">
          <Loader2
            className="h-4 w-4 animate-spin text-[#1b382f]"
            aria-hidden="true"
          />
          <span>載入該法院庭期資料中…</span>
        </div>
      ) : visibleHearings.length === 0 ? (
        <div className="border border-dashed border-[#191816]/25 bg-[#fcfbf8] px-6 py-10 text-center">
          <Calendar
            className="mx-auto h-5 w-5 text-[#706b62]"
            aria-hidden="true"
          />
          <p className="mt-2 font-editorial text-lg font-semibold text-[#191816]">
            此日期目前無精選公開開庭
          </p>
          <p className="mt-1 text-sm text-[#524e47]">
            週末與國定假日法院通常休庭；請改選其他平日日期，或切換特定法院查閱完整名冊。
          </p>
          <Link href={searchHref} className="btn-formal-primary mt-4">
            <span>前往完整檢索頁</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-3.5 md:grid-cols-2">
          {visibleHearings.map((hearing) => (
            <CalendarEventCard
              key={hearing.id}
              hearing={hearing}
              showCourt={activeTab === "ALL"}
            />
          ))}
        </div>
      )}
    </section>
  );
}
