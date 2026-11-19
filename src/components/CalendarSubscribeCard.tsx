"use client";

import {
  CalendarPlus,
  Check,
  Copy,
  Download,
  ExternalLink,
  Rss,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { COURT_LEVEL_LABELS, MAJOR_COURTS } from "@/lib/courts";
import {
  DEFAULT_SITE_ORIGIN,
  buildCalendarFeedPath,
  buildGoogleCalendarSubscribeUrl,
  toWebcalUrl,
} from "@/lib/ics";
import type { CourtLevel, HearingsMeta } from "@/lib/types";

interface CalendarSubscribeCardProps {
  meta: HearingsMeta;
}

type FeedPreset = "layjudge" | "featured" | "court";

const LEVEL_ORDER: CourtLevel[] = ["district", "high", "admin_ip", "supreme"];

export function CalendarSubscribeCard({ meta }: CalendarSubscribeCardProps) {
  const [preset, setPreset] = useState<FeedPreset>("layjudge");
  const [selectedCourt, setSelectedCourt] = useState("TPD");
  const [courtCategory, setCourtCategory] = useState<"trial" | "all">("trial");
  const [origin, setOrigin] = useState(DEFAULT_SITE_ORIGIN);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.origin &&
      !window.location.origin.includes("localhost")
    ) {
      setOrigin(window.location.origin);
    }
  }, []);

  const feedPath = useMemo(() => {
    if (preset === "layjudge") {
      return buildCalendarFeedPath({ mode: "layjudge" });
    }
    if (preset === "featured") {
      return buildCalendarFeedPath({ mode: "featured" });
    }
    return buildCalendarFeedPath({
      mode: "court",
      court: selectedCourt,
      category: courtCategory,
    });
  }, [preset, selectedCourt, courtCategory]);

  const httpsFeedUrl = `${origin}${feedPath}`;
  const webcalUrl = toWebcalUrl(httpsFeedUrl);
  const googleCalUrl = buildGoogleCalendarSubscribeUrl(httpsFeedUrl);

  const selectedCourtStats = meta.courts.find((c) => c.crtid === selectedCourt);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(httpsFeedUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: ignore if clipboard blocked
    }
  };

  return (
    <section
      id="subscribe-calendar"
      className="overflow-hidden rounded-2xl border border-[#1c1a17]/15 bg-[#fffdf8] shadow-[0_12px_32px_-20px_rgba(28,26,23,0.22)]"
    >
      <div className="grid lg:grid-cols-12">
        {/* Left editorial pitch */}
        <div className="flex flex-col justify-between border-b border-dashed border-[#1c1a17]/18 bg-[#efe8d8] p-6 lg:col-span-5 lg:border-b-0 lg:border-r lg:p-7">
          <div className="space-y-2.5">
            <p className="inline-flex items-center gap-1.5 font-tabular text-[11px] font-semibold uppercase tracking-widest text-[#1f4b3b]">
              <Rss className="h-3.5 w-3.5 text-[#b85432]" aria-hidden="true" />
              GOOGLE CALENDAR &amp; ICAL FEED
            </p>
            <h2 className="font-editorial text-2xl font-bold leading-snug text-[#1c1a17]">
              直接訂閱到你的 Google 日曆或 Apple 行事曆
            </h2>
            <p className="text-sm leading-relaxed text-[#4a453c]">
              不用天天回來手動查！訂閱 iCal 動態日曆連結後，未來 14
              天的公開開庭會自動出現在你的行事曆裡，點擊事件即可查看院區地址與交通路線。
            </p>
          </div>

          <ul className="mt-5 space-y-1.5 border-t border-[#1c1a17]/12 pt-4 text-xs text-[#5c564c]">
            <li>• 每日同步更新，自動濾除調解、家事與不公開庭期</li>
            <li>• 訂閱日曆預設不開啟惱人的自動推播提醒</li>
            <li>• Google 日曆依官方機制約每 12–24 小時自動同步一次</li>
          </ul>
        </div>

        {/* Right interactive feed builder */}
        <div className="flex flex-col justify-between space-y-5 p-6 lg:col-span-7 lg:p-7">
          {/* Feed preset selector */}
          <div className="space-y-3">
            <p className="font-tabular text-[11px] font-semibold uppercase tracking-wider text-[#6b6458]">
              STEP 1 · 選擇你想訂閱的開庭日曆
            </p>
            <div className="grid gap-2.5 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setPreset("layjudge")}
                className={`rounded-xl border p-3 text-left transition-all ${
                  preset === "layjudge"
                    ? "border-[#1f4b3b] bg-[#f2f7f4] ring-1 ring-[#1f4b3b]"
                    : "border-[#1c1a17]/15 bg-[#fffdf8] hover:border-[#1c1a17]/35"
                }`}
              >
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8a5a08]">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  最推薦
                </span>
                <p className="mt-0.5 font-editorial text-sm font-bold text-[#1c1a17]">
                  全台國民法官
                </p>
                <p className="mt-0.5 font-tabular text-[11px] text-[#6b6458]">
                  約 {meta.layJudgeCount} 場／14 天
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPreset("featured")}
                className={`rounded-xl border p-3 text-left transition-all ${
                  preset === "featured"
                    ? "border-[#1f4b3b] bg-[#f2f7f4] ring-1 ring-[#1f4b3b]"
                    : "border-[#1c1a17]/15 bg-[#fffdf8] hover:border-[#1c1a17]/35"
                }`}
              >
                <span className="text-xs font-semibold text-[#1f4b3b]">
                  全台精選
                </span>
                <p className="mt-0.5 font-editorial text-sm font-bold text-[#1c1a17]">
                  審理與辯論庭
                </p>
                <p className="mt-0.5 font-tabular text-[11px] text-[#6b6458]">
                  每日精選 18 場
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPreset("court")}
                className={`rounded-xl border p-3 text-left transition-all ${
                  preset === "court"
                    ? "border-[#1f4b3b] bg-[#f2f7f4] ring-1 ring-[#1f4b3b]"
                    : "border-[#1c1a17]/15 bg-[#fffdf8] hover:border-[#1c1a17]/35"
                }`}
              >
                <span className="text-xs font-semibold text-[#5c564c]">
                  自選法院
                </span>
                <p className="mt-0.5 font-editorial text-sm font-bold text-[#1c1a17]">
                  單一法院日曆
                </p>
                <p className="mt-0.5 font-tabular text-[11px] text-[#6b6458]">
                  全台 {meta.courts.length} 所可選
                </p>
              </button>
            </div>

            {/* Court dropdown when preset === "court" */}
            {preset === "court" && (
              <div className="grid gap-3 rounded-xl border border-[#1c1a17]/12 bg-[#f8f5ee] p-3.5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="sub-court-select"
                    className="block text-xs font-medium text-[#5c564c]"
                  >
                    選擇法院
                  </label>
                  <select
                    id="sub-court-select"
                    value={selectedCourt}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#1c1a17]/20 bg-[#fffdf8] px-2.5 py-1.5 text-sm text-[#1c1a17] focus:border-[#1f4b3b] focus:outline-none"
                  >
                    {LEVEL_ORDER.map((level) => {
                      const group = MAJOR_COURTS.filter(
                        (c) => c.level === level,
                      );
                      if (group.length === 0) return null;
                      return (
                        <optgroup key={level} label={COURT_LEVEL_LABELS[level]}>
                          {group.map((c) => (
                            <option key={c.crtid} value={c.crtid}>
                              {c.shortName}（{c.name}）
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <span className="block text-xs font-medium text-[#5c564c]">
                    收錄庭類
                  </span>
                  <div className="mt-1 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCourtCategory("trial")}
                      className={`flex-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        courtCategory === "trial"
                          ? "border-[#1f4b3b] bg-[#1f4b3b] text-[#f6f2e9]"
                          : "border-[#1c1a17]/15 bg-[#fffdf8] text-[#5c564c]"
                      }`}
                    >
                      僅審理／辯論
                      {selectedCourtStats
                        ? ` (${Math.min(selectedCourtStats.trialCount, 500)})`
                        : ""}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourtCategory("all")}
                      className={`flex-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        courtCategory === "all"
                          ? "border-[#1f4b3b] bg-[#1f4b3b] text-[#f6f2e9]"
                          : "border-[#1c1a17]/15 bg-[#fffdf8] text-[#5c564c]"
                      }`}
                    >
                      全部公開庭
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live feed URL box & action buttons */}
          <div className="space-y-3">
            <p className="font-tabular text-[11px] font-semibold uppercase tracking-wider text-[#6b6458]">
              STEP 2 · 一鍵加入或複製 iCal 訂閱網址
            </p>

            <div className="flex items-center gap-2 rounded-lg border border-[#1c1a17]/15 bg-[#f8f5ee] px-3 py-2">
              <code className="min-w-0 flex-1 truncate font-tabular text-xs text-[#1c1a17]">
                {httpsFeedUrl}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#1c1a17]/15 bg-[#fffdf8] px-2.5 py-1 text-xs font-semibold text-[#1c1a17] transition-colors hover:border-[#1f4b3b] hover:text-[#1f4b3b]"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#1f4b3b]" />
                    <span>已複製</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>複製網址</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={googleCalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#1f4b3b] px-4 py-2.5 text-sm font-semibold text-[#f6f2e9] shadow-xs transition-colors hover:bg-[#16362b]"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                <span>訂閱到 Google 日曆</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
              </a>

              <a
                href={webcalUrl}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1c1a17]/20 bg-[#fffdf8] px-3.5 py-2.5 text-sm font-semibold text-[#1c1a17] transition-colors hover:border-[#1f4b3b] hover:bg-[#f2f7f4]"
              >
                <span>Apple／Outlook（webcal）</span>
              </a>

              <a
                href={feedPath}
                download
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#5c564c] underline decoration-[#1c1a17]/25 underline-offset-4 hover:text-[#1f4b3b]"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>下載 .ics</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
