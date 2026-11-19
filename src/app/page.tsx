import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { CalendarEventCard } from "@/components/CalendarEventCard";
import { CalendarSubscribeCard } from "@/components/CalendarSubscribeCard";
import { HomeCalendarExplorer } from "@/components/HomeCalendarExplorer";
import { HomeHeroShowcase } from "@/components/HomeHeroShowcase";
import { LEGISPEDIA_THREAD_URL } from "@/components/SiteFooter";
import { getHearingsMeta, getHighlightsData } from "@/lib/data-server";
import type { Hearing } from "@/lib/types";

const ESSENTIAL_RULES = [
  {
    num: "一",
    title: "免預約、先過安檢",
    body: "提早 15 分鐘到法院通過安檢門與 X 光，法庭門開著就能走進後方旁聽席。",
    alert: false,
  },
  {
    num: "二",
    title: "法官進場請起立",
    body: "法官入庭、退庭與宣判時，跟著通譯或法警提醒起身致意即可。",
    alert: false,
  },
  {
    num: "三",
    title: "嚴禁錄音、錄影與拍照",
    body: "開庭中不可拍攝或錄音（沒開閃光燈也不行），手機請關靜音，勿飲食交談。",
    alert: true,
  },
  {
    num: "四",
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
      <div className="rounded-[2px] border border-[#191816]/25 bg-[#fcfbf8] p-8 text-center">
        <h1 className="font-editorial text-xl font-semibold text-[#191816]">
          尚未同步庭期資料
        </h1>
        <p className="mt-2 text-sm text-[#524e47]">
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
    <div className="space-y-14">
      {/* 1. Masthead + Hero Illustration + Floating Calendar Event Card */}
      <HomeHeroShowcase meta={meta} spotlightHearings={spotlightHearings} />

      {/* 2. Interactive 14-Day Calendar Strip & 4 Featured Calendar Event Cards */}
      <HomeCalendarExplorer meta={meta} highlights={highlights} />

      {/* 3. One-click Calendar Subscription */}
      <CalendarSubscribeCard meta={meta} />

      {/* 4. Lay Judge Spotlight (2 crisp cards for calm pacing) */}
      {upcomingLayJudge.length > 0 && (
        <section className="rounded-[2px] border border-[#191816] bg-[#162822] px-5 py-7 text-[#fcfbf8] sm:px-8 sm:py-9">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#fcfbf8]/20 pb-4">
            <div className="space-y-1">
              <h2 className="font-editorial text-2xl font-semibold text-[#fcfbf8]">
                國民法官專區
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-[#fcfbf8]/75">
                審理節奏清楚、說明白話，特別適合第一次走進法院旁聽的民眾（熱門場次可能需現場領取旁聽證）。
              </p>
            </div>

            <Link
              href={`/search?mode=layjudge&start=${today}&end=${meta.dateRange.end}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-[2px] border border-[#d4b06a] bg-[#d4b06a] px-4 py-2 text-sm font-medium text-[#13241e] transition-colors hover:bg-[#e3c381]"
            >
              <span>看全部 {meta.layJudgeCount} 場</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 grid gap-3.5 md:grid-cols-2">
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

      {/* 5. Concise 4-Point Observer Essentials + @legispedia_tw Credit */}
      <section className="space-y-6">
        <div className="legal-rule-bottom flex flex-wrap items-end justify-between gap-3 pb-3">
          <div>
            <h2 className="font-editorial text-2xl font-semibold text-[#191816]">
              第一次旁聽？記住這四件事
            </h2>
            <p className="mt-1 text-sm text-[#524e47]">
              公開審判是憲法保障的公民權利，遵守基本法庭禮儀就能安心入座。
            </p>
          </div>
          <Link
            href="/guide"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#1b382f] underline decoration-[#1b382f]/40 underline-offset-4 hover:text-[#191816]"
          >
            <span>完整旁聽指南與庭類說明</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-px border border-[#191816]/25 bg-[#d6d0c4] sm:grid-cols-2 lg:grid-cols-4">
          {ESSENTIAL_RULES.map((rule) => (
            <div
              key={rule.num}
              className={`p-5 ${rule.alert ? "bg-[#f9f3f1]" : "bg-[#fcfbf8]"}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-editorial text-xs font-semibold ${
                    rule.alert ? "text-[#8f2d1c]" : "text-[#1b382f]"
                  }`}
                >
                  {rule.num}、
                </span>
                {rule.alert && (
                  <span className="border border-[#8f2d1c] px-1.5 py-0.5 text-[10px] font-semibold text-[#8f2d1c]">
                    紅線
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-editorial text-base font-semibold text-[#191816]">
                {rule.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#524e47]">
                {rule.body}
              </p>
            </div>
          ))}
        </div>

        {/* Compact, Respectful Credit Strip */}
        <div className="flex flex-col justify-between gap-3 rounded-[2px] border border-[#d6d0c4] bg-[#efece4] px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-sm leading-relaxed text-[#524e47]">
            <strong className="font-semibold text-[#191816]">
              靈感與整理致謝：
            </strong>
            本專案發想與旁聽入門守則參考自法律百科{" "}
            <span className="font-tabular text-[#1b382f]">@legispedia_tw</span>{" "}
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
