import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Scale,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { HearingCard } from "@/components/HearingCard";
import { POPULAR_COURTS } from "@/lib/courts";
import { getHearingsMeta, getHighlightsData } from "@/lib/data-server";
import { addDaysIso, formatDualDate, formatSyncedAt } from "@/lib/date";

export default async function HomePage() {
  const [meta, highlights] = await Promise.all([
    getHearingsMeta(),
    getHighlightsData(),
  ]);

  if (!meta || !highlights) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <h1 className="text-xl font-bold text-stone-900">
          尚未同步庭期資料
        </h1>
        <p className="mt-2 text-sm text-stone-600">
          請先執行 <code className="rounded bg-stone-100 px-1.5 py-0.5">bun run sync</code>{" "}
          同步司法院公開庭期表。
        </p>
      </div>
    );
  }

  const today = meta.todayDate;
  const tomorrow = addDaysIso(today, 1);
  const weekEnd = addDaysIso(today, 6);
  const courtMap = Object.fromEntries(meta.courts.map((c) => [c.crtid, c]));

  const todayTrials = highlights.featuredTrials
    .filter((h) => h.date === today)
    .slice(0, 6);
  const upcomingTrials =
    todayTrials.length > 0
      ? todayTrials
      : highlights.featuredTrials.slice(0, 6);

  const upcomingLayJudge = highlights.layJudgeHearings.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero: Data & Date picker first (no courthouse photo decoration) */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-900">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {formatDualDate(today)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            更新於 {formatSyncedAt(meta.syncedAt)}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          今天全台主要法院有{" "}
          <span className="text-emerald-800">
            {meta.todayCount.toLocaleString("zh-TW")}
          </span>{" "}
          場可旁聽庭期
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
          已自動濾除調解、不公開程序、家事與少年事件（共濾除{" "}
          {meta.filterStats.filteredTotal.toLocaleString("zh-TW")} 筆），幫你在 3
          分鐘內挑出今天或這週值得坐進去旁聽的開庭場次。
        </p>

        {/* Quick date & action entry */}
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/search?court=TPD&start=${today}&end=${today}&category=trial`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            看今天審理／辯論庭
          </Link>
          <Link
            href={`/search?court=TPD&start=${tomorrow}&end=${tomorrow}&category=trial`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            看明天
          </Link>
          <Link
            href={`/search?court=TPD&start=${today}&end=${weekEnd}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            未來 7 天（{meta.totalHearings.toLocaleString("zh-TW")} 場 / 14 天）
          </Link>
          <Link
            href={`/search?mode=layjudge&start=${today}&end=${meta.dateRange.end}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-950 hover:bg-amber-100"
          >
            <Sparkles className="h-4 w-4 text-amber-700" aria-hidden="true" />
            國民法官專區（{meta.layJudgeCount} 場）
          </Link>
        </div>

        {/* Popular court shortcuts */}
        <div className="mt-5 border-t border-stone-100 pt-4">
          <p className="text-xs font-semibold text-stone-500">
            熱門法院快捷（點一下直接看未來 7 天）：
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {POPULAR_COURTS.map((c) => {
              const stats = courtMap[c.crtid];
              return (
                <Link
                  key={c.crtid}
                  href={`/search?court=${c.crtid}&start=${today}&end=${weekEnd}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-800 transition-colors hover:border-emerald-700/50 hover:bg-emerald-50 hover:text-emerald-950"
                >
                  <span>{c.shortName}</span>
                  {stats && (
                    <span className="text-stone-400">
                      今日 {stats.today}
                    </span>
                  )}
                </Link>
              );
            })}
            <Link
              href="/search"
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 hover:border-stone-400 hover:text-stone-900"
            >
              全部 {meta.courts.length} 所主要法院 →
            </Link>
          </div>
        </div>
      </section>

      {/* First-timer quick banner */}
      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-5 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            第一次去法院旁聽？
          </p>
          <h2 className="text-base font-bold text-stone-900">
            不用預約、不用門票，只要遵守 6 個基本規則就能走進旁聽席
          </h2>
          <p className="text-sm text-stone-600">
            過安檢門與 X 光、門開即可入座、法官入庭與宣判要起立、嚴禁錄音錄影拍照、可帶紙筆做筆記。
          </p>
        </div>
        <Link
          href="/guide"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-950"
        >
          <span>看 3 分鐘新手指南</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>

      {/* Featured Trials */}
      <section className="space-y-3.5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-stone-900">
              <Scale className="h-5 w-5 text-emerald-800" aria-hidden="true" />
              {todayTrials.length > 0
                ? "今日精選：審理與言詞辯論庭"
                : "近期精選：審理與言詞辯論庭"}
            </h2>
            <p className="text-sm text-stone-500">
              優先挑選有實質攻防與辯論的「審理／言詞辯論」庭期（避開 30 秒快閃宣判）。
            </p>
          </div>
          <Link
            href={`/search?court=TPD&start=${today}&end=${weekEnd}&category=trial`}
            className="text-sm font-semibold text-emerald-800 hover:text-emerald-950"
          >
            查看更多 →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {upcomingTrials.map((h) => (
            <HearingCard key={h.id} hearing={h} showCourt />
          ))}
        </div>
      </section>

      {/* Lay Judge Spotlight */}
      {upcomingLayJudge.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-stone-900">
                <Sparkles className="h-5 w-5 text-amber-600" aria-hidden="true" />
                即將開庭：全台國民法官案件
              </h2>
              <p className="text-sm text-stone-500">
                國民法官法庭節奏清楚、白話度高，非常適合一般民眾旁聽體驗（熱門場次可能需現場領旁聽證）。
              </p>
            </div>
            <Link
              href={`/search?mode=layjudge&start=${today}&end=${meta.dateRange.end}`}
              className="text-sm font-semibold text-amber-800 hover:text-amber-950"
            >
              看全部 {meta.layJudgeCount} 場 →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {upcomingLayJudge.map((h) => (
              <HearingCard key={h.id} hearing={h} showCourt />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
