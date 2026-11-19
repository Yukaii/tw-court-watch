import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { CalendarEventCard } from "@/components/CalendarEventCard";
import { CalendarSubscribeCard } from "@/components/CalendarSubscribeCard";
import { CourtMapExplorer } from "@/components/CourtMapExplorer";
import { HomeCalendarExplorer } from "@/components/HomeCalendarExplorer";
import { HomeHeroShowcase } from "@/components/HomeHeroShowcase";
import { LEGISPEDIA_THREAD_URL } from "@/components/SiteFooter";
import { getHearingsMeta, getHighlightsData } from "@/lib/data-server";
import type { Hearing } from "@/lib/types";

const ESSENTIAL_RULES = [
  {
    num: "一、",
    title: "免預約、先過安檢",
    body: "提早 15 分鐘到法院通過安檢門與 X 光，法庭門開著就能走進後方旁聽席。",
    alert: false,
  },
  {
    num: "二、",
    title: "法官進場請起立",
    body: "法官入庭、退庭與宣判時，跟著通譯或法警提醒起身致意即可。",
    alert: false,
  },
  {
    num: "三、",
    title: "嚴禁錄音、錄影與拍照",
    body: "開庭中不可拍攝或錄音（沒開閃光燈也不行），手機請關靜音，勿飲食交談。",
    alert: true,
  },
  {
    num: "四、",
    title: "可帶紙筆做筆記",
    body: "旁聽席可以用紙本筆記本記錄過程；初次旁聽建議優先選「審理」或「言詞辯論」。",
    alert: false,
  },
] as const;

function pickSpotlightHearings(
  featuredTrials: Hearing[],
  layJudgeHearings: Hearing[],
): Hearing[] {
  const picked: Hearing[] = [];
  const seenIds = new Set<string>();
  const seenCourts = new Set<string>();

  const pushIfNew = (h: Hearing, allowSameCourt = false) => {
    if (seenIds.has(h.id)) return false;
    if (!allowSameCourt && seenCourts.has(h.crtid)) return false;
    seenIds.add(h.id);
    seenCourts.add(h.crtid);
    picked.push(h);
    return true;
  };

  for (const h of layJudgeHearings) {
    if (picked.length >= 2) break;
    if (h.reason) pushIfNew(h);
  }

  for (const h of featuredTrials) {
    if (picked.length >= 6) break;
    if (h.reason) pushIfNew(h);
  }

  for (const h of [...layJudgeHearings, ...featuredTrials]) {
    if (picked.length >= 6) break;
    pushIfNew(h, true);
  }

  return picked;
}

