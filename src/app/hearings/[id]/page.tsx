import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  ShieldAlert,
  Sparkles,
  Train,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HearingActions } from "@/components/HearingActions";
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
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          回到{hearing.courtShortName}庭期列表
        </Link>
        {meta && (
          <span className="text-xs text-stone-400">
            同步時間：{formatSyncedAt(meta.syncedAt)}
          </span>
        )}
      </div>

      {/* Main hearing info card */}
      <article className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs sm:p-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {hearing.isLayJudge && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                國民法官案件
              </span>
            )}
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900">
              {hearing.dukd}
            </span>
            <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs text-stone-700">
              {hearing.sysLabel}
            </span>
          </div>

          <h1 className="text-xl font-bold leading-snug text-stone-900 sm:text-2xl">
            {hearing.reason || `${hearing.sysLabel}${hearing.dukd}`}
          </h1>
          <p className="text-sm font-medium text-stone-600">
            {hearing.caseNo}
            {hearing.division ? ` · ${hearing.division}股` : ""}
          </p>
        </div>

        {/* Structured grid */}
        <dl className="grid gap-3 rounded-xl border border-stone-100 bg-stone-50/70 p-4 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2.5">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" aria-hidden="true" />
            <div>
              <dt className="text-xs text-stone-500">開庭日期（西元｜民國）</dt>
              <dd className="font-semibold text-stone-900">
                {formatDualDate(hearing.date)}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" aria-hidden="true" />
            <div>
              <dt className="text-xs text-stone-500">預定開庭時間</dt>
              <dd className="font-mono text-base font-bold text-stone-900">
                {hearing.time}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" aria-hidden="true" />
            <div>
              <dt className="text-xs text-stone-500">法院與法庭</dt>
              <dd className="font-semibold text-stone-900">
                {hearing.courtName} · {hearing.courtroom}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" aria-hidden="true" />
            <div>
              <dt className="text-xs text-stone-500">旁聽席與領證資訊</dt>
              <dd className="text-stone-800">
                {hearing.isLayJudge
                  ? "國民法官熱門場次可能需提前領取旁聽證，請依法院現場或官網公告為準"
                  : "一般公開審理庭通常免領證、門開即可入座（實際席次依現場公告）"}
              </dd>
            </div>
          </div>
        </dl>

        {/* Procedure beginner hint */}
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 text-sm">
          <p className="font-semibold text-emerald-950">
            這場「{hearing.dukd}」大概會進行什麼？（{catMeta.durationHint}）
          </p>
          <p className="mt-1 text-stone-700">{catMeta.beginnerHint}</p>
        </div>

        {/* Location & transit */}
        <section className="space-y-2 rounded-xl border border-stone-200 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-sm font-bold text-stone-900">
                <MapPin className="h-4 w-4 text-emerald-800" aria-hidden="true" />
                {hearing.campusName}
              </p>
              <p className="text-sm text-stone-700">{hearing.address}</p>
              {hearing.transit && (
                <p className="flex items-start gap-1.5 text-xs text-stone-500">
                  <Train className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{hearing.transit}</span>
                </p>
              )}
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50"
            >
              Google 地圖導航
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* On-site reminders */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-950">
          <p className="flex items-center gap-1.5 font-bold">
            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-800" aria-hidden="true" />
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
