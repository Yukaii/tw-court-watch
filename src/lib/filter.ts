import type { HearingCategory, NonPublicReason, SysCode } from "./types";

const FAMILY_PREFIX_RE = /^(家|司家|暫家|婚|家訴|家非|家調|家聲|家護|家親|家繼)/;
const JUVENILE_PREFIX_RE = /^(少|司少|少調|少護|少連|少聲|少訴)/;

const MEDIATION_DUKD_KEYWORDS = ["調解", "試行調解", "調解程序"];
const NON_PUBLIC_DUKD_KEYWORDS = ["不公開", "秘密", "協商程序", "協商"];
const NON_PUBLIC_ROOM_KEYWORDS = [
  "調解室",
  "協商室",
  "詢問室",
  "評議室",
  "保護室",
  "隔離室",
  "家事",
  "少年",
];

/**
 * Legally closed-by-default sexual violence / CSAM / sexual privacy offences.
 * Note: Criminal domestic-violence homicide/injury (e.g. 家庭暴力罪之殺人) is tried
 * in criminal court and may be open unless the judge or dukd marks it closed,
 * so we do NOT blindly block all occurrences of "家庭暴力".
 */
const SENSITIVE_RSN_KEYWORDS = [
  "妨害性自主",
  "妨害性隱私",
  "不實性影像",
  "性侵害",
  "強制性交",
  "乘機性交",
  "強制猥褻",
  "兒童及少年性剝削",
  "兒少性剝削",
  "性剝削",
];

export interface RawHearingCandidate {
  crtid: string;
  sysCode: string;
  crmid: string;
  courtroom: string;
  dukd: string;
  reason: string;
}

/**
 * Returns the reason why a hearing is excluded from the public watchable list,
 * or null if it appears open to public observation.
 */
export function classifyNonPublic(
  item: RawHearingCandidate,
): NonPublicReason | null {
  const crtid = item.crtid.trim().toUpperCase();
  const sys = item.sysCode.trim().toUpperCase();
  const crmid = item.crmid.trim();
  const room = item.courtroom.trim();
  const dukd = item.dukd.trim();
  const reason = item.reason.trim();

  if (sys === "I" || crtid === "KSY" || JUVENILE_PREFIX_RE.test(crmid)) {
    return "juvenile";
  }

  if (FAMILY_PREFIX_RE.test(crmid)) {
    return "family";
  }

  if (MEDIATION_DUKD_KEYWORDS.some((kw) => dukd.includes(kw))) {
    return "mediation";
  }

  if (NON_PUBLIC_DUKD_KEYWORDS.some((kw) => dukd.includes(kw))) {
    return "non_public_procedure";
  }

  if (NON_PUBLIC_ROOM_KEYWORDS.some((kw) => room.includes(kw))) {
    return "non_public_room";
  }

  if (SENSITIVE_RSN_KEYWORDS.some((kw) => reason.includes(kw))) {
    return "sensitive_case";
  }

  return null;
}

/**
 * Categorize dukd (庭類) into observer-friendly buckets.
 */
export function classifyHearingCategory(dukd: string): HearingCategory {
  const text = dukd.trim();
  if (
    text.includes("宣判") ||
    text.includes("宣示判決") ||
    text.includes("宣告")
  ) {
    return "verdict";
  }
  if (
    text.includes("言詞辯論") ||
    text.includes("辯論") ||
    text.includes("審理") ||
    text.includes("調查證據") ||
    text.includes("調查")
  ) {
    return "trial";
  }
  if (
    text.includes("準備") ||
    text.includes("審查") ||
    text.includes("訊問") ||
    text.includes("勘驗") ||
    text.includes("延押") ||
    text.includes("羈押")
  ) {
    return "prep";
  }
  return "other";
}

export interface CategoryMeta {
  label: string;
  shortLabel: string;
  beginnerHint: string;
  durationHint: string;
  recommended: boolean;
}

export const HEARING_CATEGORY_META: Record<HearingCategory, CategoryMeta> = {
  trial: {
    label: "審理／言詞辯論（新手推）",
    shortLabel: "審理／辯論",
    beginnerHint:
      "會有實質攻防、檢辯／兩造陳述、提示證據或詰問證人，最能完整感受法庭運作，最適合第一次旁聽。",
    durationHint: "約 20 分鐘至數小時不等",
    recommended: true,
  },
  prep: {
    label: "準備／程序庭",
    shortLabel: "準備程序",
    beginnerHint:
      "主要在確認起訴範圍、爭點與調查證據順序，節奏較快、語彙偏程序面，適合想了解審前流程的人。",
    durationHint: "約 5–20 分鐘",
    recommended: false,
  },
  verdict: {
    label: "宣判（快閃）",
    shortLabel: "宣判",
    beginnerHint:
      "法官僅朗讀判決主文，通常不到 1 分鐘就結束，且當事人未必到庭。除非特地追該案結果，否則新手不建議專程前往。",
    durationHint: "約 30 秒–2 分鐘",
    recommended: false,
  },
  other: {
    label: "其他程序",
    shortLabel: "其他",
    beginnerHint: "視具體庭類與案件進度而定，建議出發前確認法庭現場公告。",
    durationHint: "依現場為主",
    recommended: false,
  },
};

export function isLayJudgeCase(crmid: string): boolean {
  return crmid.trim().startsWith("國審");
}

export function formatCaseNo(
  rocYear: number,
  crmid: string,
  crmnoRaw: string,
): string {
  const numClean = crmnoRaw.replace(/^0+/, "") || "0";
  return `${rocYear}年度${crmid}字第${numClean}號`;
}

/**
 * Pure-JS deterministic FNV-1a 32-bit hash (isomorphic across Node, Bun, Edge, Browser).
 */
function fnv1aHex(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Build a deterministic, URL-safe ASCII ID that starts with `${crtid}-`
 * so server routes can resolve the court JSON file in O(1).
 */
export function buildHearingId(parts: {
  crtid: string;
  sysCode: SysCode;
  rocYear: number;
  crmid: string;
  crmnoRaw: string;
  rocDate: string;
  timeRaw: string;
  courtroom: string;
}): string {
  const fingerprint = [
    parts.crtid,
    parts.sysCode,
    parts.rocYear,
    parts.crmid,
    parts.crmnoRaw,
    parts.rocDate,
    parts.timeRaw,
    parts.courtroom,
  ].join("|");
  return `${parts.crtid}-${parts.rocDate}-${parts.timeRaw}-${fnv1aHex(fingerprint)}`;
}

export const SYS_LABELS: Record<SysCode, string> = {
  H: "刑事",
  V: "民事",
  A: "行政",
  B: "商業",
  P: "懲戒",
  D: "職務",
};

/**
 * Lightweight client-side safety check before saving a personal note:
 * warns if text looks like it contains a Taiwan National ID, phone number, or email.
 */
export function detectNotePiiWarnings(text: string): string[] {
  const warnings: string[] = [];
  if (/[A-Za-z][1289]\d{8}/.test(text)) {
    warnings.push("偵測到疑似身分證字號或居留證號，請勿記錄個人證件號碼。");
  }
  if (/09\d{2}[-\s]?\d{3}[-\s]?\d{3}/.test(text)) {
    warnings.push("偵測到疑似手機號碼，建議移除聯絡電話等個資。");
  }
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) {
    warnings.push("偵測到疑似電子郵件地址，建議移除個人聯絡資訊。");
  }
  return warnings;
}
