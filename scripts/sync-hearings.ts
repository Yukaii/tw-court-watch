import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  COURT_BY_ID,
  MAJOR_COURTS,
  getOfficialQueryUrl,
  resolveCampusLocation,
} from "../src/lib/courts";
import {
  addDaysIso,
  formatHearingTime,
  getTaipeiTodayIso,
  isoToRoc,
  rocToIso,
} from "../src/lib/date";
import {
  SYS_LABELS,
  buildHearingId,
  classifyHearingCategory,
  classifyNonPublic,
  formatCaseNo,
  isLayJudgeCase,
} from "../src/lib/filter";
import { compactHearing } from "../src/lib/hydrate";
import type {
  CourtHearingsFile,
  CourtSyncSummary,
  FilterBreakdown,
  Hearing,
  HearingsMeta,
  HighlightsData,
  SysCode,
} from "../src/lib/types";

const BASE_URL = "https://csdi3.judicial.gov.tw/judbp/wkw/WHD1A03";
const USER_AGENT =
  "tw-court-watch-sync/0.1 (+https://github.com/Yukaii/tw-court-watch; low-frequency civic schedule cache)";

interface CliOptions {
  days: number;
  delayMs: number;
  courtsFilter: string[] | null;
}

function parseCliArgs(argv: string[]): CliOptions {
  let days = 14;
  let delayMs = 650;
  let courtsFilter: string[] | null = null;

  for (const arg of argv) {
    if (arg.startsWith("--days=")) {
      const parsed = Number.parseInt(arg.slice("--days=".length), 10);
      if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 31) days = parsed;
    } else if (arg.startsWith("--delay=")) {
      const parsed = Number.parseInt(arg.slice("--delay=".length), 10);
      if (Number.isFinite(parsed) && parsed >= 0) delayMs = parsed;
    } else if (arg.startsWith("--courts=")) {
      courtsFilter = arg
        .slice("--courts=".length)
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
    }
  }

  return { days, delayMs, courtsFilter };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simple RFC 4180 CSV parser supporting quoted fields & UTF-8 BOM.
 */
function parseCsv(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (inQuotes) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\r") {
      // skip CR
    } else if (ch === "\n") {
      row.push(cell);
      if (row.some((c) => c.trim().length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((c) => c.trim().length > 0)) {
      rows.push(row);
    }
  }

  return rows;
}

interface SessionState {
  cookieHeader: string;
  csrf: string;
}

function extractCookies(res: Response): string {
  const setCookies =
    typeof res.headers.getSetCookie === "function"
      ? res.headers.getSetCookie()
      : [];
  const pairs = setCookies
    .map((c) => c.split(";")[0]?.trim())
    .filter((p): p is string => Boolean(p));
  return pairs.join("; ");
}

async function initSession(): Promise<SessionState> {
  const res1 = await fetch(`${BASE_URL}.htm`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res1.ok) {
    throw new Error(`Failed to fetch WHD1A03.htm: HTTP ${res1.status}`);
  }
  const cookies1 = extractCookies(res1);

  const res2 = await fetch(`${BASE_URL}/V1.htm`, {
    headers: {
      "User-Agent": USER_AGENT,
      Cookie: cookies1,
      Referer: `${BASE_URL}.htm`,
    },
  });
  if (!res2.ok) {
    throw new Error(`Failed to fetch WHD1A03/V1.htm: HTTP ${res2.status}`);
  }
  const cookies2 = extractCookies(res2);
  const html = await res2.text();
  const csrfMatch = /name="_csrf"\s+value="([^"]+)"/.exec(html);
  if (!csrfMatch) {
    throw new Error("Could not locate _csrf token in WHD1A03/V1.htm");
  }

  const cookieMap = new Map<string, string>();
  for (const part of `${cookies1}; ${cookies2}`.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq > 0) {
      cookieMap.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
    }
  }

  const cookieHeader = Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  return {
    cookieHeader,
    csrf: csrfMatch[1],
  };
}

