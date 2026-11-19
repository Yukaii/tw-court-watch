import {
  COURT_BY_ID,
  getOfficialQueryUrl,
  resolveCampusLocation,
} from "./courts";
import { isoToRoc } from "./date";
import {
  SYS_LABELS,
  classifyHearingCategory,
  formatCaseNo,
  isLayJudgeCase,
} from "./filter";
import type { CompactHearing, Hearing } from "./types";

/**
 * Compact a full Hearing into minimal on-disk JSON (removes court-level
 * repeated address/transit/URL strings to shrink static JSON by ~70%).
 */
export function compactHearing(h: Hearing): CompactHearing {
  return [
    h.id,
    h.sysCode,
    h.rocYear,
    h.crmid,
    h.crmnoRaw,
    h.division ?? "",
    h.courtroom,
    h.dukd,
    h.reason,
    h.date,
    h.time,
  ];
}

/**
 * Hydrate a CompactHearing tuple back into a rich Hearing object using courts.ts metadata.
 */
export function hydrateHearing(
  crtid: string,
  row: CompactHearing,
): Hearing {
  const [
    id,
    sysCode,
    rocYear,
    crmid,
    crmnoRaw,
    divisionRaw,
    courtroom,
    dukd,
    reason,
    date,
    time,
  ] = row;

  const court = COURT_BY_ID[crtid];
  const campus = court
    ? resolveCampusLocation(court, courtroom)
    : { name: crtid, address: "", transit: undefined };

  return {
    id,
    crtid,
    courtName: court?.name ?? crtid,
    courtShortName: court?.shortName ?? crtid,
    courtLevel: court?.level ?? "district",
    sysCode,
    sysLabel: SYS_LABELS[sysCode] ?? sysCode,
    rocYear,
    crmid,
    crmnoRaw,
    caseNo: formatCaseNo(rocYear, crmid, crmnoRaw),
    division: divisionRaw || null,
    courtroom,
    dukd,
    category: classifyHearingCategory(dukd),
    reason,
    date,
    rocDate: isoToRoc(date) ?? "",
    time,
    isLayJudge: isLayJudgeCase(crmid),
    campusName: campus.name,
    address: campus.address,
    transit: campus.transit,
    sourceUrl: getOfficialQueryUrl(crtid),
  };
}
