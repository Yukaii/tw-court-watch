import { ArrowRight, ArrowUpRight, ExternalLink } from "lucide-react";
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
    clause: "第一條",
    title: "免預約、免門票，提早通過安檢",
    body: "一般公開法庭無須事先預約。進入法院大門須通過金屬探測門與隨身物品 X 光檢查，建議於開庭前 15 分鐘抵達。",
    alert: false,
  },
  {
    clause: "第二條",
    title: "庭門敞開即可靜步入座旁聽席",
    body: "先確認門外電子看板案號；凡未標示「不公開審理」或「須領旁聽證」者，輕推開門坐入後方旁聽席即可。",
    alert: false,
  },
  {
    clause: "第三條",
    title: "法官入庭、退庭及宣判時起立",
    body: "聽聞通譯或法警宣示「起立」時，隨現場人員一同起身致意，隨後靜坐聽審即可。",
    alert: false,
  },
  {
    clause: "第四條",
    title: "庭內嚴禁錄音、錄影及拍照",
    body: "依《法院組織法》及法庭旁聽規則，開庭期間一律禁止任何攝影與錄音行為（未開閃光燈亦同），入庭前請妥善收起手機。",
    alert: true,
  },
  {
    clause: "第五條",
    title: "手機靜音、禁飲食、禁喧嘩鼓掌",
    body: "入庭前請將手機切換為完全靜音；庭內不得飲食、交談、鼓掌或出聲評論，以維法庭莊重與審理秩序。",
    alert: false,
  },
  {
    clause: "第六條",
    title: "得攜帶紙本筆記本與筆記錄",
    body: "旁聽席可自由手寫記錄程序進行與爭點脈絡；散庭後亦可於本網站撰寫僅留存於本機之個人觀庭筆記。",
    alert: false,
  },
] as const;