async function fetchCourtCsv(
  session: SessionState,
  crtid: string,
  sys: SysCode,
  startRoc: string,
  endRoc: string,
): Promise<string[][]> {
  const body = new URLSearchParams({
    _csrf: session.csrf,
    crtid,
    sys,
    startdt: startRoc,
    enddt: endRoc,
  });

  const res = await fetch(`${BASE_URL}/DOWNLOAD_RESULT_CVS.htm`, {
    method: "POST",
    headers: {
      "User-Agent": USER_AGENT,
      Cookie: session.cookieHeader,
      Referer: `${BASE_URL}/V2.htm`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();
  if (contentType.includes("text/html") || text.trimStart().startsWith("<!DOCTYPE")) {
    throw new Error("Unexpected HTML response (session/CSRF expired)");
  }

  return parseCsv(text);
}

async function main() {
  const opts = parseCliArgs(process.argv.slice(2));
  const todayIso = getTaipeiTodayIso();
  const endIso = addDaysIso(todayIso, opts.days - 1);
  const startRoc = isoToRoc(todayIso);
  const endRoc = isoToRoc(endIso);

  if (!startRoc || !endRoc) {
    throw new Error(`Invalid date range: ${todayIso}..${endIso}`);
  }

  const targetCourts = opts.courtsFilter
    ? MAJOR_COURTS.filter((c) => opts.courtsFilter!.includes(c.crtid))
    : MAJOR_COURTS;

  console.log(
    `[sync] Syncing ${targetCourts.length} courts for ${todayIso}..${endIso} (ROC ${startRoc}..${endRoc}), delay=${opts.delayMs}ms`,
  );

  let session = await initSession();
  const syncedAt = new Date().toISOString();

  const filterStats: FilterBreakdown = {
    totalRaw: 0,
    keptPublic: 0,
    filteredTotal: 0,
    byReason: {
      juvenile: 0,
      family: 0,
      mediation: 0,
      non_public_procedure: 0,
      non_public_room: 0,
      sensitive_case: 0,
    },
  };

  const outDir = path.join(process.cwd(), "public", "data", "hearings");
  const byCourtDir = path.join(outDir, "by-court");
  await mkdir(byCourtDir, { recursive: true });

  const courtSummaries: CourtSyncSummary[] = [];
  const countsByDate: Record<string, number> = {};
  const failedRequests: Array<{ crtid: string; sys: SysCode; error: string }> =
    [];
  const allLayJudge: Hearing[] = [];
  const featuredCandidates: Hearing[] = [];

  for (const court of targetCourts) {
    const courtHearingsMap = new Map<string, Hearing>();

    for (const sys of court.sysCodes) {
      let rows: string[][] = [];
      let succeeded = false;
      let lastError = "";

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          rows = await fetchCourtCsv(session, court.crtid, sys, startRoc, endRoc);
          succeeded = true;
          break;
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          if (attempt === 1) {
            await sleep(1000);
            try {
              session = await initSession();
            } catch {
              // continue to retry
            }
          }
        }
      }

      if (!succeeded) {
        console.warn(
          `[sync] WARN failed ${court.crtid}/${sys}: ${lastError}`,
        );
        failedRequests.push({ crtid: court.crtid, sys, error: lastError });
        await sleep(opts.delayMs);
        continue;
      }

      for (const cols of rows) {
        // Expected CSV format:
        // 0:sysLabel, 1:crmyy, 2:crmid, 3:crmno, 4:dudt(115/11/19), 5:dutm(0930), 6:dunm, 7:dpt, 8:dukd, 9:rsn
        if (cols.length < 9) continue;

        const sysLabel = cols[0]?.trim() || SYS_LABELS[sys];
        const rocYear = Number.parseInt(cols[1]?.trim() ?? "", 10);
        const crmid = cols[2]?.trim() ?? "";
        const crmnoRaw = cols[3]?.trim() ?? "";
        const dudtSlash = cols[4]?.trim() ?? "";
        const timeRaw = (cols[5]?.trim() ?? "").replace(/\D/g, "").padStart(4, "0");
        const courtroom = cols[6]?.trim() || "依現場公告";
        const division = cols[7]?.trim() || null;
        const dukd = cols[8]?.trim() || "開庭";
        const reason = cols[9]?.trim() ?? "";

        if (!Number.isFinite(rocYear) || !crmid) continue;
        const isoDate = rocToIso(dudtSlash);
        const rocDate = isoDate ? isoToRoc(isoDate) : null;
        if (!isoDate || !rocDate) continue;

        filterStats.totalRaw++;

        const nonPublicReason = classifyNonPublic({
          crtid: court.crtid,
          sysCode: sys,
          crmid,
          courtroom,
          dukd,
          reason,
        });

        if (nonPublicReason) {
          filterStats.filteredTotal++;
          filterStats.byReason[nonPublicReason]++;
          continue;
        }

        const id = buildHearingId({
          crtid: court.crtid,
          sysCode: sys,
          rocYear,
          crmid,
          crmnoRaw,
          rocDate,
          timeRaw,
          courtroom,
        });

        if (courtHearingsMap.has(id)) continue;

        const campus = resolveCampusLocation(court, courtroom);
        const category = classifyHearingCategory(dukd);
        const layJudge = isLayJudgeCase(crmid);

        const hearing: Hearing = {
          id,
          crtid: court.crtid,
          courtName: court.name,
          courtShortName: court.shortName,
          courtLevel: court.level,
          sysCode: sys,
          sysLabel,
          rocYear,
          crmid,
          crmnoRaw,
          caseNo: formatCaseNo(rocYear, crmid, crmnoRaw),
          division,
          courtroom,
          dukd,
          category,
          reason,
          date: isoDate,
          rocDate,
          time: formatHearingTime(timeRaw),
          isLayJudge: layJudge,
          campusName: campus.name,
          address: campus.address,
          transit: campus.transit,
          sourceUrl: getOfficialQueryUrl(court.crtid),
        };

        courtHearingsMap.set(id, hearing);
        filterStats.keptPublic++;
      }

      await sleep(opts.delayMs);
    }

    const hearings = Array.from(courtHearingsMap.values()).sort((a, b) =>
      `${a.date}T${a.time}-${a.courtroom}`.localeCompare(
        `${b.date}T${b.time}-${b.courtroom}`,
      ),
    );

    const courtFile: CourtHearingsFile = {
      crtid: court.crtid,
      syncedAt,
      rows: hearings.map(compactHearing),
    };

    await writeFile(
      path.join(byCourtDir, `${court.crtid}.json`),
      JSON.stringify(courtFile),
      "utf-8",
    );

    let today = 0;
    let trialCount = 0;
    let layJudgeCount = 0;

    for (const h of hearings) {
      countsByDate[h.date] = (countsByDate[h.date] ?? 0) + 1;
      if (h.date === todayIso) today++;
      if (h.category === "trial") trialCount++;
      if (h.isLayJudge) {
        layJudgeCount++;
        allLayJudge.push(h);
      }
      if (
        h.category === "trial" &&
        h.date <= addDaysIso(todayIso, 3) &&
        (court.popular || court.level === "supreme" || court.level === "admin_ip")
      ) {
        featuredCandidates.push(h);
      }
    }

    courtSummaries.push({
      crtid: court.crtid,
      name: court.name,
      shortName: court.shortName,
      level: court.level,
      region: court.region,
      total: hearings.length,
      today,
      trialCount,
      layJudgeCount,
    });

    console.log(
      `[sync] ${court.crtid} (${court.shortName}): ${hearings.length} public (today=${today}, trial=${trialCount}, layJudge=${layJudgeCount})`,
    );
  }

  // Sort & cap featured trials so highlights.json stays lightweight and diverse across courts
  featuredCandidates.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.isLayJudge !== b.isLayJudge) return a.isLayJudge ? -1 : 1;
    return a.time.localeCompare(b.time);
  });

  const featuredTrials: Hearing[] = [];
  const perCourtDateCounter = new Map<string, number>();
  for (const h of featuredCandidates) {
    const key = `${h.crtid}-${h.date}`;
    const count = perCourtDateCounter.get(key) ?? 0;
    if (count >= 12) continue;
    perCourtDateCounter.set(key, count + 1);
    featuredTrials.push(h);
    if (featuredTrials.length >= 160) break;
  }

  allLayJudge.sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`),
  );

  const meta: HearingsMeta = {
    syncedAt,
    dateRange: {
      start: todayIso,
      end: endIso,
    },
    totalHearings: courtSummaries.reduce((acc, c) => acc + c.total, 0),
    todayDate: todayIso,
    todayCount: courtSummaries.reduce((acc, c) => acc + c.today, 0),
    trialCount: courtSummaries.reduce((acc, c) => acc + c.trialCount, 0),
    layJudgeCount: allLayJudge.length,
    filterStats,
    courts: courtSummaries,
    countsByDate,
    failedRequests,
  };

  const highlights: HighlightsData = {
    syncedAt,
    todayDate: todayIso,
    layJudgeHearings: allLayJudge,
    featuredTrials,
  };

  await writeFile(
    path.join(outDir, "meta.json"),
    JSON.stringify(meta, null, 2),
    "utf-8",
  );
  await writeFile(
    path.join(outDir, "highlights.json"),
    JSON.stringify(highlights),
    "utf-8",
  );

  console.log(
    `[sync] DONE! totalPublic=${meta.totalHearings}, today=${meta.todayCount}, trials=${meta.trialCount}, layJudge=${meta.layJudgeCount}, filteredOut=${filterStats.filteredTotal}, failed=${failedRequests.length}`,
  );
  if (COURT_BY_ID.TPD) {
    console.log(`[sync] Output written to ${outDir}`);
  }
}

main().catch((err) => {
  console.error("[sync] FATAL:", err);
  process.exit(1);
});
