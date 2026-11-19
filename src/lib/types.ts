export type CourtLevel = "supreme" | "high" | "admin_ip" | "district";

export type SysCode = "H" | "V" | "A" | "B" | "P" | "D";

export type HearingCategory = "trial" | "prep" | "verdict" | "other";

export type NonPublicReason =
  | "juvenile"
  | "family"
  | "mediation"
  | "non_public_procedure"
  | "non_public_room"
  | "sensitive_case";

export interface CampusLocation {
  name: string;
  address: string;
  transit?: string;
  lat?: number;
  lng?: number;
  /** Courtroom prefixes or substrings that map to this campus */
  roomMatchers?: string[];
}

export interface CourtInfo {
  crtid: string;
  name: string;
  shortName: string;
  level: CourtLevel;
  region: "north" | "central" | "south" | "east" | "islands";
  /** Main courthouse WGS84 coordinates */
  lat: number;
  lng: number;
  sysCodes: SysCode[];
  popular?: boolean;
  campuses: CampusLocation[];
  /** Official courtroom/hearing notes URL if applicable */
  website?: string;
}

export interface Hearing {
  /** Deterministic URL-safe ASCII ID: `${crtid}-${rocDate}-${timeRaw}-${hash8}` */
  id: string;
  crtid: string;
  courtName: string;
  courtShortName: string;
  courtLevel: CourtLevel;
  sysCode: SysCode;
  sysLabel: string;
  /** ROC year e.g. 115 */
  rocYear: number;
  /** Case prefix e.g. "訴", "易", "國審訴" */
  crmid: string;
  /** Raw 6-digit case number e.g. "000668" */
  crmnoRaw: string;
  /** Formatted case number e.g. "115年度訴字第668號" */
  caseNo: string;
  /** Division (股別) e.g. "和" */
  division: string | null;
  /** Courtroom name e.g. "第11法庭" */
  courtroom: string;
  /** Procedure type (庭類) e.g. "審理", "言詞辯論", "準備程序", "宣判" */
  dukd: string;
  /** Normalized hearing category for filtering & beginner badges */
  category: HearingCategory;
  /** Cause of action (案由) e.g. "傷害", "清償借款" */
  reason: string;
  /** Gregorian ISO date YYYY-MM-DD */
  date: string;
  /** ROC 7-digit date e.g. "1151119" */
  rocDate: string;
  /** Formatted HH:mm */
  time: string;
  /** True when crmid indicates 國民法官案件 (e.g. 國審訴, 國審重訴) */
  isLayJudge: boolean;
  /** Resolved campus/building name & address */
  campusName: string;
  address: string;
  transit?: string;
  /** Official Judicial Yuan query page with ?crtid= pre-selected */
  sourceUrl: string;
}

export interface FilterBreakdown {
  totalRaw: number;
  keptPublic: number;
  filteredTotal: number;
  byReason: Record<NonPublicReason, number>;
}

export interface CourtSyncSummary {
  crtid: string;
  name: string;
  shortName: string;
  level: CourtLevel;
  region: CourtInfo["region"];
  total: number;
  today: number;
  trialCount: number;
  layJudgeCount: number;
}

export interface HearingsMeta {
  syncedAt: string;
  dateRange: {
    start: string;
    end: string;
  };
  totalHearings: number;
  todayDate: string;
  todayCount: number;
  trialCount: number;
  layJudgeCount: number;
  filterStats: FilterBreakdown;
  courts: CourtSyncSummary[];
  countsByDate: Record<string, number>;
  failedRequests: Array<{ crtid: string; sys: SysCode; error: string }>;
}

export interface HighlightsData {
  syncedAt: string;
  todayDate: string;
  /** All upcoming 國民法官 hearings across Taiwan */
  layJudgeHearings: Hearing[];
  /** Today & upcoming highlighted trial/debate hearings from major courts */
  featuredTrials: Hearing[];
}

/**
 * Compact tuple representation stored in public/data/hearings/by-court/[crtid].json
 * [id, sysCode, rocYear, crmid, crmnoRaw, division, courtroom, dukd, reason, date, time]
 */
export type CompactHearing = [
  string,
  SysCode,
  number,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

export interface CourtHearingsFile {
  crtid: string;
  syncedAt: string;
  rows: CompactHearing[];
}

export interface SavedHearing {
  hearingId: string;
  savedAt: string;
  remind: boolean;
  /** Snapshot kept in localStorage so saved items remain readable after hearing expires */
  snapshot: Pick<
    Hearing,
    | "id"
    | "crtid"
    | "courtName"
    | "courtShortName"
    | "sysLabel"
    | "caseNo"
    | "division"
    | "courtroom"
    | "dukd"
    | "category"
    | "reason"
    | "date"
    | "rocDate"
    | "time"
    | "isLayJudge"
    | "campusName"
    | "address"
    | "transit"
    | "sourceUrl"
  >;
}

export interface PersonalNote {
  id: string;
  hearingId: string | null;
  courtName: string;
  crtid?: string;
  date: string;
  time?: string;
  courtroom: string;
  caseNo: string;
  reason?: string;
  dukd?: string;
  attendedAt: string;
  summary: string;
  tags: string[];
  clarity: number | null;
  friendliness: number | null;
  wouldRecommend: boolean | null;
  rulesMemo: string;
  createdAt: string;
  updatedAt: string;
}
