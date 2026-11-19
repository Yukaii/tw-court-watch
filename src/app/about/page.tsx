import { ExternalLink, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { LEGISPEDIA_THREAD_URL } from "@/components/SiteFooter";
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
    <div className="space-y-6">
      <header className="space-y-1.5 border-b border-[#1c1a17]/15 pb-5">
        <p className="font-tabular text-[11px] font-semibold uppercase tracking-widest text-[#1f4b3b]">
          ABOUT & DATA TRANSPARENCY
        </p>
        <h1 className="font-editorial text-3xl font-bold tracking-tight text-[#1c1a17]">
          資料來源、過濾規則與免責聲明
        </h1>
        <p className="text-sm text-[#5c564c]">
          本網站為民間製作之非官方旁聽輔助工具，旨在讓公開審判資訊更易讀、好查。
        </p>
      </header>

      {/* Credit & Inspiration */}
      <section className="space-y-2.5 rounded-2xl border border-[#1c1a17]/15 bg-[#efe8d8] p-5 sm:p-6">
        <p className="font-tabular text-[11px] font-semibold uppercase tracking-widest text-[#8c381d]">
          CREDIT & INSPIRATION · 專案靈感致謝
        </p>
        <h2 className="font-editorial text-lg font-bold text-[#1c1a17]">
          致謝法律百科 @legispedia_tw 的旁聽攻略整理
        </h2>
        <p className="text-sm leading-relaxed text-[#4a453c]">
          這個專案的起點與網站中的旁聽入門守則，受到法律百科（Legispedia）在
          Threads 上整理分享的「法院旁聽指南」貼文以及《法科！輕鬆點》節目啟發。特別在此標註出處並推薦閱讀原始貼文。
        </p>
        <a
          href={LEGISPEDIA_THREAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-[#1f4b3b] underline decoration-[#1f4b3b]/40 underline-offset-4 hover:text-[#16362b]"
        >
          <span>法律百科 @legispedia_tw — Threads 原文貼文</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </section>

      {/* Data source & sync status */}
      <section className="space-y-3 rounded-2xl border border-[#1c1a17]/15 bg-[#fffdf8] p-5 sm:p-6">
        <h2 className="font-editorial text-lg font-bold text-[#1c1a17]">
          資料來源與更新機制
        </h2>
        <p className="text-sm leading-relaxed text-[#4a453c]">
          庭期資料來自司法院「庭期表查詢系統」（
          <a
            href={OFFICIAL_QUERY_BASE}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1f4b3b] underline underline-offset-2"
          >
            csdi3.judicial.gov.tw
          </a>
          ）之公開庭期資訊，透過每日 2 次低頻靜態同步（台灣時間 06:30 與 18:30）更新未來 14 天全台主要法院之尚未開庭庭期。
        </p>

        {meta && (
          <div className="grid gap-3 rounded-xl border border-[#1c1a17]/10 bg-[#f8f5ee] p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-[#6b6458]">最近同步時間</p>
              <p className="font-tabular font-semibold text-[#1c1a17]">
                {formatSyncedAt(meta.syncedAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#6b6458]">收錄日期區間</p>
              <p className="font-semibold text-[#1c1a17]">
                {formatDualDate(meta.dateRange.start)} ～{" "}
                {formatDualDate(meta.dateRange.end)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#6b6458]">收錄法院數／可旁聽筆數</p>
              <p className="font-semibold text-[#1c1a17]">
                全台 {meta.courts.length} 所主要法院 ·{" "}
                {meta.totalHearings.toLocaleString("zh-TW")} 場公開庭期
              </p>
            </div>
            <div>
              <p className="text-xs text-[#6b6458]">本次同步已自動濾除</p>
              <p className="font-semibold text-[#8c381d]">
                {meta.filterStats.filteredTotal.toLocaleString("zh-TW")}{" "}
                場不公開／調解庭期
              </p>
            </div>
          </div>
        )}

        <p className="text-xs leading-relaxed text-[#6b6458]">
          為尊重司法院不長期留存庭期索引的立場，本工具不保存已過期庭期，並於個別庭期頁設定{" "}
          <code className="rounded bg-[#efe8d8] px-1 py-0.5 font-tabular">
            noindex, nofollow
          </code>
          ，亦絕不蒐集或顯示任何當事人姓名與個資。
        </p>
      </section>

      {/* Transparent filter stats */}
      {meta && (
        <section className="space-y-3 rounded-2xl border border-[#1c1a17]/15 bg-[#fffdf8] p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-editorial text-lg font-bold text-[#1c1a17]">
            <ShieldCheck
              className="h-5 w-5 text-[#1f4b3b]"
              aria-hidden="true"
            />
            不公開案件自動過濾明細
          </h2>
          <p className="text-sm text-[#5c564c]">
            官方民事與刑事庭期表會混入調解、家事與不公開程序。本工具在同步時依以下規則自動排除：
          </p>
          <ul className="divide-y divide-[#1c1a17]/10 rounded-xl border border-[#1c1a17]/10 text-sm">
            {(Object.keys(REASON_LABELS) as NonPublicReason[]).map((key) => (
              <li
                key={key}
                className="flex items-center justify-between gap-2 px-4 py-2.5"
              >
                <span className="text-[#4a453c]">{REASON_LABELS[key]}</span>
                <span className="font-tabular text-xs font-semibold text-[#1c1a17]">
                  {meta.filterStats.byReason[key].toLocaleString("zh-TW")} 筆
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Disclaimers & legal red lines */}
      <section className="space-y-3 rounded-2xl border border-[#b85432]/30 bg-[#fbf2ee] p-5 text-sm leading-relaxed text-[#432318] sm:p-6">
        <h2 className="font-editorial text-base font-bold text-[#8c381d]">
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
      <section className="space-y-2 rounded-2xl border border-[#1c1a17]/15 bg-[#fffdf8] p-5 sm:p-6">
        <h2 className="font-editorial text-base font-bold text-[#1c1a17]">
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
                className="inline-flex items-center gap-1.5 font-medium text-[#1f4b3b] underline decoration-[#1f4b3b]/40 underline-offset-4 hover:text-[#16362b]"
              >
                <span>{item.label}</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
