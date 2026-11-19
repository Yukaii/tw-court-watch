import { ExternalLink, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import {
  GITHUB_REPO_URL,
  LEGISPEDIA_THREAD_URL,
} from "@/components/SiteFooter";
import {
  OFFICIAL_LAY_JUDGE_URL,
  OFFICIAL_LIVE_STATUS_URL,
  OFFICIAL_QUERY_BASE,
} from "@/lib/courts";
import { getHearingsMeta } from "@/lib/data-server";
import { formatDualDate, formatSyncedAt } from "@/lib/date";
import type { NonPublicReason } from "@/lib/types";

export const metadata: Metadata = {
  title: "資料來源與免責聲明",
  description:
    "旁聽小幫手的資料來源、每日定時同步與不公開庭期過濾規則、以及法律與隱私紅線說明。",
};

const REASON_LABELS: Record<NonPublicReason, string> = {
  mediation: "調解／試行調解／調解程序",
  non_public_procedure: "明示不公開或協商程序",
  non_public_room: "調解室／協商室／評議室等非公開空間",
  family: "家事案件（家訴、家非調、婚等字別）",
  juvenile: "少年事件",
  sensitive_case: "依法原則不公開之性侵害／性隱私／兒少案件",
};

export default async function AboutPage() {
  const meta = await getHearingsMeta();

  return (
    <div className="space-y-8">
      <header className="legal-rule-bottom space-y-1.5 pb-5">
        <p className="text-xs font-medium tracking-[0.08em] text-[#8f2d1c]">
          專案說明與資料透明度
        </p>
        <h1 className="font-editorial text-3xl font-semibold text-[#191816]">
          資料來源、過濾規則與免責聲明
        </h1>
        <p className="text-sm text-[#524e47]">
          本網站為民間製作之非官方旁聽輔助工具，旨在使公開審判資訊更為清楚、易於檢索。
        </p>
      </header>

      {/* Credit & Inspiration */}
      <section className="space-y-2.5 rounded-[2px] border border-[#191816]/25 bg-[#efece4] p-6">
        <h2 className="font-editorial text-lg font-semibold text-[#191816]">
          致謝法律百科 @legispedia_tw 的旁聽指南整理
        </h2>
        <p className="text-sm leading-relaxed text-[#524e47]">
          這個專案的起點與站內的旁聽入門守則，受到法律百科在 Threads
          整理分享的「法院旁聽指南」貼文與《法科！輕鬆點》節目啟發。特別在此標註出處並推薦閱讀原文。
        </p>
        <a
          href={LEGISPEDIA_THREAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1b382f] underline decoration-[#1b382f]/40 underline-offset-4 hover:text-[#191816]"
        >
          <span>法律百科 @legispedia_tw — Threads 原文貼文</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </section>

      {/* Data source & sync status */}
      <section className="space-y-4 rounded-[2px] border border-[#191816]/20 bg-[#fcfbf8] p-6">
        <h2 className="border-b border-[#d6d0c4] pb-2.5 font-editorial text-lg font-semibold text-[#191816]">
          資料來源與更新機制
        </h2>
        <p className="text-sm leading-relaxed text-[#3a3630]">
          庭期資料取自司法院「庭期表查詢系統」（
          <a
            href={OFFICIAL_QUERY_BASE}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1b382f] underline underline-offset-4"
          >
            csdi3.judicial.gov.tw
          </a>
          ）公開庭期資訊，每日兩次低頻定時靜態同步（臺灣時間 06:30 與
          18:30），收錄未來十四日全台主要法院尚未開庭之公開庭期。
        </p>

        {meta && (
          <div className="grid gap-px border border-[#d6d0c4] bg-[#d6d0c4] text-sm sm:grid-cols-2">
            <div className="bg-[#f7f5f0] p-3.5">
              <p className="text-xs text-[#706b62]">最近同步時間</p>
              <p className="mt-0.5 font-tabular font-medium text-[#191816]">
                {formatSyncedAt(meta.syncedAt)}
              </p>
            </div>
            <div className="bg-[#f7f5f0] p-3.5">
              <p className="text-xs text-[#706b62]">收錄日期區間</p>
              <p className="mt-0.5 font-medium text-[#191816]">
                {formatDualDate(meta.dateRange.start)} ～{" "}
                {formatDualDate(meta.dateRange.end)}
              </p>
            </div>
            <div className="bg-[#f7f5f0] p-3.5">
              <p className="text-xs text-[#706b62]">收錄法院數／可旁聽筆數</p>
              <p className="mt-0.5 font-medium text-[#191816]">
                全台 {meta.courts.length} 所主要法院 ·{" "}
                {meta.totalHearings.toLocaleString("zh-TW")} 場公開庭期
              </p>
            </div>
            <div className="bg-[#f7f5f0] p-3.5">
              <p className="text-xs text-[#706b62]">本次同步已自動排除</p>
              <p className="mt-0.5 font-medium text-[#8f2d1c]">
                {meta.filterStats.filteredTotal.toLocaleString("zh-TW")}{" "}
                場不公開／調解庭期
              </p>
            </div>
          </div>
        )}

        <p className="text-xs leading-relaxed text-[#706b62]">
          為尊重司法院不長期留存庭期索引之立場，本工具不保存已過期庭期，並於個別庭期頁設定{" "}
          <code className="border border-[#d6d0c4] bg-[#efece4] px-1 py-0.5 font-tabular">
            noindex, nofollow
          </code>
          ，亦絕不蒐集或顯示任何當事人姓名與個資。
        </p>
      </section>

      {/* Transparent filter stats */}
      {meta && (
        <section className="space-y-3 rounded-[2px] border border-[#191816]/20 bg-[#fcfbf8] p-6">
          <h2 className="flex items-center gap-2 border-b border-[#d6d0c4] pb-2.5 font-editorial text-lg font-semibold text-[#191816]">
            <ShieldCheck
              className="h-4 w-4 text-[#1b382f]"
              aria-hidden="true"
            />
            不公開案件自動過濾明細
          </h2>
          <p className="text-sm text-[#524e47]">
            官方民事與刑事庭期表會混入調解、家事與不公開程序。本工具在同步時依以下規則自動排除：
          </p>
          <ul className="divide-y divide-[#d6d0c4] border border-[#d6d0c4] text-sm">
            {(Object.keys(REASON_LABELS) as NonPublicReason[]).map((key) => (
              <li
                key={key}
                className="flex items-center justify-between gap-2 px-4 py-2.5"
              >
                <span className="text-[#3a3630]">{REASON_LABELS[key]}</span>
                <span className="font-tabular text-xs font-medium text-[#191816]">
                  {meta.filterStats.byReason[key].toLocaleString("zh-TW")} 筆
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Disclaimers & legal red lines */}
      <section className="space-y-3 rounded-[2px] border-l-2 border-[#8f2d1c] bg-[#f9f3f1] p-6 text-sm leading-relaxed text-[#3a3630]">
        <h2 className="font-editorial text-base font-semibold text-[#8f2d1c]">
          免責聲明與原則
        </h2>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>
            本系統庭期資料僅供參考，如有闕漏、改期、取消或不符者，一律以法院實際開庭通知單與現場公告為準；若查無庭期，請逕向該管法院查詢。
          </li>
          <li>
            本系統僅提供尚未開庭之未來庭期，不提供歷史庭期查詢，亦不提供法律諮詢或判決預測。
          </li>
          <li>
            家事事件、少年事件、調解與依法不公開案件不得旁聽；即使列入本系統之案件，審判長仍得依法於當庭裁定不公開審理。
          </li>
          <li>
            法庭內嚴禁錄音、錄影、拍照。本工具不做直播、不提供影音上傳，亦不做任何針對法官個人的評分或排行榜。
          </li>
        </ol>
      </section>

      {/* Official resources */}
      <section className="space-y-3 rounded-[2px] border border-[#191816]/20 bg-[#fcfbf8] p-6">
        <h2 className="border-b border-[#d6d0c4] pb-2.5 font-editorial text-base font-semibold text-[#191816]">
          司法院官方查詢管道
        </h2>
        <ul className="space-y-2 text-sm">
          {[
            { label: "司法院庭期表查詢系統（WHD1A03）", href: OFFICIAL_QUERY_BASE },
            {
              label: "國民法官案件庭期表查詢（WHD1A03B）",
              href: OFFICIAL_LAY_JUDGE_URL,
            },
            {
              label: "法院開庭進度查詢系統（當日即時）",
              href: OFFICIAL_LIVE_STATUS_URL,
            },
            { label: "司法院智慧客服小幫手", href: "https://cs.judicial.gov.tw" },
          ].map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-[#1b382f] underline decoration-[#1b382f]/40 underline-offset-4 hover:text-[#191816]"
              >
                <span>{item.label}</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Open source & MIT license */}
      <section className="space-y-2.5 rounded-[2px] border border-[#191816]/20 bg-[#fcfbf8] p-6">
        <h2 className="border-b border-[#d6d0c4] pb-2.5 font-editorial text-base font-semibold text-[#191816]">
          開放原始碼與授權
        </h2>
        <p className="text-sm leading-relaxed text-[#524e47]">
          本網站所有前端介面、資料過濾規則與同步腳本皆以 MIT License
          開放原始碼，歡迎檢視程式、回報問題或協助補充各法院院區與交通資訊。
        </p>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1b382f] underline decoration-[#1b382f]/40 underline-offset-4 hover:text-[#191816]"
        >
          <span>GitHub 儲存庫：Yukaii/tw-court-watch（MIT）</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </section>
    </div>
  );
}
