"use client";

import {
  CalendarPlus,
  Check,
  Copy,
  Download,
  ExternalLink,
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
      className="rounded-[2px] border border-[#191816]/30 bg-[#fcfbf8]"
    >
      <div className="grid lg:grid-cols-12">
        {/* Left editorial summary */}
        <div className="flex flex-col justify-between border-b border-[#191816]/20 bg-[#efece4] p-6 lg:col-span-5 lg:border-b-0 lg:border-r lg:p-7">
          <div className="space-y-2.5">
            <p className="text-xs font-medium tracking-[0.08em] text-[#8f2d1c]">
              貳、行事曆訂閱服務
            </p>
            <h2 className="font-editorial text-2xl font-semibold leading-snug text-[#191816]">
              訂閱開庭日曆至 Google 日曆或 Apple 行事曆
            </h2>
            <p className="text-sm leading-relaxed text-[#524e47]">
              訂閱動態 iCal 連結後，未來十四日公開開庭將自動同步於個人行事曆中；點選個別場次即可查閱案號、法庭、院區地址與司法院驗證連結。
            </p>
          </div>

          <ul className="mt-5 space-y-1.5 border-t border-[#d6d0c4] pt-4 text-xs text-[#524e47]">
            <li>・每日定時同步，自動濾除調解、家事與不公開庭期</li>
            <li>・訂閱日曆預設關閉自動推播提醒，避免干擾日常行程</li>
            <li>・Google 日曆依官方排程約每 12 至 24 小時更新一次</li>
          </ul>
        </div>

        {/* Right structured selector & action bar */}
        <div className="flex flex-col justify-between space-y-5 p-6 lg:col-span-7 lg:p-7">
          <div className="space-y-3">
            <p className="text-xs font-medium tracking-[0.06em] text-[#524e47]">
              一、選擇訂閱範圍
            </p>

            {/* Connected 3-cell selector */}
            <div className="grid divide-y divide-[#d6d0c4] border border-[#191816]/25 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <button
                type="button"
                onClick={() => setPreset("layjudge")}
                className={`p-3.5 text-left transition-colors ${
                  preset === "layjudge"
                    ? "bg-[#1b382f] text-[#fcfbf8]"
                    : "bg-[#fcfbf8] text-[#191816] hover:bg-[#f2efe8]"
                }`}
              >
                <span
                  className={`text-[11px] font-medium tracking-[0.06em] ${
                    preset === "layjudge" ? "text-[#d4b06a]" : "text-[#8f2d1c]"
                  }`}
                >
                  推薦訂閱
                </span>
                <p className="mt-0.5 font-editorial text-sm font-semibold">
                  全台國民法官
                </p>
                <p
                  className={`mt-0.5 font-tabular text-[11px] ${
                    preset === "layjudge" ? "text-[#fcfbf8]/75" : "text-[#706b62]"
                  }`}
                >
                  約 {meta.layJudgeCount} 場／14 日
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPreset("featured")}
                className={`p-3.5 text-left transition-colors ${
                  preset === "featured"
                    ? "bg-[#1b382f] text-[#fcfbf8]"
                    : "bg-[#fcfbf8] text-[#191816] hover:bg-[#f2efe8]"
                }`}
              >
                <span
                  className={`text-[11px] font-medium tracking-[0.06em] ${
                    preset === "featured" ? "text-[#d4b06a]" : "text-[#1b382f]"
                  }`}
                >
                  全台精選
                </span>
                <p className="mt-0.5 font-editorial text-sm font-semibold">
                  審理與辯論庭
                </p>
                <p
                  className={`mt-0.5 font-tabular text-[11px] ${
                    preset === "featured" ? "text-[#fcfbf8]/75" : "text-[#706b62]"
                  }`}
                >
                  每日精選 18 場
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPreset("court")}
                className={`p-3.5 text-left transition-colors ${
                  preset === "court"
                    ? "bg-[#1b382f] text-[#fcfbf8]"
                    : "bg-[#fcfbf8] text-[#191816] hover:bg-[#f2efe8]"
                }`}
              >
                <span
                  className={`text-[11px] font-medium tracking-[0.06em] ${
                    preset === "court" ? "text-[#d4b06a]" : "text-[#706b62]"
                  }`}
                >
                  指定機關
                </span>
                <p className="mt-0.5 font-editorial text-sm font-semibold">
                  單一法院日曆
                </p>
                <p
                  className={`mt-0.5 font-tabular text-[11px] ${
                    preset === "court" ? "text-[#fcfbf8]/75" : "text-[#706b62]"
                  }`}
                >
                  全台 {meta.courts.length} 所可選
                </p>
              </button>
            </div>

            {preset === "court" && (
              <div className="grid gap-3 border border-[#d6d0c4] bg-[#f7f5f0] p-3.5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="sub-court-select"
                    className="block text-xs font-medium text-[#524e47]"
                  >
                    法院名稱
                  </label>
                  <select
                    id="sub-court-select"
                    value={selectedCourt}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                    className="mt-1 w-full rounded-[2px] border border-[#191816]/30 bg-[#fcfbf8] px-2.5 py-1.5 text-sm text-[#191816] focus:border-[#1b382f] focus:outline-none"
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
                  <span className="block text-xs font-medium text-[#524e47]">
                    收錄庭類
                  </span>
                  <div className="mt-1 flex border border-[#191816]/30">
                    <button
                      type="button"
                      onClick={() => setCourtCategory("trial")}
                      className={`flex-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        courtCategory === "trial"
                          ? "bg-[#191816] text-[#fcfbf8]"
                          : "bg-[#fcfbf8] text-[#524e47] hover:bg-[#efece4]"
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
                      className={`flex-1 border-l border-[#191816]/30 px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        courtCategory === "all"
                          ? "bg-[#191816] text-[#fcfbf8]"
                          : "bg-[#fcfbf8] text-[#524e47] hover:bg-[#efece4]"
                      }`}
                    >
                      全部公開庭
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium tracking-[0.06em] text-[#524e47]">
              二、加入個人行事曆或複製 iCal 訂閱網址
            </p>

            <div className="flex items-center border border-[#191816]/25 bg-[#f7f5f0]">
              <code className="min-w-0 flex-1 truncate px-3 py-2 font-tabular text-xs text-[#191816]">
                {httpsFeedUrl}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex shrink-0 items-center gap-1.5 border-l border-[#191816]/25 bg-[#fcfbf8] px-3 py-2 text-xs font-medium text-[#191816] transition-colors hover:bg-[#191816] hover:text-[#fcfbf8]"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
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
                className="btn-formal-primary"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                <span>訂閱至 Google 日曆</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
              </a>

              <a href={webcalUrl} className="btn-formal-secondary">
                <span>Apple／Outlook（webcal）</span>
              </a>

              <a
                href={feedPath}
                download
                className="inline-flex items-center gap-1 pl-1 text-xs font-medium text-[#524e47] underline decoration-[#191816]/30 underline-offset-4 hover:text-[#191816]"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>下載 .ics 檔案</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
