"use client";

import {
  CalendarPlus,
  ChevronDown,
  ExternalLink,
  Filter,
  HelpCircle,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  COURT_BY_ID,
  COURT_LEVEL_LABELS,
  MAJOR_COURTS,
  POPULAR_COURTS,
  getOfficialQueryUrl,
} from "@/lib/courts";
import {
  addDaysIso,
  formatCompactDualDate,
  getHearingLiveStatus,
  isoToRoc,
  parseUserDateInput,
} from "@/lib/date";
import { HEARING_CATEGORY_META, SYS_LABELS } from "@/lib/filter";
import { hydrateHearing } from "@/lib/hydrate";
import {
  DEFAULT_SITE_ORIGIN,
  buildCalendarFeedPath,
  buildGoogleCalendarSubscribeUrl,
} from "@/lib/ics";
import type {
  CourtHearingsFile,
  CourtLevel,
  Hearing,
  HearingCategory,
  HearingsMeta,
  HighlightsData,
  SysCode,
} from "@/lib/types";
import { useNowMs } from "@/lib/use-now";
import { HearingCard } from "./HearingCard";

const ALL_LEVELS: CourtLevel[] = ["district", "high", "admin_ip", "supreme"];
const ALL_SYS: SysCode[] = ["H", "V", "A", "B", "P", "D"];
const PAGE_STEP = 30;

interface SearchClientProps {
  meta: HearingsMeta;
  highlights: HighlightsData;
  initialCourtId: string;
  initialHearings: Hearing[];
}

