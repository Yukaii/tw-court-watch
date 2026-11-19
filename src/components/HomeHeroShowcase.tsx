"use client";

import {
  ArrowRight,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  formatDualDate,
  formatSyncedAt,
  getHearingLiveStatus,
  getWeekdayZh,
} from "@/lib/date";
import { generateHearingIcs } from "@/lib/ics";
import { downloadTextFile } from "@/lib/storage";
import type { Hearing, HearingsMeta } from "@/lib/types";
import { useNowMs } from "@/lib/use-now";
import { HearingLiveStatusBadge } from "./HearingLiveStatusBadge";

interface HomeHeroShowcaseProps {
  meta: HearingsMeta;
  spotlightHearings: Hearing[];
}

export function HomeHeroShowcase({
  meta,
  spotlightHearings,
}: HomeHeroShowcaseProps) {
  const [index, setIndex] = useState(0);
  const userInteractedRef = useRef(false);
  const nowMs = useNowMs();

  useEffect(() => {
    if (nowMs === null || userInteractedRef.current) return;
    const activeIdx = spotlightHearings.findIndex(
      (h) => getHearingLiveStatus(h, nowMs).kind !== "ended",
    );
    if (activeIdx >= 0 && activeIdx !== index) {
      setIndex(activeIdx);
    }
  }, [nowMs, spotlightHearings, index]);

  const current = spotlightHearings[index] ?? spotlightHearings[0];

  const today = meta.todayDate;
  const [, mStr, dStr] = (current?.date ?? today).split("-");
  const mNum = Number.parseInt(mStr ?? "1", 10);
  const dNum = Number.parseInt(dStr ?? "1", 10);
  const rocYear =
    Number.parseInt((current?.date ?? today).slice(0, 4), 10) - 1911;
  const weekday = getWeekdayZh(current?.date ?? today);

  const handlePrev = () => {
    userInteractedRef.current = true;
    setIndex(
      (i) => (i - 1 + spotlightHearings.length) % spotlightHearings.length,
    );
  };

  const handleNext = () => {
    userInteractedRef.current = true;
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
          <p className="font-tabular text-sm text-[#5c574f]">
            {formatDualDate(today)}
          </p>

          <h1 className="font-editorial text-3xl leading-[1.3] font-semibold text-[#191816] sm:text-[42px]">
            走進法院旁聽席，
            <br />
            今天全台有{" "}
            <span className="font-tabular font-semibold text-[#1b382f]">
              {meta.todayCount.toLocaleString("zh-TW")}
            </span>{" "}
            場公開開庭
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-[#5c574f]">
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
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a href="#subscribe-calendar" className="btn-formal-secondary">
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            <span>訂閱開庭日曆</span>
          </a>
        </div>
      </div>

      {/* Hero Illustration Plate + Anchored Calendar Event Card */}
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

        {/* Floating Live Calendar Event Card — Matched 3-tier priority & 2-ink palette */}
        {current && (
          <div className="mt-4 lg:absolute lg:bottom-5 lg:right-5 lg:mt-0 lg:w-[416px]">
            <div className="overflow-hidden rounded-[2px] border border-[#191816] bg-[#fcfbf8]">
              <div className="flex items-center justify-between border-b border-[#191816] bg-[#191816] px-4 py-2 text-[#fcfbf8]">
                <span className="flex items-center gap-2 text-xs">
                  <span>近期精選開庭</span>
                  <span className="font-tabular text-[#fcfbf8]/65">
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
                <div className="flex w-[104px] shrink-0 flex-col items-center justify-center border-r border-dashed border-[#191816]/25 bg-[#efece4] px-3 py-4 text-center">
                  <span className="text-xs font-medium text-[#5c574f]">
                    {mNum}月 週{weekday}
                  </span>
                  <span className="mt-1 font-editorial text-[34px] leading-none font-semibold text-[#191816]">
                    {dNum}
                  </span>
                  <span className="mt-1 font-tabular text-xs text-[#5c574f]">
                    民{rocYear}/{mStr}/{dStr}
                  </span>
                  <span className="mt-2.5 border border-[#191816]/35 bg-[#fcfbf8] px-2 py-0.5 font-tabular text-sm font-medium text-[#191816]">
                    {current.time}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <HearingLiveStatusBadge
                        date={current.date}
                        time={current.time}
                        category={current.category}
                        isLayJudge={current.isLayJudge}
                        nowMs={nowMs}
                      />
                      {current.isLayJudge && (
                        <span className="border border-[#8f2d1c] px-1.5 py-0.5 font-medium text-[#8f2d1c]">
                          國民法官
                        </span>
                      )}
                      <span className="text-[#5c574f]">
                        {current.dukd} · {current.sysLabel}
                      </span>
                    </div>

                    <Link
                      href={`/hearings/${current.id}`}
                      className="mt-1.5 block font-editorial text-lg leading-snug font-semibold text-[#191816] no-underline hover:underline hover:decoration-1 hover:underline-offset-4"
                    >
                      {current.reason || `${current.sysLabel}${current.dukd}`}
                    </Link>

                    <p className="mt-2 truncate text-sm font-medium text-[#191816]">
                      {current.courtShortName} · {current.courtroom}
                    </p>

                    <p className="mt-0.5 font-tabular text-xs text-[#5c574f]">
                      {current.caseNo}
                    </p>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-[#d6d0c4] pt-3">
                    <button
                      type="button"
                      onClick={handleIcs}
                      className="inline-flex items-center gap-1.5 border border-[#191816]/25 bg-[#f7f5f0] px-2.5 py-1 text-xs font-medium text-[#191816] transition-colors hover:border-[#1b382f] hover:bg-[#1b382f] hover:text-[#fcfbf8]"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>加入行事曆</span>
                    </button>
                    <Link
                      href={`/hearings/${current.id}`}
                      className="inline-flex items-center gap-0.5 text-xs font-medium text-[#191816] underline decoration-[#191816]/35 underline-offset-4 hover:text-[#1b382f]"
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

      {/* Single Calm Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-[#d6d0c4] pb-4 text-sm text-[#5c574f]">
        <p>
          未來 14 天共{" "}
          <strong className="font-tabular font-medium text-[#191816]">
            {meta.totalHearings.toLocaleString("zh-TW")}
          </strong>{" "}
          場公開庭期（含{" "}
          <strong className="font-tabular font-medium text-[#191816]">
            {meta.layJudgeCount}
          </strong>{" "}
          場國民法官），已自動排除調解與不公開案件。
        </p>
        <span className="flex items-center gap-4 text-xs text-[#5c574f]">
          <span className="font-tabular">
            更新於 {formatSyncedAt(meta.syncedAt).slice(5, 16)}
          </span>
          <Link
            href="/about"
            className="font-medium text-[#191816] underline decoration-[#191816]/35 underline-offset-4 hover:text-[#1b382f]"
          >
            資料說明
          </Link>
        </span>
      </div>
    </section>
  );
}