export default async function HomePage() {
  const [meta, highlights] = await Promise.all([
    getHearingsMeta(),
    getHighlightsData(),
  ]);

  if (!meta || !highlights) {
    return (
      <div className="rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center">
        <h1 className="font-editorial text-xl font-semibold text-[var(--ink)]">
          尚未同步庭期資料
        </h1>
        <p className="mt-2 text-base text-[var(--ink-secondary)]">
          請稍後重新整理，或前往司法院庭期表查詢系統確認最新開庭資訊。
        </p>
      </div>
    );
  }

  const today = meta.todayDate;
  const spotlightHearings = pickSpotlightHearings(
    highlights.featuredTrials,
    highlights.layJudgeHearings,
  );
  const upcomingLayJudge = highlights.layJudgeHearings.slice(0, 2);

  return (
    <div className="space-y-16">
      {/* 1. Masthead + Hero Illustration + Floating Calendar Event Card */}
      <HomeHeroShowcase meta={meta} spotlightHearings={spotlightHearings} />

      {/* 2. Interactive 14-Day Calendar Strip & 4 Featured Calendar Event Cards */}
      <HomeCalendarExplorer meta={meta} highlights={highlights} />

      {/* 3. Interactive Judicial-Gazette Map to Find the Nearest Court */}
      <CourtMapExplorer meta={meta} />

      {/* 4. One-click Calendar Subscription */}
      <CalendarSubscribeCard meta={meta} />

      {/* 5. Lay Judge Spotlight */}
      {upcomingLayJudge.length > 0 && (
        <section className="rounded-[2px] border border-[#191816] bg-[#162822] px-6 py-8 text-[#fcfbf8] sm:px-9 sm:py-10 dark:border-[#2e4a40]">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#fcfbf8]/20 pb-5">
            <div className="space-y-1.5">
              <h2 className="font-editorial text-2xl font-semibold text-[#fcfbf8] sm:text-[28px]">
                國民法官專區
              </h2>
              <p className="max-w-xl text-[15px] leading-relaxed text-[#fcfbf8]/75">
                審理節奏清楚、說明白話，特別適合第一次走進法院旁聽的民眾（熱門場次可能需現場領取旁聽證）。
              </p>
            </div>

            <Link
              href={`/search?mode=layjudge&start=${today}&end=${meta.dateRange.end}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-[2px] border border-[#fcfbf8]/40 bg-[#fcfbf8] px-4 py-2 text-sm font-medium text-[#13241e] transition-colors hover:bg-[#efece4]"
            >
              <span>看全部 {meta.layJudgeCount} 場</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {upcomingLayJudge.map((hearing) => (
              <CalendarEventCard
                key={hearing.id}
                hearing={hearing}
                variant="dark"
                showCourt
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Concise 4-Point Observer Essentials + Credit */}
      <section className="space-y-6">
        <div className="legal-rule-bottom flex flex-wrap items-end justify-between gap-3 pb-3.5">
          <div>
            <h2 className="font-editorial text-2xl font-semibold text-[var(--ink)] sm:text-[28px]">
              第一次旁聽？記住這四件事
            </h2>
            <p className="mt-1 text-[15px] text-[var(--ink-secondary)]">
              公開審判是憲法保障的公民權利，遵守基本法庭禮儀就能安心入座。
            </p>
          </div>
          <Link
            href="/guide"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--ink)] underline decoration-[var(--border-medium)] underline-offset-4 hover:text-[var(--robe-text)]"
          >
            <span>完整旁聽指南與庭類說明</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-px border border-[var(--border-subtle)] bg-[var(--rule)] sm:grid-cols-2">
          {ESSENTIAL_RULES.map((rule) => (
            <div
              key={rule.num}
              className={`p-6 sm:p-7 ${rule.alert ? "bg-[var(--bg-alert)]" : "bg-[var(--bg-surface)]"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-editorial text-lg font-semibold text-[var(--ink)]">
                  <span className="mr-1 text-[var(--ink-secondary)]">
                    {rule.num}
                  </span>
                  {rule.title}
                </h3>
                {rule.alert && (
                  <span className="shrink-0 border border-[var(--seal-text)] px-2 py-0.5 text-xs font-medium text-[var(--seal-text)]">
                    紅線
                  </span>
                )}
              </div>
              <p className="mt-2.5 text-[15px] leading-relaxed text-[var(--ink-secondary)]">
                {rule.body}
              </p>
            </div>
          ))}
        </div>

        {/* Compact Credit Strip */}
        <div className="flex flex-col justify-between gap-3 rounded-[2px] border border-[var(--rule)] bg-[var(--bg-tint)] px-6 py-4 sm:flex-row sm:items-center">
          <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
            <strong className="font-semibold text-[var(--ink)]">
              靈感與整理致謝：
            </strong>
            本專案發想與旁聽入門守則參考自法律百科{" "}
            <span className="font-tabular text-[var(--ink)]">
              @legispedia_tw
            </span>{" "}
            於 Threads 分享的旁聽指南整理。
          </p>
          <a
            href={LEGISPEDIA_THREAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-formal-ink shrink-0"
          >
            <span>閱讀 Threads 原文</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}
