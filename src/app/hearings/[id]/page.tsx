import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  ShieldAlert,
  Train,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HearingActions } from "@/components/HearingActions";
import { HearingLiveStatusBadge } from "@/components/HearingLiveStatusBadge";
import { getGoogleMapsUrl } from "@/lib/courts";
import { getHearingById, getHearingsMeta } from "@/lib/data-server";
import { formatDualDate, formatSyncedAt } from "@/lib/date";
import { HEARING_CATEGORY_META } from "@/lib/filter";

export const dynamic = "force-dynamic";

interface HearingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: HearingPageProps): Promise<Metadata> {
  const { id } = await params;
  const hearing = await getHearingById(id);

  return {
    title: hearing
      ? `${hearing.courtShortName} ${hearing.caseNo}｜${hearing.dukd}`
      : "找不到庭期資料",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function HearingDetailPage({ params }: HearingPageProps) {
  const { id } = await params;
  const [hearing, meta] = await Promise.all([
    getHearingById(id),
    getHearingsMeta(),
  ]);

  if (!hearing) {
    notFound();
  }

  const catMeta = HEARING_CATEGORY_META[hearing.category];
  const mapsUrl = getGoogleMapsUrl(hearing.campusName, hearing.address);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/search?court=${hearing.crtid}&start=${hearing.date}&end=${hearing.date}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-secondary)] hover:text-[var(--ink)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          回到{hearing.courtShortName}庭期列表
        </Link>
        {meta && (
          <span className="font-tabular text-xs text-[var(--ink-muted)]">
            同步時間：{formatSyncedAt(meta.syncedAt)}
          </span>
        )}
      </div>

      {/* Main hearing info card */}
      <article className="space-y-5 rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-7">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <HearingLiveStatusBadge
              date={hearing.date}
              time={hearing.time}
              category={hearing.category}
              isLayJudge={hearing.isLayJudge}
            />
            {hearing.isLayJudge && (
              <span className="border border-[var(--seal-text)] px-2 py-0.5 font-medium text-[var(--seal-text)]">
                國民法官案件
              </span>
            )}
            <span className="border border-[var(--border-subtle)] bg-[var(--bg-tint)] px-2 py-0.5 font-medium text-[var(--ink)]">
              {hearing.dukd}
            </span>
            <span className="text-[var(--ink-secondary)]">
              {hearing.sysLabel}
            </span>
          </div>

          <h1 className="font-editorial text-2xl font-semibold leading-snug text-[var(--ink)] sm:text-[28px]">
            {hearing.reason || `${hearing.sysLabel}${hearing.dukd}`}
          </h1>
          <p className="font-tabular text-sm font-medium text-[var(--ink-secondary)]">
            {hearing.caseNo}
            {hearing.division ? ` · ${hearing.division}股` : ""}
          </p>
        </div>

        {/* Structured grid */}
        <dl className="grid gap-3 rounded-[2px] border border-[var(--rule)] bg-[var(--bg-paper)] p-4 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2.5">
            <Calendar
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--robe-text)]"
              aria-hidden="true"
            />
            <div>
              <dt className="text-xs text-[var(--ink-muted)]">
                開庭日期（西元｜民國）
              </dt>
              <dd className="font-semibold text-[var(--ink)]">
                {formatDualDate(hearing.date)}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--robe-text)]"
              aria-hidden="true"
            />
            <div>
              <dt className="text-xs text-[var(--ink-muted)]">預定開庭時間</dt>
              <dd className="font-tabular text-base font-bold text-[var(--ink)]">
                {hearing.time}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Building2
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--robe-text)]"
              aria-hidden="true"
            />
            <div>
              <dt className="text-xs text-[var(--ink-muted)]">法院與法庭</dt>
              <dd className="font-semibold text-[var(--ink)]">
                {hearing.courtName} · {hearing.courtroom}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Info
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--robe-text)]"
              aria-hidden="true"
            />
            <div>
              <dt className="text-xs text-[var(--ink-muted)]">
                旁聽席與領證資訊
              </dt>
              <dd className="text-[var(--ink-body)]">
                {hearing.isLayJudge
                  ? "國民法官熱門場次可能需提前領取旁聽證，請依法院現場或官網公告為準"
                  : "一般公開審理庭通常免領證、門開即可入座（實際席次依現場公告）"}
              </dd>
            </div>
          </div>
        </dl>

        {/* Procedure beginner hint */}
        <div className="rounded-[2px] border border-[var(--robe-text)]/35 bg-[var(--bg-sage)] p-4 text-sm">
          <p className="font-semibold text-[var(--ink)]">
            這場「{hearing.dukd}」大概會進行什麼？（{catMeta.durationHint}）
          </p>
          <p className="mt-1 text-[var(--ink-body)]">{catMeta.beginnerHint}</p>
        </div>

        {/* Location & transit */}
        <section className="space-y-2 rounded-[2px] border border-[var(--rule)] p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-sm font-bold text-[var(--ink)]">
                <MapPin
                  className="h-4 w-4 text-[var(--robe-text)]"
                  aria-hidden="true"
                />
                {hearing.campusName}
              </p>
              <p className="text-sm text-[var(--ink-body)]">{hearing.address}</p>
              {hearing.transit && (
                <p className="flex items-start gap-1.5 text-xs text-[var(--ink-secondary)]">
                  <Train
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{hearing.transit}</span>
                </p>
              )}
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-formal-secondary !px-3 !py-1.5 !text-xs"
            >
              Google 地圖導航
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* On-site reminders */}
        <div className="rounded-[2px] border-l-2 border-[var(--seal-text)] bg-[var(--bg-alert)] p-4 text-xs leading-relaxed text-[var(--ink-body)]">
          <p className="flex items-center gap-1.5 font-bold text-[var(--seal-text)]">
            <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
            旁聽現場提醒
          </p>
          <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
            <li>
              本庭期雖經系統濾除常見不公開案件，但審判長仍得依法律於當庭諭知不公開審理，請以現場指示為準。
            </li>
            <li>
              進入法院需經金屬探測門與 X 光安檢，建議提前 15–20 分鐘抵達。
            </li>
            <li>
              庭內嚴禁錄音、錄影、拍照，手機請關靜音；法官入退庭與宣判時請起立，可使用紙筆做筆記。
            </li>
          </ul>
        </div>
      </article>

      {/* Interactive actions & personal notes */}
      <HearingActions hearing={hearing} />
    </div>
  );
}
