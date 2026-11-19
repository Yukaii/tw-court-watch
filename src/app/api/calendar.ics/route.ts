import { type NextRequest, NextResponse } from "next/server";
import { COURT_BY_ID } from "@/lib/courts";
import {
  getCourtHearings,
  getHearingsMeta,
  getHighlightsData,
} from "@/lib/data-server";
import { DEFAULT_SITE_ORIGIN, generateBatchIcs } from "@/lib/ics";
import type { Hearing, HearingCategory, SysCode } from "@/lib/types";

const MAX_EVENTS_PER_FEED = 500;
const VALID_CATEGORIES = new Set(["trial", "prep", "verdict", "other", "all"]);
const VALID_SYS = new Set<SysCode>(["H", "V", "A", "B", "P", "D"]);

const CATEGORY_TITLES: Record<HearingCategory | "all", string> = {
  trial: "審理／辯論庭",
  prep: "準備程序",
  verdict: "宣判",
  other: "其他程序",
  all: "公開庭期",
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const modeParam = sp.get("mode")?.toLowerCase() ?? "";
  const courtParam = sp.get("court")?.trim().toUpperCase() ?? "";
  const rawCategory = sp.get("category")?.toLowerCase() ?? "trial";
  const category = (
    VALID_CATEGORIES.has(rawCategory) ? rawCategory : "trial"
  ) as HearingCategory | "all";
  const onlyLayJudge = sp.get("layjudge") === "1" || sp.get("layjudge") === "true";
  const sysList = (sp.get("sys") ?? "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s): s is SysCode => VALID_SYS.has(s as SysCode));

  const siteOrigin =
    request.nextUrl.origin && !request.nextUrl.origin.includes("localhost")
      ? request.nextUrl.origin
      : DEFAULT_SITE_ORIGIN;

  const meta = await getHearingsMeta();
  const syncedDate = meta?.syncedAt ? new Date(meta.syncedAt) : new Date();

  let hearings: Hearing[] = [];
  let calName = "旁聽小幫手｜台灣公開開庭日曆";
  let calDesc =
    "每日自動同步全台主要法院未來 14 天公開庭期，已濾除調解與不公開程序。庭期僅供參考，請以司法院最新公告與現場為準。";
  let filenameSlug = "featured";

  if (modeParam === "layjudge") {
    const highlights = await getHighlightsData();
    hearings = highlights?.layJudgeHearings ?? [];
    calName = "旁聽小幫手｜全台國民法官開庭日曆";
    calDesc =
      "全台各法院未來 14 天公開國民法官案件庭期（每日定時同步，熱門場次請留意各院領取旁聽證公告）。";
    filenameSlug = "layjudge";
  } else if (courtParam && COURT_BY_ID[courtParam]) {
    const courtInfo = COURT_BY_ID[courtParam];
    const courtData = await getCourtHearings(courtParam);
    let rows = courtData?.hearings ?? [];

    if (onlyLayJudge) {
      rows = rows.filter((h) => h.isLayJudge);
    }
    if (category !== "all") {
      rows = rows.filter((h) => h.category === category);
    }
    if (sysList.length > 0) {
      const sysSet = new Set(sysList);
      rows = rows.filter((h) => sysSet.has(h.sysCode));
    }

    // Keep chronologically sorted and capped for fast Google Calendar ingestion
    rows.sort((a, b) =>
      `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`),
    );
    hearings = rows.slice(0, MAX_EVENTS_PER_FEED);

    const suffix = onlyLayJudge
      ? "國民法官"
      : CATEGORY_TITLES[category];
    calName = `旁聽小幫手｜${courtInfo.shortName} ${suffix}`;
    calDesc = `${courtInfo.name}未來 14 天可旁聽${suffix}（每日同步更新，自動濾除調解與不公開程序；每次最多收錄 ${MAX_EVENTS_PER_FEED} 場）。`;
    filenameSlug = `${courtParam.toLowerCase()}-${onlyLayJudge ? "layjudge" : category}`;
  } else if (courtParam && !COURT_BY_ID[courtParam]) {
    return NextResponse.json(
      { error: `Unknown court code: ${courtParam}` },
      { status: 404 },
    );
  } else {
    const highlights = await getHighlightsData();
    hearings = highlights?.featuredTrials ?? [];
    calName = "旁聽小幫手｜全台精選審理／辯論庭";
    calDesc =
      "全台主要法院未來 14 天精選公開審理與言詞辯論庭（每日同步更新，自動濾除調解與不公開程序）。";
    filenameSlug = "featured";
  }

  const icsBody = generateBatchIcs(hearings, syncedDate, {
    calName,
    calDesc,
    refreshHours: 12,
    siteOrigin,
    includeAlarm: false,
  });

  return new NextResponse(icsBody, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="tw-court-watch-${filenameSlug}.ics"`,
      "Cache-Control":
        "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex, nofollow",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
