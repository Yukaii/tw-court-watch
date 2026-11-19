"use client";

import { CalendarPlus, Check, Copy, ExternalLink } from "lucide-react";
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
      // Clipboard blocked
    }
  };

  return (
    <section
      id="subscribe-calendar"
      className="rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
    >
      <div className="grid lg:grid-cols-12">
        {/* Left: Plain-language value prop */}
        <div className="flex flex-col justify-center space-y-2.5 border-b border-[var(--rule)] bg-[var(--bg-tint)] p-6 lg:col-span-5 lg:border-b-0 lg:border-r lg:p-8">
          <h2 className="font-editorial text-2xl font-semibold leading-snug text-[var(--ink)]">
            訂閱開庭日曆到個人行事曆
          </h2>
          <p className="text-[15px] leading-relaxed text-[var(--ink-secondary)]">
            訂閱後，未來 14
            天的公開開庭會自動出現在你的行事曆中，每日定時更新，且不會發送擾人的通知提醒。
          </p>
        </div>

        {/* Right: Simple selector + clean buttons */}
        <div className="space-y-5 p-6 lg:col-span-7 lg:p-8">
          <div className="grid divide-y divide-[var(--rule)] border border-[var(--border-subtle)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <button
              type="button"
              onClick={() => setPreset("layjudge")}
              className={`px-4 py-3.5 text-left transition-colors ${
                preset === "layjudge"
                  ? "bg-[var(--robe)] text-[#fcfbf8]"
                  : "bg-[var(--bg-surface)] text-[var(--ink)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <p className="font-editorial text-base font-semibold">
                全台國民法官
              </p>
              <p
                className={`mt-1 font-tabular text-xs ${
                  preset === "layjudge"
                    ? "text-[#fcfbf8]/75"
                    : "text-[var(--ink-secondary)]"
                }`}
              >
                約 {meta.layJudgeCount} 場（推薦）
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPreset("featured")}
              className={`px-4 py-3.5 text-left transition-colors ${
                preset === "featured"
                  ? "bg-[var(--robe)] text-[#fcfbf8]"
                  : "bg-[var(--bg-surface)] text-[var(--ink)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <p className="font-editorial text-base font-semibold">
                全台精選審理庭
              </p>
              <p
                className={`mt-1 font-tabular text-xs ${
                  preset === "featured"
                    ? "text-[#fcfbf8]/75"
                    : "text-[var(--ink-secondary)]"
                }`}
              >
                每日精選 18 場
              </p>
            </button>

            <button
              type="button"
              onClick={() => setPreset("court")}
              className={`px-4 py-3.5 text-left transition-colors ${
                preset === "court"
                  ? "bg-[var(--robe)] text-[#fcfbf8]"
                  : "bg-[var(--bg-surface)] text-[var(--ink)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <p className="font-editorial text-base font-semibold">
                指定單一法院
              </p>
              <p
                className={`mt-1 font-tabular text-xs ${
                  preset === "court"
                    ? "text-[#fcfbf8]/75"
                    : "text-[var(--ink-secondary)]"
                }`}
              >
                全台 {meta.courts.length} 所可選
              </p>
            </button>
          </div>

          {preset === "court" && (
            <div className="grid gap-3 border border-[var(--rule)] bg-[var(--bg-paper)] p-3.5 sm:grid-cols-2">
              <select
                aria-label="選擇法院"
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                className="w-full rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-sm text-[var(--ink)] focus:border-[var(--robe-text)] focus:outline-none"
              >
                {LEVEL_ORDER.map((level) => {
                  const group = MAJOR_COURTS.filter((c) => c.level === level);
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

              <div className="flex border border-[var(--border-medium)]">
                <button
                  type="button"
                  onClick={() => setCourtCategory("trial")}
                  className={`flex-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    courtCategory === "trial"
                      ? "bg-[var(--ink)] text-[var(--bg-surface)]"
                      : "bg-[var(--bg-surface)] text-[var(--ink-secondary)] hover:bg-[var(--bg-tint)]"
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
                  className={`flex-1 border-l border-[var(--border-medium)] px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    courtCategory === "all"
                      ? "bg-[var(--ink)] text-[var(--bg-surface)]"
                      : "bg-[var(--bg-surface)] text-[var(--ink-secondary)] hover:bg-[var(--bg-tint)]"
                  }`}
                >
                  全部公開庭
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <a
              href={googleCalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-formal-primary"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              <span>訂閱到 Google 日曆</span>
              <ExternalLink
                className="h-3.5 w-3.5 opacity-80"
                aria-hidden="true"
              />
            </a>

            <a href={webcalUrl} className="btn-formal-secondary">
              <span>Apple／Outlook 行事曆</span>
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2 py-2 text-xs font-medium text-[var(--ink-secondary)] underline decoration-[var(--border-medium)] underline-offset-4 hover:text-[var(--ink)]"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[var(--robe-text)]" />
                  <span>已複製訂閱網址</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>複製訂閱網址</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
