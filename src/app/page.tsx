import {
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { CalendarEventCard } from "@/components/CalendarEventCard";
import { CalendarSubscribeCard } from "@/components/CalendarSubscribeCard";
import { HomeCalendarExplorer } from "@/components/HomeCalendarExplorer";
import { HomeHeroShowcase } from "@/components/HomeHeroShowcase";
import { LEGISPEDIA_THREAD_URL } from "@/components/SiteFooter";
import { COURT_LEVEL_LABELS } from "@/lib/courts";
import { getHearingsMeta, getHighlightsData } from "@/lib/data-server";
import { addDaysIso } from "@/lib/date";
import { HEARING_CATEGORY_META } from "@/lib/filter";
import type { CourtLevel, Hearing } from "@/lib/types";

const SIX_RULES = [
  {
    num: "01",
    title: "免預約、免門票，提早過安檢",
    body: "一般公開法庭直接走進去即可。進法院大門需過金屬探測門與 X 光機，建議比預定時間提早 15 分鐘抵達。",
    alert: false,
  },
  {
    num: "02",
    title: "門開著就能安靜走進旁聽席",
    body: "先看門外電子看板確認案號，只要沒標示「不公開」或「需領旁聽證」，輕推開門坐進後方旁聽席即可。",
    alert: false,
  },
  {
    num: "03",
    title: "法官進場、退庭與宣判請起立",
    body: "聽到通譯或法警喊「起立」時跟著現場起身致意即可，不用緊張，坐下後靜心聽審。",
    alert: false,
  },
  {
    num: "04",
    title: "庭內嚴禁錄音、錄影、拍照",
    body: "依《法院組織法》這是絕對紅線——開庭中不可拍攝或錄音（沒開閃光燈也不行），進庭前請直接收起手機。",
    alert: true,
  },
  {
    num: "05",
    title: "手機靜音、禁飲食、禁喧嘩鼓掌",
    body: "手機請關靜音（連震動一併關閉），庭內不得飲食、交談、鼓掌或出聲評論，維持莊重審理秩序。",
    alert: false,
  },
  {
    num: "06",
    title: "可以帶紙本筆記本與筆做筆記",
    body: "旁聽席歡迎手寫記錄爭點與問答順序！觀庭後也能回到本網站寫下只存本機的個人觀庭筆記。",
    alert: false,
  },
] as const;

const LEVEL_ORDER: CourtLevel[] = ["supreme", "high", "admin_ip", "district"];

/**
 * Pick up to 6 diverse spotlight hearings for the hero Calendar Event Card:
 * prefer non-empty human-readable `reason`, include at least 1–2 upcoming
 * 國民法官 hearings, and spread across major courts.
 */
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

  // 1. Up to 2 upcoming 國民法官 hearings with clear reasons
  for (const h of layJudgeHearings) {
    if (picked.length >= 2) break;
    if (h.reason) pushIfNew(h);
  }

  // 2. Diverse popular trial/debate hearings with non-empty reasons
  for (const h of featuredTrials) {
    if (picked.length >= 6) break;
    if (h.reason) pushIfNew(h);
  }

  // 3. Fill remaining slots if needed (allow same court or fallback reason)
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
      <div className="rounded-2xl border border-[#1c1a17]/15 bg-[#fffdf8] p-8 text-center">
        <h1 className="font-editorial text-xl font-bold text-[#1c1a17]">
          尚未同步庭期資料
        </h1>
        <p className="mt-2 text-sm text-[#5c564c]">
          請先執行{" "}
          <code className="rounded bg-[#efe8d8] px-1.5 py-0.5 font-tabular text-xs">
            bun run sync
          </code>{" "}
          同步司法院公開庭期表。
        </p>
      </div>
    );
  }

  const today = meta.todayDate;
  const weekEnd = addDaysIso(today, 6);
  const spotlightHearings = pickSpotlightHearings(
    highlights.featuredTrials,
    highlights.layJudgeHearings,
  );
  const upcomingLayJudge = highlights.layJudgeHearings.slice(0, 4);

  const courtsByLevel = LEVEL_ORDER.map((level) => ({
    level,
    label: COURT_LEVEL_LABELS[level],
    courts: meta.courts.filter((c) => c.level === level),
  })).filter((g) => g.courts.length > 0);

  return (
    <div className="space-y-16">
      {/* Band 1: Editorial Hero + Huge Courtroom Illustration + Floating Calendar Event Card */}
      <HomeHeroShowcase meta={meta} spotlightHearings={spotlightHearings} />

      {/* Band 2: Interactive 14-Day Calendar Strip & Calendar Event Cards */}
      <HomeCalendarExplorer meta={meta} highlights={highlights} />

      {/* Band 2.5: Subscribe via Google Calendar / Apple Calendar / iCal feed */}
      <CalendarSubscribeCard meta={meta} />

      {/* Band 3: Contrasting Forest-Ink Editorial Band — 國民法官專區 */}
      {upcomingLayJudge.length > 0 && (
        <section className="rounded-2xl border border-[#1c1a17]/15 bg-[#173026] px-5 py-8 text-[#f6f2e9] shadow-[0_24px_50px_-28px_rgba(23,48,38,0.55)] sm:px-8 sm:py-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#f6f2e9]/15 pb-5">
            <div className="space-y-1.5">
              <p className="inline-flex items-center gap-1.5 font-tabular text-[11px] font-semibold uppercase tracking-widest text-[#e9b949]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                CITIZEN JUDGE SPOTLIGHT · 國民法官專區
              </p>
              <h2 className="font-editorial text-2xl font-bold text-[#fffdf8] sm:text-3xl">
                最適合第一次走進法院的國民法官審理
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-[#f6f2e9]/75">
                為了讓素人民眾能理解案情，檢辯雙方在國民法官法庭會大量使用白話簡報與清晰爭點整理。熱門場次可能需要現場領取旁聽證，建議提早確認該法院公告。
              </p>
            </div>

            <Link
              href={`/search?mode=layjudge&start=${today}&end=${meta.dateRange.end}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#e9b949] px-4 py-2.5 text-sm font-semibold text-[#152d24] transition-colors hover:bg-[#f2ca68]"
            >
              <span>查看全部 {meta.layJudgeCount} 場</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-6 grid gap-3.5 md:grid-cols-2">
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

      {/* Band 4: Editorial Numbered 01–06 旁聽守則 + Procedure Guide + @legispedia_tw Credit */}
      <section className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#1c1a17]/15 pb-3">
          <div>
            <p className="font-tabular text-[11px] font-semibold uppercase tracking-widest text-[#b85432]">
              COURTROOM CODE · 旁聽守則
            </p>
            <h2 className="mt-0.5 font-editorial text-2xl font-bold text-[#1c1a17] sm:text-3xl">
              第一次走進法庭？記住這 6 條守則就夠了
            </h2>
          </div>
          <Link
            href="/guide"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#1f4b3b] hover:text-[#b85432]"
          >
            <span>完整 3 分鐘旁聽指南</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {/* 01–06 Hairline Editorial Grid */}
        <div className="grid gap-px overflow-hidden rounded-xl border border-[#1c1a17]/15 bg-[#1c1a17]/12 sm:grid-cols-2 lg:grid-cols-3">
          {SIX_RULES.map((rule) => (
            <div
              key={rule.num}
              className={`flex flex-col justify-between p-5 ${
                rule.alert ? "bg-[#fbf2ee]" : "bg-[#fffdf8]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`font-tabular text-xs font-bold tracking-widest ${
                      rule.alert ? "text-[#b85432]" : "text-[#1f4b3b]"
                    }`}
                  >
                    RULE {rule.num}
                  </span>
                  {rule.alert && (
                    <span className="rounded-sm bg-[#b85432] px-1.5 py-0.5 text-[10px] font-bold text-[#fffdf8]">
                      絕對紅線
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-editorial text-lg font-bold text-[#1c1a17]">
                  {rule.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#5c564c]">
                  {rule.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Procedure Decoder + Dedicated Attribution Card */}
        <div className="grid gap-4 lg:grid-cols-12">
          {/* 3-tier procedure decoder */}
          <div className="rounded-xl border border-[#1c1a17]/15 bg-[#fffdf8] p-5 lg:col-span-7">
            <p className="font-tabular text-[11px] font-semibold uppercase tracking-widest text-[#1f4b3b]">
              HOW TO PICK A HEARING · 看懂庭類不踩雷
            </p>
            <div className="mt-3.5 grid gap-3 sm:grid-cols-3">
              {(["trial", "prep", "verdict"] as const).map((key) => {
                const info = HEARING_CATEGORY_META[key];
                return (
                  <div
                    key={key}
                    className={`rounded-lg border p-3.5 ${
                      info.recommended
                        ? "border-[#1f4b3b]/35 bg-[#f2f7f4]"
                        : "border-[#1c1a17]/12 bg-[#f8f5ee]"
                    }`}
                  >
                    <p className="font-editorial text-sm font-bold text-[#1c1a17]">
                      {info.label}
                    </p>
                    <p className="mt-0.5 font-tabular text-[11px] font-semibold text-[#1f4b3b]">
                      {info.durationHint}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#5c564c]">
                      {info.beginnerHint}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dedicated Credit / Attribution Card to @legispedia_tw Threads post */}
          <aside className="flex flex-col justify-between rounded-xl border border-[#1c1a17]/15 bg-[#efe8d8] p-5 lg:col-span-5">
            <div className="space-y-2">
              <p className="font-tabular text-[11px] font-semibold uppercase tracking-widest text-[#8c381d]">
                CREDIT & INSPIRATION · 致謝與靈感來源
              </p>
              <h3 className="font-editorial text-lg font-bold text-[#1c1a17]">
                感謝法律百科{" "}
                <span className="font-tabular text-base text-[#1f4b3b]">
                  @legispedia_tw
                </span>{" "}
                整理旁聽入門指南
              </h3>
              <p className="text-sm leading-relaxed text-[#4a453c]">
                本專案的發想與上方旁聽基本守則，源自法律百科在 Threads
                上整理的旁聽攻略貼文（及《法科！輕鬆點》節目分享）。推薦讀讀原文串文與底下的實戰討論！
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#1c1a17]/12 pt-3.5">
              <a
                href={LEGISPEDIA_THREAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1c1a17] px-3.5 py-2 text-xs font-semibold text-[#f6f2e9] transition-colors hover:bg-[#1f4b3b]"
              >
                <span>閱讀 Threads 原文</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <Link
                href="/about"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1f4b3b] hover:text-[#b85432]"
              >
                <span>過濾原則與免責聲明</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Band 5: Compact 38-Court Typographic Directory */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#1c1a17]/15 pb-3">
          <div>
            <p className="font-tabular text-[11px] font-semibold uppercase tracking-widest text-[#1f4b3b]">
              COURT DIRECTORY · 全台法院索引
            </p>
            <h2 className="mt-0.5 font-editorial text-2xl font-bold text-[#1c1a17]">
              全台 {meta.courts.length} 所主要法院未來 7 天庭期入口
            </h2>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#1f4b3b] hover:text-[#b85432]"
          >
            <span>開啟完整搜尋頁</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="space-y-5 rounded-xl border border-[#1c1a17]/15 bg-[#fffdf8] p-5 sm:p-6">
          {courtsByLevel.map((group) => (
            <div key={group.level} className="space-y-2">
              <h3 className="font-tabular text-[11px] font-semibold uppercase tracking-wider text-[#6b6458]">
                {group.label}（{group.courts.length}）
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {group.courts.map((court) => (
                  <Link
                    key={court.crtid}
                    href={`/search?court=${court.crtid}&start=${today}&end=${weekEnd}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#1c1a17]/12 bg-[#f8f5ee] px-2.5 py-1 text-xs font-medium text-[#1c1a17] transition-colors hover:border-[#1f4b3b] hover:bg-[#1f4b3b] hover:text-[#f6f2e9]"
                  >
                    <span>{court.shortName}</span>
                    <span className="font-tabular text-[10px] opacity-65">
                      {court.today > 0 ? `今${court.today}` : `${court.total}`}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