const LEVEL_ORDER: CourtLevel[] = ["supreme", "high", "admin_ip", "district"];

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
          請先執行{" "}
          <code className="border border-[#d6d0c4] bg-[#efece4] px-1.5 py-0.5 font-tabular text-xs">
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
      {/* Masthead + Editorial Plate + Anchored Docket Pass */}
      <HomeHeroShowcase meta={meta} spotlightHearings={spotlightHearings} />

      {/* 壹、未來十四日開庭日曆 */}
      <HomeCalendarExplorer meta={meta} highlights={highlights} />

      {/* 貳、行事曆訂閱服務 */}
      <CalendarSubscribeCard meta={meta} />

      {/* 參、國民法官審理專區（深墨法袍色對比區塊） */}
      {upcomingLayJudge.length > 0 && (
        <section className="rounded-[2px] border border-[#191816] bg-[#162822] px-5 py-8 text-[#fcfbf8] sm:px-8 sm:py-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#fcfbf8]/20 pb-5">
            <div className="space-y-1.5">
              <p className="text-xs font-medium tracking-[0.08em] text-[#d4b06a]">
                參、國民法官審理專區
              </p>
              <h2 className="font-editorial text-2xl font-semibold text-[#fcfbf8] sm:text-[28px]">
                最適合初次旁聽的國民法官法庭
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-[#fcfbf8]/75">
                國民法官制度強調審理集中與程序透明，檢辯雙方均以白話簡報說明爭點，極適合一般公民實地觀摩。熱門場次或須現場領取旁聽證，請於出發前留意該管法院公告。
              </p>
            </div>

            <Link
              href={`/search?mode=layjudge&start=${today}&end=${meta.dateRange.end}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-[2px] border border-[#d4b06a] bg-[#d4b06a] px-4 py-2 text-sm font-medium tracking-[0.03em] text-[#13241e] transition-colors hover:bg-[#e3c381]"
            >
              <span>查閱全部 {meta.layJudgeCount} 場</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
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

      {/* 肆、法庭旁聽守則 + 庭類辨識 + 致謝來源 */}
      <section className="space-y-8">
        <div className="legal-rule-bottom flex flex-wrap items-end justify-between gap-3 pb-3">
          <div>
            <p className="text-xs font-medium tracking-[0.08em] text-[#8f2d1c]">
              肆、法庭旁聽守則
            </p>
            <h2 className="mt-1 font-editorial text-2xl font-semibold text-[#191816] sm:text-[28px]">
              初次進入法庭須知六則
            </h2>
          </div>
          <Link
            href="/guide"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#1b382f] underline decoration-[#1b382f]/40 underline-offset-4 hover:text-[#191816]"
          >
            <span>閱讀完整旁聽指南</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Formal 6-clause hairline grid */}
        <div className="grid gap-px border border-[#191816]/25 bg-[#d6d0c4] sm:grid-cols-2 lg:grid-cols-3">
          {SIX_RULES.map((rule) => (
            <div
              key={rule.clause}
              className={`flex flex-col justify-between p-5 ${
                rule.alert ? "bg-[#f9f3f1]" : "bg-[#fcfbf8]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#d6d0c4] pb-2">
                  <span
                    className={`font-editorial text-xs font-semibold tracking-[0.08em] ${
                      rule.alert ? "text-[#8f2d1c]" : "text-[#1b382f]"
                    }`}
                  >
                    {rule.clause}
                  </span>
                  {rule.alert && (
                    <span className="border border-[#8f2d1c] px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-[#8f2d1c]">
                      法定紅線
                    </span>
                  )}
                </div>
                <h3 className="mt-3 font-editorial text-[17px] font-semibold text-[#191816]">
                  {rule.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#524e47]">
                  {rule.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Procedure Decoder + Attribution Colophon */}
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="rounded-[2px] border border-[#191816]/20 bg-[#fcfbf8] p-5 lg:col-span-7">
            <p className="border-b border-[#d6d0c4] pb-2 font-editorial text-sm font-semibold text-[#191816]">
              如何辨識開庭性質（庭類說明）
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {(["trial", "prep", "verdict"] as const).map((key) => {
                const info = HEARING_CATEGORY_META[key];
                return (
                  <div
                    key={key}
                    className={`border p-3.5 ${
                      info.recommended
                        ? "border-[#1b382f]/40 bg-[#f4f7f5]"
                        : "border-[#d6d0c4] bg-[#f7f5f0]"
                    }`}
                  >
                    <p className="font-editorial text-sm font-semibold text-[#191816]">
                      {info.label}
                    </p>
                    <p className="mt-0.5 font-tabular text-[11px] font-medium text-[#1b382f]">
                      {info.durationHint}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#524e47]">
                      {info.beginnerHint}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formal Attribution Block */}
          <aside className="flex flex-col justify-between rounded-[2px] border border-[#191816]/25 bg-[#efece4] p-5 lg:col-span-5">
            <div className="space-y-2">
              <p className="text-xs font-medium tracking-[0.08em] text-[#8f2d1c]">
                參考來源與致謝
              </p>
              <h3 className="font-editorial text-lg font-semibold text-[#191816]">
                致謝法律百科{" "}
                <span className="font-tabular text-sm font-medium text-[#1b382f]">
                  @legispedia_tw
                </span>{" "}
                整理旁聽指南
              </h3>
              <p className="text-sm leading-relaxed text-[#524e47]">
                本專案之發想與前揭法庭旁聽守則，取材並致謝法律百科於 Threads
                發表之旁聽實務整理貼文及《法科！輕鬆點》節目分享。歡迎閱讀原文與討論串。
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[#d6d0c4] pt-3.5">
              <a
                href={LEGISPEDIA_THREAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-formal-ink"
              >
                <span>閱讀 Threads 原文</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <Link
                href="/about"
                className="inline-flex items-center gap-0.5 text-xs font-medium text-[#1b382f] underline decoration-[#1b382f]/40 underline-offset-4 hover:text-[#191816]"
              >
                <span>資料來源與免責聲明</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* 伍、全台法院庭期索引 */}
      <section className="space-y-5">
        <div className="legal-rule-bottom flex flex-wrap items-end justify-between gap-3 pb-3">
          <div>
            <p className="text-xs font-medium tracking-[0.08em] text-[#8f2d1c]">
              伍、全台主要法院名錄
            </p>
            <h2 className="mt-1 font-editorial text-2xl font-semibold text-[#191816]">
              全台 {meta.courts.length} 所主要法院未來七日庭期入口
            </h2>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#1b382f] underline decoration-[#1b382f]/40 underline-offset-4 hover:text-[#191816]"
          >
            <span>開啟完整條件檢索</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="divide-y divide-[#d6d0c4] rounded-[2px] border border-[#191816]/20 bg-[#fcfbf8]">
          {courtsByLevel.map((group) => (
            <div key={group.level} className="space-y-2.5 p-5 sm:px-6">
              <h3 className="text-xs font-medium tracking-[0.06em] text-[#524e47]">
                {group.label}（{group.courts.length}）
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {group.courts.map((court) => (
                  <Link
                    key={court.crtid}
                    href={`/search?court=${court.crtid}&start=${today}&end=${weekEnd}`}
                    className="inline-flex items-center gap-1.5 rounded-[2px] border border-[#d6d0c4] bg-[#f7f5f0] px-2.5 py-1 text-xs font-medium text-[#191816] transition-colors hover:border-[#1b382f] hover:bg-[#1b382f] hover:text-[#fcfbf8]"
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
