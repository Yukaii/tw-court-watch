"use client";

import {
  ArrowRight,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatDualDate, formatSyncedAt, getWeekdayZh } from "@/lib/date";
import { generateHearingIcs } from "@/lib/ics";
import { downloadTextFile } from "@/lib/storage";
import type { Hearing, HearingsMeta } from "@/lib/types";

interface HomeHeroShowcaseProps {
  meta: HearingsMeta;
  spotlightHearings: Hearing[];
}

export function HomeHeroShowcase({
  meta,
  spotlightHearings,
}: HomeHeroShowcaseProps) {
  const [index, setIndex] = useState(0);
  const current = spotlightHearings[index] ?? spotlightHearings[0];

  const today = meta.todayDate;
  const [, mStr, dStr] = (current?.date ?? today).split("-");
  const mNum = Number.parseInt(mStr ?? "1", 10);
  const dNum = Number.parseInt(dStr ?? "1", 10);
  const rocYear = Number.parseInt((current?.date ?? today).slice(0, 4), 10) - 1911;
  const weekday = getWeekdayZh(current?.date ?? today);

  const handlePrev = () => {
    setIndex((i) => (i - 1 + spotlightHearings.length) % spotlightHearings.length);
  };

  const handleNext = () => {
    setIndex((i) => (i + 1) % spotlightHearings.length);
  };

  const handleIcs = () => {
    if (!current) return;
    const ics = generateHearingIcs(current);
    downloadTextFile(
      ics,
      `hearing-${current.crtid}-${current.date}.ics`,
      "text/calendar;charset=utf-8",
    );
  };

  return (
    <section className="space-y-6">
      {/* Editorial Top Header */}
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="space-y-3.5 lg:col-span-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[#5c564c]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#1f4b3b]">
              <span className="h-2 w-2 rounded-full bg-[#b85432]" aria-hidden="true" />
              公開審判日曆
            </span>
            <span aria-hidden="true">／</span>
            <span className="font-tabular">{formatDualDate(today)}</span>
          </div>

          <h1 className="font-editorial text-3xl leading-[1.2] font-bold tracking-tight text-[#1c1a17] sm:text-5xl">
            走進法院旁聽席，
            <br />
            今天全台有{" "}
            <span className="text-[#1f4b3b] underline decoration-[#c78a1f]/60 decoration-[3px] underline-offset-4">
              {meta.todayCount.toLocaleString("zh-TW")}
            </span>{" "}
            場公開開庭。
          </h1>

          <p className="max-w-2xl text-[15px] leading-relaxed text-[#5c564c] sm:text-base">
            免預約、免門票。我們每日同步全台 {meta.courts.length}{" "}
            所主要法院庭期，自動濾除{" "}
            {meta.filterStats.filteredTotal.toLocaleString("zh-TW")}{" "}
            場調解與不公開程序，把開庭變成一張張清楚的日曆票卡。
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 lg:col-span-4 lg:justify-end">
          <Link
            href={`/search?court=TPD&start=${today}&end=${today}&category=trial`}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1f4b3b] px-4 py-2.5 text-sm font-semibold text-[#f6f2e9] shadow-xs transition-colors hover:bg-[#16362b]"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>找今天可旁聽的庭</span>
          </Link>
          <Link
            href={`/search?mode=layjudge&start=${today}&end=${meta.dateRange.end}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1c1a17]/20 bg-[#fffdf8] px-4 py-2.5 text-sm font-semibold text-[#1c1a17] transition-colors hover:border-[#c78a1f] hover:bg-[#faf0d7]"
          >
            <Sparkles className="h-4 w-4 text-[#c78a1f]" aria-hidden="true" />
            <span>國民法官（{meta.layJudgeCount}）</span>
          </Link>
        </div>
      </div>

      {/* HUGE Hero Illustration + Anchored Floating Calendar Event Card */}
      <div className="relative">
        {/* Full-bleed editorial illustration plate */}
        <div className="relative overflow-hidden rounded-2xl border border-[#1c1a17]/15 bg-[#efe8d8] shadow-[0_24px_60px_-28px_rgba(28,26,23,0.32)]">
          <div className="relative aspect-[16/10] w-full sm:aspect-[16/9] lg:aspect-[16/8.6]">
            <Image
              src="/images/hero-courtroom.jpg"
              alt="溫暖陽光灑落的台灣法院旁聽席插畫，兩位民眾坐在木質旁聽席上靜心觀庭並用紙本筆記本記錄"
              fill
              priority
              sizes="(max-width: 1120px) 100vw, 1120px"
              className="object-cover object-left-bottom"
            />
            {/* Subtle bottom-left vignette for editorial caption readability */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1c1a17]/45 via-[#1c1a17]/10 to-transparent"
            />
            {/* Editorial plate caption on bottom-left */}
            <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between gap-2 text-[11px] font-medium text-[#fffdf8]/95 lg:right-[410px]">
              <span className="inline-flex items-center gap-2 drop-shadow-xs">
                <span className="font-tabular uppercase tracking-widest opacity-85">
                  PUBLIC GALLERY
                </span>
                <span aria-hidden="true">·</span>
                <span>法院門開著就能走進旁聽席，帶著紙筆記錄程序</span>
              </span>
            </div>
          </div>
        </div>

        {/* Floating Live Calendar Event Card (overlaps bottom-right of hero illustration on desktop) */}
        {current && (
          <div className="mt-4 lg:absolute lg:bottom-5 lg:right-5 lg:mt-0 lg:w-[390px]">
            <div className="overflow-hidden rounded-xl border border-[#1c1a17]/20 bg-[#fffdf8]/98 shadow-[0_22px_45px_-16px_rgba(28,26,23,0.38)] backdrop-blur-sm">
              {/* Top ticket header bar */}
              <div className="flex items-center justify-between border-b border-[#1c1a17]/12 bg-[#1f4b3b] px-3.5 py-2 text-[#f6f2e9]">
                <span className="inline-flex items-center gap-1.5 font-tabular text-[11px] font-semibold tracking-wider uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#e9b949]" />
                  精選開庭日曆卡 · {index + 1}/{spotlightHearings.length}
                </span>

                {spotlightHearings.length > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="上一場精選庭期"
                      className="rounded p-0.5 text-[#f6f2e9]/80 hover:bg-[#f6f2e9]/15 hover:text-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="下一場精選庭期"
                      className="rounded p-0.5 text-[#f6f2e9]/80 hover:bg-[#f6f2e9]/15 hover:text-white"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Ticket body with left calendar stub */}
              <div className="flex">
                {/* Date stub */}
                <div className="flex w-[88px] shrink-0 flex-col items-center justify-center border-r border-dashed border-[#1c1a17]/20 bg-[#efe8d8] px-2.5 py-3.5 text-center">
                  <span className="text-[11px] font-semibold text-[#5c564c]">
                    {mNum}月 週{weekday}
                  </span>
                  <span className="mt-0.5 font-editorial text-3xl leading-none font-bold text-[#1c1a17]">
                    {dNum}
                  </span>
                  <span className="mt-1 font-tabular text-[10px] text-[#6b6458]">
                    民{rocYear}/{mStr}/{dStr}
                  </span>
                  <span className="mt-2 rounded bg-[#1c1a17] px-2 py-0.5 font-tabular text-xs font-semibold text-[#f6f2e9]">
                    {current.time}
                  </span>
                </div>

                {/* Event info */}
                <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {current.isLayJudge && (
                        <span className="inline-flex items-center gap-0.5 rounded-sm bg-[#c78a1f]/18 px-1.5 py-0.5 text-[10px] font-bold text-[#8a5a08]">
                          <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                          國民法官
                        </span>
                      )}
                      <span className="rounded-sm bg-[#1f4b3b]/12 px-1.5 py-0.5 text-[10px] font-semibold text-[#1f4b3b]">
                        {current.dukd}
                      </span>
                      <span className="text-[11px] text-[#6b6458]">
                        {current.sysLabel}
                      </span>
                    </div>

                    <Link
                      href={`/hearings/${current.id}`}
                      className="block font-editorial text-base leading-snug font-bold text-[#1c1a17] no-underline hover:text-[#1f4b3b]"
                    >
                      {current.reason || `${current.sysLabel}${current.dukd}`}
                    </Link>

                    <p className="font-tabular text-[11px] text-[#6b6458]">
                      {current.caseNo}
                    </p>

                    <p className="flex items-center gap-1 text-xs text-[#4a453c]">
                      <MapPin
                        className="h-3.5 w-3.5 shrink-0 text-[#b85432]"
                        aria-hidden="true"
                      />
                      <span className="truncate">
                        {current.courtShortName} · {current.courtroom}
                      </span>
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#1c1a17]/10 pt-2.5 text-xs">
                    <button
                      type="button"
                      onClick={handleIcs}
                      className="inline-flex items-center gap-1 rounded-md bg-[#1f4b3b] px-2.5 py-1 text-[11px] font-semibold text-[#f6f2e9] hover:bg-[#16362b]"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
                      加入行事曆
                    </button>
                    <Link
                      href={`/hearings/${current.id}`}
                      className="inline-flex items-center gap-0.5 font-semibold text-[#1f4b3b] hover:text-[#b85432]"
                    >
                      詳情
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Crisp Editorial Data Bar */}
      <div className="grid grid-cols-2 divide-y divide-[#1c1a17]/12 rounded-xl border border-[#1c1a17]/15 bg-[#fffdf8] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        {[
          {
            label: "未來 14 天公開庭期",
            value: meta.totalHearings.toLocaleString("zh-TW"),
            sub: `全台 ${meta.courts.length} 所主要法院`,
          },
          {
            label: "審理／言詞辯論（新手推）",
            value: meta.trialCount.toLocaleString("zh-TW"),
            sub: "避開 30 秒快閃宣判",
          },
          {
            label: "即將開庭國民法官",
            value: meta.layJudgeCount.toLocaleString("zh-TW"),
            sub: "白話度高、最適合觀摩",
          },
          {
            label: "本次已濾除不公開",
            value: meta.filterStats.filteredTotal.toLocaleString("zh-TW"),
            sub: `同步於 ${formatSyncedAt(meta.syncedAt).slice(5, 16)}`,
          },
        ].map((stat) => (
          <div key={stat.label} className="px-4 py-3.5">
            <p className="text-[11px] font-medium text-[#6b6458]">
              {stat.label}
            </p>
            <p className="mt-0.5 font-editorial text-2xl font-bold text-[#1c1a17]">
              {stat.value}
            </p>
            <p className="mt-0.5 text-[11px] text-[#7a7367]">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Subtle official note */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#6b6458]">
        <span>
          資料同步時間：{formatSyncedAt(meta.syncedAt)}（每日 06:30／18:30 更新）
        </span>
        <Link
          href="/about"
          className="inline-flex items-center gap-1 font-medium text-[#1f4b3b] underline decoration-[#1f4b3b]/35 underline-offset-2 hover:text-[#16362b]"
        >
          查看不公開過濾規則與資料來源
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