export function SearchClient({
  meta,
  highlights,
  initialCourtId,
  initialHearings,
}: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nowMs = useNowMs();

  const today = meta.todayDate;
  const maxDate = meta.dateRange.end;

  const urlCourt = (searchParams.get("court") || initialCourtId || "TPD").toUpperCase();
  const urlMode = searchParams.get("mode"); // "layjudge" for island-wide lay judge
  const urlStart = searchParams.get("start") || today;
  const urlEnd = searchParams.get("end") || addDaysIso(today, 6);
  const urlCat = searchParams.get("category") as HearingCategory | "all" | null;
  const urlQuery = searchParams.get("q") || "";

  const [mode, setMode] = useState<"court" | "layjudge">(
    urlMode === "layjudge" ? "layjudge" : "court",
  );
  const [selectedCourt, setSelectedCourt] = useState<string>(
    COURT_BY_ID[urlCourt] ? urlCourt : "TPD",
  );
  const [courtPickerOpen, setCourtPickerOpen] = useState(false);
  const [courtSearch, setCourtSearch] = useState("");
  const [startDate, setStartDate] = useState(urlStart);
  const [endDate, setEndDate] = useState(urlEnd > maxDate ? maxDate : urlEnd);
  const [rocJump, setRocJump] = useState("");
  const [rocJumpError, setRocJumpError] = useState("");
  const [selectedSys, setSelectedSys] = useState<SysCode[]>([]);
  const [category, setCategory] = useState<HearingCategory | "all">(
    urlCat && ["trial", "prep", "verdict", "other"].includes(urlCat)
      ? urlCat
      : "all",
  );
  const [onlyLayJudge, setOnlyLayJudge] = useState(urlMode === "layjudge");
  const [courtroomFilter, setCourtroomFilter] = useState("");
  const [keyword, setKeyword] = useState(urlQuery);
  const [showNonPublicHelp, setShowNonPublicHelp] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_STEP);

  // Per-court client cache seeded with SSR initialHearings
  const cacheRef = useRef<Map<string, Hearing[]>>(
    new Map([[initialCourtId, initialHearings]]),
  );
  const [hearings, setHearings] = useState<Hearing[]>(
    urlMode === "layjudge" ? highlights.layJudgeHearings : initialHearings,
  );
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const courtCountMap = useMemo(
    () => Object.fromEntries(meta.courts.map((c) => [c.crtid, c])),
    [meta.courts],
  );

  // Fetch court data on demand when switching court
  useEffect(() => {
    if (mode === "layjudge") {
      setHearings(highlights.layJudgeHearings);
      setLoading(false);
      setLoadError("");
      return;
    }

    const cached = cacheRef.current.get(selectedCourt);
    if (cached) {
      setHearings(cached);
      setLoading(false);
      setLoadError("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError("");

    fetch(`/data/hearings/by-court/${selectedCourt}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<CourtHearingsFile>;
      })
      .then((data) => {
        if (cancelled) return;
        const hydrated = data.rows.map((row) =>
          hydrateHearing(data.crtid, row),
        );
        cacheRef.current.set(selectedCourt, hydrated);
        setHearings(hydrated);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError("暫時無法載入該法院資料，請稍後再試或直接前往司法院查詢。");
        setHearings([]);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, selectedCourt, highlights.layJudgeHearings]);

  // Reset pagination & courtroom filter when dataset changes
  useEffect(() => {
    setVisibleCount(PAGE_STEP);
    setCourtroomFilter("");
  }, [mode, selectedCourt]);

  // Sync key URL query params for shareable filters
  const updateUrl = (next: {
    mode?: "court" | "layjudge";
    court?: string;
    start?: string;
    end?: string;
    category?: HearingCategory | "all";
  }) => {
    const params = new URLSearchParams();
    const m = next.mode ?? mode;
    const c = next.court ?? selectedCourt;
    const s = next.start ?? startDate;
    const e = next.end ?? endDate;
    const cat = next.category ?? category;

    if (m === "layjudge") {
      params.set("mode", "layjudge");
    } else {
      params.set("court", c);
    }
    if (s) params.set("start", s);
    if (e) params.set("end", e);
    if (cat !== "all") params.set("category", cat);
    router.replace(`/search?${params.toString()}`, { scroll: false });
  };

  const currentCourtInfo = COURT_BY_ID[selectedCourt] ?? MAJOR_COURTS[0];

  const availableSys = useMemo<SysCode[]>(() => {
    if (mode === "layjudge") return ["H"];
    return currentCourtInfo.sysCodes;
  }, [mode, currentCourtInfo]);

  const availableCourtrooms = useMemo(() => {
    const set = new Set<string>();
    for (const h of hearings) {
      if (h.courtroom) set.add(h.courtroom);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "zh-Hant"));
  }, [hearings]);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    const activeSys = selectedSys.filter((s) => availableSys.includes(s));

    const matched = hearings.filter((h) => {
      if (startDate && h.date < startDate) return false;
      if (endDate && h.date > endDate) return false;
      if (activeSys.length > 0 && !activeSys.includes(h.sysCode)) return false;
      if (category !== "all" && h.category !== category) return false;
      if (onlyLayJudge && !h.isLayJudge) return false;
      if (courtroomFilter && h.courtroom !== courtroomFilter) return false;
      if (q) {
        const hay = [
          h.caseNo,
          h.crmid,
          h.crmnoRaw,
          String(h.rocYear),
          h.reason,
          h.courtroom,
          h.division ?? "",
          h.dukd,
          h.courtName,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (nowMs === null) return matched;

    const activeOrUpcoming: Hearing[] = [];
    const ended: Hearing[] = [];
    for (const h of matched) {
      if (getHearingLiveStatus(h, nowMs).kind === "ended") {
        ended.push(h);
      } else {
        activeOrUpcoming.push(h);
      }
    }
    return [...activeOrUpcoming, ...ended];
  }, [
    hearings,
    startDate,
    endDate,
    selectedSys,
    availableSys,
    category,
    onlyLayJudge,
    courtroomFilter,
    keyword,
    nowMs,
  ]);

  const inProgressCount = useMemo(() => {
    if (nowMs === null) return 0;
    let count = 0;
    for (const h of filtered) {
      if (getHearingLiveStatus(h, nowMs).kind === "in_progress") {
        count += 1;
      }
    }
    return count;
  }, [filtered, nowMs]);

  const filteredCourtsForPicker = useMemo(() => {
    const q = courtSearch.trim().toLowerCase();
    if (!q) return MAJOR_COURTS;
    return MAJOR_COURTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.crtid.toLowerCase().includes(q),
    );
  }, [courtSearch]);

  const applyQuickDate = (preset: "today" | "tomorrow" | "weekend" | "7d" | "14d") => {
    let nextStart = today;
    let nextEnd = today;

    if (preset === "tomorrow") {
      nextStart = addDaysIso(today, 1);
      nextEnd = nextStart;
    } else if (preset === "7d") {
      nextStart = today;
      nextEnd = addDaysIso(today, 6);
    } else if (preset === "14d") {
      nextStart = today;
      nextEnd = maxDate;
    } else if (preset === "weekend") {
      // Find upcoming Friday-Sunday window (Taiwan courts rarely sit on weekends; include Fri!)
      const dt = new Date(`${today}T00:00:00Z`);
      const day = dt.getUTCDay(); // 0=Sun..6=Sat
      const diffToFri = (5 - day + 7) % 7;
      nextStart = addDaysIso(today, diffToFri);
      nextEnd = addDaysIso(nextStart, 2);
    }

    if (nextEnd > maxDate) nextEnd = maxDate;
    setStartDate(nextStart);
    setEndDate(nextEnd);
    setVisibleCount(PAGE_STEP);
    updateUrl({ start: nextStart, end: nextEnd });
  };

  const handleRocJump = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseUserDateInput(rocJump);
    if (!parsed) {
      setRocJumpError("請輸入有效日期，如 2026-11-20 或民國 1151120");
      return;
    }
    setRocJumpError("");
    setStartDate(parsed);
    setEndDate(parsed);
    setRocJump("");
    updateUrl({ start: parsed, end: parsed });
  };

  const handleReset = () => {
    setMode("court");
    setSelectedCourt("TPD");
    setStartDate(today);
    setEndDate(addDaysIso(today, 6));
    setSelectedSys([]);
    setCategory("all");
    setOnlyLayJudge(false);
    setCourtroomFilter("");
    setKeyword("");
    setVisibleCount(PAGE_STEP);
    updateUrl({
      mode: "court",
      court: "TPD",
      start: today,
      end: addDaysIso(today, 6),
      category: "all",
    });
  };

  const toggleSys = (code: SysCode) => {
    setSelectedSys((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const officialConfirmUrl =
    mode === "layjudge"
      ? "https://csdi3.judicial.gov.tw/judbp/wkw/WHD1A03B.htm"
      : getOfficialQueryUrl(selectedCourt);

  const visibleHearings = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-5">
      {/* Filter card */}
      <section
        aria-label="庭期篩選條件"
        className="space-y-4 rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5"
      >
        {/* Mode / Popular courts shortcuts */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--ink)]">
              <Filter
                className="h-4 w-4 text-[var(--robe-text)]"
                aria-hidden="true"
              />
              選擇法院或專區
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink)]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              重設條件
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                setMode("layjudge");
                setOnlyLayJudge(true);
                setStartDate(today);
                setEndDate(maxDate);
                updateUrl({ mode: "layjudge", start: today, end: maxDate });
              }}
              className={`inline-flex items-center gap-1 rounded-[2px] border px-3 py-1.5 text-xs font-semibold transition-colors ${
                mode === "layjudge"
                  ? "border-[var(--seal)] bg-[var(--seal)] text-[#fcfbf8]"
                  : "border-[var(--seal-text)]/45 bg-[var(--bg-alert)] text-[var(--seal-text)] hover:border-[var(--seal-text)]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              全台國民法官（{meta.layJudgeCount}）
            </button>

            {POPULAR_COURTS.map((c) => {
              const active = mode === "court" && selectedCourt === c.crtid;
              const stats = courtCountMap[c.crtid];
              return (
                <button
                  key={c.crtid}
                  type="button"
                  onClick={() => {
                    setMode("court");
                    setSelectedCourt(c.crtid);
                    setOnlyLayJudge(false);
                    updateUrl({ mode: "court", court: c.crtid });
                  }}
                  className={`rounded-[2px] border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-[var(--robe)] bg-[var(--robe)] text-[#fcfbf8]"
                      : "border-[var(--rule)] bg-[var(--bg-paper)] text-[var(--ink-body)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-tint)]"
                  }`}
                >
                  {c.shortName}
                  {stats ? (
                    <span
                      className={`ml-1 font-tabular ${active ? "text-[#fcfbf8]/75" : "text-[var(--ink-muted)]"}`}
                    >
                      {stats.total}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Searchable grouped court dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setCourtPickerOpen((o) => !o)}
            aria-expanded={courtPickerOpen}
            className="flex w-full items-center justify-between rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-paper)] px-3.5 py-2.5 text-left text-sm font-medium text-[var(--ink)] hover:border-[var(--robe-text)]"
          >
            <span>
              {mode === "layjudge"
                ? `全台主要法院 · 國民法官專區（共 ${meta.layJudgeCount} 場）`
                : `${currentCourtInfo.name}（未來 14 天 ${courtCountMap[selectedCourt]?.total ?? 0} 場）`}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[var(--ink-secondary)] transition-transform ${courtPickerOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {courtPickerOpen && (
            <div className="absolute left-0 right-0 z-20 mt-1.5 max-h-80 overflow-y-auto rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-surface)] p-2 shadow-lg">
              <div className="sticky top-0 bg-[var(--bg-surface)] pb-2">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--ink-muted)]"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={courtSearch}
                    onChange={(e) => setCourtSearch(e.target.value)}
                    placeholder="搜尋法院名稱（如：新竹、高院、行政）"
                    className="w-full rounded-[2px] border border-[var(--rule)] bg-[var(--bg-paper)] py-2 pl-9 pr-8 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--robe-text)] focus:bg-[var(--bg-surface)] focus:outline-none"
                    autoFocus
                  />
                  {courtSearch && (
                    <button
                      type="button"
                      onClick={() => setCourtSearch("")}
                      aria-label="清除法院搜尋"
                      className="absolute right-2 top-2 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3 px-1 pb-1">
                {ALL_LEVELS.map((lvl) => {
                  const list = filteredCourtsForPicker.filter(
                    (c) => c.level === lvl,
                  );
                  if (list.length === 0) return null;
                  return (
                    <div key={lvl}>
                      <p className="px-2 py-1 text-[11px] font-bold tracking-wide text-[var(--ink-muted)]">
                        {COURT_LEVEL_LABELS[lvl]}
                      </p>
                      <div className="grid gap-1 sm:grid-cols-2">
                        {list.map((c) => {
                          const active =
                            mode === "court" && selectedCourt === c.crtid;
                          const stats = courtCountMap[c.crtid];
                          return (
                            <button
                              key={c.crtid}
                              type="button"
                              onClick={() => {
                                setMode("court");
                                setSelectedCourt(c.crtid);
                                setOnlyLayJudge(false);
                                setCourtPickerOpen(false);
                                setCourtSearch("");
                                updateUrl({ mode: "court", court: c.crtid });
                              }}
                              className={`flex items-center justify-between rounded-[2px] px-2.5 py-2 text-left text-sm transition-colors ${
                                active
                                  ? "bg-[var(--robe)] font-semibold text-[#fcfbf8]"
                                  : "text-[var(--ink)] hover:bg-[var(--bg-tint)]"
                              }`}
                            >
                              <span className="truncate">{c.name}</span>
                              <span
                                className={`ml-2 shrink-0 font-tabular text-xs ${active ? "text-[#fcfbf8]/75" : "text-[var(--ink-muted)]"}`}
                              >
                                {stats?.total ?? 0}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Date range controls */}
        <div className="space-y-2.5 border-t border-[var(--rule)] pt-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-semibold text-[var(--ink-secondary)]">
              日期快捷：
            </span>
            {[
              { id: "today", label: "今天" },
              { id: "tomorrow", label: "明天" },
              { id: "7d", label: "未來 7 天" },
              { id: "14d", label: "未來 14 天" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  applyQuickDate(p.id as "today" | "tomorrow" | "7d" | "14d")
                }
                className="rounded-[2px] border border-[var(--rule)] bg-[var(--bg-paper)] px-2.5 py-1 text-xs font-medium text-[var(--ink-body)] hover:border-[var(--robe-text)] hover:bg-[var(--bg-sage)] hover:text-[var(--ink)]"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3">
            <div>
              <label
                htmlFor="filter-start"
                className="block text-xs font-medium text-[var(--ink-secondary)]"
              >
                開始日期（西元／民國 {isoToRoc(startDate) ?? "—"}）
              </label>
              <input
                id="filter-start"
                type="date"
                min={meta.dateRange.start}
                max={meta.dateRange.end}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  updateUrl({ start: e.target.value });
                }}
                className="mt-1 w-full rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-surface)] px-2.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--robe-text)] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="filter-end"
                className="block text-xs font-medium text-[var(--ink-secondary)]"
              >
                結束日期（西元／民國 {isoToRoc(endDate) ?? "—"}）
              </label>
              <input
                id="filter-end"
                type="date"
                min={meta.dateRange.start}
                max={meta.dateRange.end}
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  updateUrl({ end: e.target.value });
                }}
                className="mt-1 w-full rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-surface)] px-2.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--robe-text)] focus:outline-none"
              />
            </div>

            <form onSubmit={handleRocJump}>
              <label
                htmlFor="roc-jump"
                className="block text-xs font-medium text-[var(--ink-secondary)]"
              >
                單日快速輸入（支援民國 1151120）
              </label>
              <div className="mt-1 flex gap-1.5">
                <input
                  id="roc-jump"
                  type="text"
                  value={rocJump}
                  onChange={(e) => setRocJump(e.target.value)}
                  placeholder="1151120 或 2026-11-20"
                  className="min-w-0 flex-1 rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-surface)] px-2.5 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--robe-text)] focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-paper)] px-2.5 py-2 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--bg-tint)]"
                >
                  套用
                </button>
              </div>
              {rocJumpError && (
                <p className="mt-1 text-[11px] text-[var(--seal-text)]">
                  {rocJumpError}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Category (庭類) + Sys (案件類別) */}
        <div className="space-y-3 border-t border-[var(--rule)] pt-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-semibold text-[var(--ink-secondary)]">
              庭類：
            </span>
            {(
              [
                { id: "all", label: "全部公開庭" },
                { id: "trial", label: HEARING_CATEGORY_META.trial.label },
                { id: "prep", label: HEARING_CATEGORY_META.prep.label },
                { id: "verdict", label: HEARING_CATEGORY_META.verdict.label },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setCategory(opt.id);
                  updateUrl({ category: opt.id });
                }}
                className={`rounded-[2px] border px-3 py-1 text-xs font-medium transition-colors ${
                  category === opt.id
                    ? "border-[var(--robe)] bg-[var(--robe)] text-[#fcfbf8]"
                    : "border-[var(--rule)] bg-[var(--bg-paper)] text-[var(--ink-body)] hover:bg-[var(--bg-tint)]"
                }`}
              >
                {opt.label}
              </button>
            ))}

            {mode === "court" && (
              <button
                type="button"
                onClick={() => setOnlyLayJudge((v) => !v)}
                className={`inline-flex items-center gap-1 rounded-[2px] border px-3 py-1 text-xs font-medium transition-colors ${
                  onlyLayJudge
                    ? "border-[var(--seal)] bg-[var(--seal)] text-[#fcfbf8]"
                    : "border-[var(--seal-text)]/45 bg-[var(--bg-alert)] text-[var(--seal-text)] hover:border-[var(--seal-text)]"
                }`}
              >
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                僅看國民法官
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-semibold text-[var(--ink-secondary)]">
              案件類別：
            </span>
            {ALL_SYS.filter((s) => availableSys.includes(s)).map((code) => {
              const active =
                selectedSys.length === 0 || selectedSys.includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => toggleSys(code)}
                  className={`rounded-[2px] border px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--bg-surface)]"
                      : "border-[var(--rule)] bg-[var(--bg-paper)] text-[var(--ink-secondary)] hover:bg-[var(--bg-tint)]"
                  }`}
                >
                  {SYS_LABELS[code]}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setShowNonPublicHelp((v) => !v)}
              className="ml-1 inline-flex items-center gap-1 text-xs text-[var(--ink-secondary)] underline decoration-[var(--border-medium)] underline-offset-2 hover:text-[var(--ink)]"
            >
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              為何沒有少年、家事、調解？
            </button>
          </div>

          {showNonPublicHelp && (
            <div className="rounded-[2px] border border-[var(--rule)] bg-[var(--bg-paper)] p-3 text-xs leading-relaxed text-[var(--ink-body)]">
              依《家事事件法》、《少年事件處理法》及調解程序相關規定，
              <strong className="text-[var(--ink)]">
                家事、少年、調解／調解室、協商程序及依法不公開之性侵害／兒少案件原則上不開放旁聽
              </strong>
              。本工具在每日同步時已自動濾除這類庭期（本次同步共濾除{" "}
              {meta.filterStats.filteredTotal.toLocaleString("zh-TW")}{" "}
              筆），避免民眾白跑一趟。
            </div>
          )}
        </div>

        {/* Keyword + Courtroom filter */}
        <div className="grid gap-2.5 border-t border-[var(--rule)] pt-3.5 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label
              htmlFor="filter-keyword"
              className="block text-xs font-medium text-[var(--ink-secondary)]"
            >
              關鍵字（案由、案號、字別、股別）
            </label>
            <div className="relative mt-1">
              <Search
                className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--ink-muted)]"
                aria-hidden="true"
              />
              <input
                id="filter-keyword"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="例如：詐欺、損害賠償、115、訴、和股、國審"
                className="w-full rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-surface)] py-2 pl-9 pr-8 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--robe-text)] focus:outline-none"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  aria-label="清除關鍵字"
                  className="absolute right-2.5 top-2.5 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="filter-room"
              className="block text-xs font-medium text-[var(--ink-secondary)]"
            >
              法庭（{availableCourtrooms.length} 間）
            </label>
            <select
              id="filter-room"
              value={courtroomFilter}
              onChange={(e) => setCourtroomFilter(e.target.value)}
              className="mt-1 w-full rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-surface)] px-2.5 py-2 text-sm text-[var(--ink)] focus:border-[var(--robe-text)] focus:outline-none"
            >
              <option value="">全部法庭</option>
              {availableCourtrooms.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Live result count bar */}
      <div
        role="status"
        aria-live="polite"
        className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm"
      >
        <p className="font-semibold text-[var(--ink)]">
          {loading ? (
            <span className="inline-flex items-center gap-1.5 text-[var(--ink-secondary)]">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              載入{currentCourtInfo.shortName}庭期中…
            </span>
          ) : (
            <>
              找到{" "}
              <span className="font-tabular text-[var(--robe-text)]">
                {filtered.length.toLocaleString("zh-TW")}
              </span>{" "}
              場可旁聽庭期
              {inProgressCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1.5 border border-[var(--robe)] bg-[var(--robe)] px-1.5 py-0.5 text-xs font-medium text-[#fcfbf8]">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-[#fcfbf8] motion-safe:animate-pulse"
                  />
                  {inProgressCount} 場開庭中
                </span>
              )}
              <span className="ml-2 text-xs font-normal text-[var(--ink-secondary)]">
                （{formatCompactDualDate(startDate)}
                {endDate !== startDate
                  ? ` ～ ${formatCompactDualDate(endDate)}`
                  : ""}
                ）
              </span>
            </>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={buildGoogleCalendarSubscribeUrl(
              `${DEFAULT_SITE_ORIGIN}${buildCalendarFeedPath(
                mode === "layjudge"
                  ? { mode: "layjudge" }
                  : {
                      mode: "court",
                      court: selectedCourt,
                      category: category === "all" ? "trial" : category,
                      sys: selectedSys,
                      layjudge: onlyLayJudge,
                    },
              )}`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-[var(--robe-text)]/50 bg-[var(--bg-sage)] px-2.5 py-1 text-xs font-medium text-[var(--robe-text)] transition-colors hover:border-[var(--robe)] hover:bg-[var(--robe)] hover:text-[#fcfbf8]"
          >
            <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              訂閱{mode === "layjudge" ? "國民法官" : currentCourtInfo.shortName}
              至 Google 日曆
            </span>
          </a>

          <a
            href={officialConfirmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--robe-text)] underline decoration-[var(--robe-text)]/40 underline-offset-4 hover:text-[var(--ink)]"
          >
            <span>司法院官方系統查詢</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Results list / Empty state */}
      {loadError ? (
        <div className="rounded-[2px] border border-[var(--seal-text)]/40 bg-[var(--bg-alert)] p-5 text-center text-sm text-[var(--seal-text)]">
          <p>{loadError}</p>
          <a
            href={officialConfirmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 rounded-[2px] bg-[var(--seal)] px-3.5 py-2 text-xs font-semibold text-[#fcfbf8]"
          >
            前往司法院查詢頁 <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : !loading && filtered.length === 0 ? (
        <div className="rounded-[2px] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] px-5 py-10 text-center">
          <p className="text-base font-semibold text-[var(--ink)]">
            這個區間查無尚未開庭的公開庭期
          </p>
          <p className="mt-1.5 text-sm text-[var(--ink-secondary)]">
            試試放寬日期區間、改選「全部公開庭」或切換其他法院；周末與國定假日法院通常不開庭。
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => applyQuickDate("14d")}
              className="btn-formal-primary !px-4 !py-2 !text-xs"
            >
              放寬至未來 14 天
            </button>
            <a
              href={officialConfirmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-formal-secondary !px-4 !py-2 !text-xs"
            >
              到司法院官方頁確認
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleHearings.map((h) => (
            <HearingCard
              key={h.id}
              hearing={h}
              showCourt={mode === "layjudge"}
              nowMs={nowMs}
            />
          ))}

          {visibleCount < filtered.length && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((n) => n + PAGE_STEP)}
                className="btn-formal-secondary"
              >
                載入更多（還有{" "}
                {(filtered.length - visibleCount).toLocaleString("zh-TW")} 場）
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
