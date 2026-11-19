"use client";

import {
  ArrowRight,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  MapPin,
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
  const rocYear =
    Number.parseInt((current?.date ?? today).slice(0, 4), 10) - 1911;
  const weekday = getWeekdayZh(current?.date ?? today);

  const handlePrev = () => {
    setIndex(
      (i) => (i - 1 + spotlightHearings.length) % spotlightHearings.length,
    );
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
      {/* Clean Gazette Header */}
      <div className="legal-rule-bottom grid gap-5 pb-6 lg:grid-cols-12 lg:items-end">
        <div className="space-y-3 lg:col-span-8">
          <p className="font-tabular text-xs tracking-[0.04em] text-[#524e47]">
            {formatDualDate(today)}
          </p>

          <h1 className="font-editorial text-3xl leading-[1.3] font-semibold text-[#191816] sm:text-[40px]">
            走進法院旁聽席，
            <br />
            今天全台有{" "}
            <span className="font-tabular font-semibold text-[#1b382f]">
              {meta.todayCount.toLocaleString("zh-TW")}
            </span>{" "}
            場公開開庭
          </h1>

          <p className="max-w-xl text-[15px] leading-relaxed text-[#524e47]">
            免預約、免門票。每日整理全台 {meta.courts.length}{" "}
            所主要法院公開庭期，並自動排除調解與不公開案件。
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 lg:col-span-4 lg:justify-end">
          <Link
            href={`/search?court=TPD&start=${today}&end=${today}&category=trial`}
            className="btn-formal-primary"
          >
            <span>找今天可旁聽的庭</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <a href="#subscribe-calendar" className="btn-formal-secondary">
            <CalendarPlus
              className="h-3.5 w-3.5 text-[#1b382f]"
              aria-hidden="true"
            />
            <span>訂閱開庭日曆</span>
          </a>
        </div>
      </div>

      {/* Hero Illustration Plate + Floating Calendar Event Card */}
      <div className="relative">
        <div className="relative overflow-hidden rounded-[2px] border border-[#191816]/25 bg-[#efece4]">
          <div className="relative aspect-[16/10] w-full sm:aspect-[16/9] lg:aspect-[16/8.5]">
            <Image
              src="/images/hero-courtroom.jpg"
              alt="溫暖陽光灑落的臺灣法院旁聽席插畫，兩位民眾坐在木質旁聽席上靜心觀庭並用紙本筆記本記錄"
              fill
              priority
              sizes="(max-width: 1120px) 100vw, 1120px"
              className="object-cover object-left-bottom"
            />
          </div>
        </div>

        {/* Floating Live Calendar Event Card */}
        {current && (
          <div className="mt-4 lg:absolute lg:bottom-5 lg:right-5 lg:mt-0 lg:w-[390px]">
            <div className="overflow-hidden rounded-[2px] border border-[#191816] bg-[#fcfbf8]">
              <div className="flex items-center justify-between border-b border-[#191816] bg-[#191816] px-3.5 py-2 text-[#fcfbf8]">
                <span className="flex items-center gap-2 text-[11px] tracking-[0.04em]">
                  <span>近期精選開庭</span>
                  <span className="font-tabular text-[#d6d0c4]">
                    {index + 1} / {spotlightHearings.length}
                  </span>
                </span>

                {spotlightHearings.length > 1 && (
                  <div className="flex items-center border border-[#fcfbf8]/25">
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="上一場精選庭期"
                      className="border-r border-[#fcfbf8]/25 p-1 text-[#fcfbf8]/85 transition-colors hover:bg-[#fcfbf8]/15 hover:text-white"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="下一場精選庭期"
                      className="p-1 text-[#fcfbf8]/85 transition-colors hover:bg-[#fcfbf8]/15 hover:text-white"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex">
                <div className="flex w-[90px] shrink-0 flex-col items-center justify-center border-r border-dashed border-[#191816]/30 bg-[#efece4] px-2.5 py-4 text-center">
                  <span className="text-[11px] font-medium text-[#524e47]">
                    {mNum}月 · 週{weekday}
                  </span>
                  <span className="mt-0.5 font-editorial text-[30px] leading-none font-semibold text-[#191816]">
                    {dNum}
                  </span>
                  <span className="mt-1 font-tabular text-[10px] text-[#706b62]">
                    民{rocYear}/{mStr}/{dStr}
                  </span>
                  <span className="mt-2.5 border border-[#191816] bg-[#fcfbf8] px-2 py-0.5 font-tabular text-xs font-medium text-[#191816]">
                    {current.time}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {current.isLayJudge && (
                        <span className="border border-[#8f2d1c] bg-[#8f2d1c]/6 px-1.5 py-0.5 text-[10px] font-semibold text-[#8f2d1c]">
                          國民法官
                        </span>
                      )}
                      <span className="border border-[#1b382f]/40 bg-[#1b382f]/6 px-1.5 py-0.5 text-[10px] font-medium text-[#1b382f]">
                        {current.dukd}
                      </span>
                      <span className="text-[11px] text-[#706b62]">
                        {current.sysLabel}
                      </span>
                    </div>

                    <Link
                      href={`/hearings/${current.id}`}
                      className="block font-editorial text-base leading-snug font-semibold text-[#191816] no-underline hover:text-[#1b382f]"
                    >
                      {current.reason || `${current.sysLabel}${current.dukd}`}
                    </Link>

                    <p className="font-tabular text-[11px] text-[#706b62]">
                      {current.caseNo}
                    </p>

                    <p className="flex items-center gap-1 text-xs text-[#524e47]">
                      <MapPin
                        className="h-3.5 w-3.5 shrink-0 text-[#8f2d1c]"
                        aria-hidden="true"
                      />
                      <span className="truncate">
                        {current.courtShortName} · {current.courtroom}
                      </span>
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#d6d0c4] pt-2.5 text-xs">
                    <button
                      type="button"
                      onClick={handleIcs}
                      className="inline-flex items-center gap-1 border border-[#191816]/30 bg-[#f7f5f0] px-2.5 py-1 text-[11px] font-medium text-[#191816] transition-colors hover:border-[#1b382f] hover:bg-[#1b382f] hover:text-[#fcfbf8]"
                    >
                      <CalendarPlus className="h-3 w-3" aria-hidden="true" />
                      <span>加入行事曆</span>
                    </button>
                    <Link
                      href={`/hearings/${current.id}`}
                      className="inline-flex items-center gap-0.5 font-medium text-[#1b382f] underline decoration-[#1b382f]/40 underline-offset-4 hover:text-[#191816]"
                    >
                      <span>查看詳情</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Single Calm Summary Strip (replaces dense 4-card stat block) */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-[#d6d0c4] pb-4 text-xs text-[#524e47]">
        <p>
          未來 14 天共{" "}
          <strong className="font-tabular font-medium text-[#191816]">
            {meta.totalHearings.toLocaleString("zh-TW")}
          </strong>{" "}
          場公開庭期（含{" "}
          <strong className="font-tabular font-medium text-[#191816]">
            {meta.layJudgeCount}
          </strong>{" "}
          場國民法官），已自動排除{" "}
          <span className="font-tabular">
            {meta.filterStats.filteredTotal.toLocaleString("zh-TW")}
          </span>{" "}
          場調解與不公開案件。
        </p>
        <span className="flex items-center gap-4 text-[#706b62]">
          <span className="font-tabular">
            更新於 {formatSyncedAt(meta.syncedAt).slice(5, 16)}
          </span>
          <Link
            href="/about"
            className="font-medium text-[#1b382f] underline decoration-[#1b382f]/40 underline-offset-4 hover:text-[#191816]"
          >
            資料說明
          </Link>
        </span>
      </div>
    </section>
  );
}
