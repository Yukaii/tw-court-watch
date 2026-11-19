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
    const arr: Array<{ iso: string; count: number; weekday: string; day: number; month: number }> = [];
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

  const firstActiveDay =
    days.find((d) => d.count > 0)?.iso ?? today;

  const [selectedDate, setSelectedDate] = useState(firstActiveDay);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [courtCache, setCourtCache] = useState<Record<string, Hearing[]>>({});
  const loadingRef = useRef<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch specific court JSON on demand when selecting a specific court tab
  useEffect(() => {
    if (activeTab === "ALL") return;
    if (courtCache[activeTab]) return;
    if (loadingRef.current.has(activeTab)) return;

    let cancelled = false;
    loadingRef.current.add(activeTab);
    setLoading(true);

    fetch(`/data/hearings/by-court/${activeTab}.json`)
      .then((res) => (res.ok ? (res.json() as Promise<CourtHearingsFile>) : null))
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
      // Fallback: also include lay-judge hearings on that date if any
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
    // Prioritize trial/debate hearings with human-readable reasons
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
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#1c1a17]/15 pb-3">
        <div>
          <p className="font-tabular text-[11px] font-semibold uppercase tracking-widest text-[#b85432]">
            14-DAY COURT SCHEDULE
          </p>
          <h2 className="mt-0.5 font-editorial text-2xl font-bold text-[#1c1a17] sm:text-3xl">
            翻開這兩週的公開開庭日曆
          </h2>
        </div>
        <Link
          href={searchHref}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#1f4b3b] hover:text-[#b85432]"
        >
          <span>進階篩選全部庭期</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* 14-day horizontal calendar strip */}
      <div
        role="tablist"
        aria-label="選擇未來 14 天開庭日期"
        className="no-scrollbar flex gap-2 overflow-x-auto pb-1"
      >
        {days.map((d) => {
          const active = d.iso === selectedDate;
          const isQuiet = d.count === 0;
          return (
            <button
              key={d.iso}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedDate(d.iso)}
              className={`flex w-[74px] shrink-0 flex-col items-center rounded-xl border px-2 py-2.5 text-center transition-all ${
                active
                  ? "border-[#1f4b3b] bg-[#1f4b3b] text-[#f6f2e9] shadow-sm"
                  : isQuiet
                    ? "border-[#1c1a17]/10 bg-[#efe9dc]/60 text-[#928a7c] hover:border-[#1c1a17]/25"
                    : "border-[#1c1a17]/15 bg-[#fffdf8] text-[#1c1a17] hover:border-[#1f4b3b]/50"
              }`}
            >
              <span
                className={`text-[10px] font-semibold ${
                  active ? "text-[#e9b949]" : "text-[#6b6458]"
                }`}
              >
                {d.iso === today ? "今天" : `${d.month}月 週${d.weekday}`}
              </span>
              <span className="mt-0.5 font-editorial text-2xl leading-none font-bold">
                {d.day}
              </span>
              <span
                className={`mt-1.5 font-tabular text-[10px] ${
                  active
                    ? "text-[#f6f2e9]/85"
                    : isQuiet
                      ? "text-[#a49c8f]"
                      : "text-[#1f4b3b]"
                }`}
              >
                {isQuiet ? "休庭" : `${d.count} 場`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Court filter strip */}
      <div className="flex flex-wrap items-center gap-1.5">
        {QUICK_TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "border-[#1c1a17] bg-[#1c1a17] text-[#f6f2e9]"
                  : "border-[#1c1a17]/15 bg-[#fffdf8] text-[#5c564c] hover:border-[#1c1a17]/40 hover:text-[#1c1a17]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Calendar Event Cards Grid */}
      {loading && visibleHearings.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-[#1c1a17]/12 bg-[#fffdf8] py-12 text-sm text-[#5c564c]">
          <Loader2 className="h-4 w-4 animate-spin text-[#1f4b3b]" aria-hidden="true" />
          載入該法院庭期票卡中…
        </div>
      ) : visibleHearings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#1c1a17]/20 bg-[#fffdf8] px-6 py-10 text-center">
          <Calendar
            className="mx-auto h-6 w-6 text-[#8c8477]"
            aria-hidden="true"
          />
          <p className="mt-2 font-editorial text-lg font-bold text-[#1c1a17]">
            這一天目前沒有精選公開開庭
          </p>
          <p className="mt-1 text-sm text-[#6b6458]">
            週末與國定假日法院通常休庭；你也可以點上方其他平日日期，或切換特定法院查看完整列表。
          </p>
          <Link
            href={searchHref}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#1f4b3b] px-4 py-2 text-xs font-semibold text-[#f6f2e9] hover:bg-[#16362b]"
          >
            前往完整找庭頁查看
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
