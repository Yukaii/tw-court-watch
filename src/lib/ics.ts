import { formatCompactDualDate } from "./date";
import type { Hearing, HearingCategory, SavedHearing, SysCode } from "./types";

export const DEFAULT_SITE_ORIGIN = "https://court.yukai.dev";

type CalendarHearingLike = Pick<
  Hearing,
  | "id"
  | "courtName"
  | "courtroom"
  | "caseNo"
  | "dukd"
  | "reason"
  | "date"
  | "time"
  | "campusName"
  | "address"
  | "sourceUrl"
  | "division"
>;

export interface CalendarFeedOptions {
  /** Calendar display name (X-WR-CALNAME & RFC 7986 NAME) */
  calName?: string;
  /** Calendar description (X-WR-CALDESC & RFC 7986 DESCRIPTION) */
  calDesc?: string;
  /** Suggested refresh interval in hours (default 12) */
  refreshHours?: number;
  /** Site origin used for each event's URL property (e.g. https://court.yukai.dev) */
  siteOrigin?: string;
  /** Whether to attach a 45-minute reminder VALARM to each event (default true for single downloads, false for feeds) */
  includeAlarm?: boolean;
}

export interface CalendarFeedQuery {
  mode?: "layjudge" | "featured" | "court";
  court?: string;
  category?: HearingCategory | "all";
  sys?: SysCode[];
  layjudge?: boolean;
}

const UTF8_ENCODER = new TextEncoder();

function escapeIcsText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\r\n", "\\n")
    .replaceAll("\n", "\\n");
}

/**
 * RFC 5545 Section 3.1 content line folding:
 * Each physical line MUST be <= 75 octets (UTF-8 bytes), continuing with CRLF + single space,
 * without splitting multi-byte UTF-8 characters.
 */
export function foldIcsLine(line: string, maxOctets = 75): string {
  if (UTF8_ENCODER.encode(line).length <= maxOctets) {
    return line;
  }

  const chunks: string[] = [];
  let current = "";
  let currentBytes = 0;
  let limit = maxOctets;

  for (const ch of line) {
    const chBytes = UTF8_ENCODER.encode(ch).length;
    if (currentBytes + chBytes > limit && current.length > 0) {
      chunks.push(current);
      current = ch;
      currentBytes = chBytes;
      // Continuation lines begin with a single space (1 octet)
      limit = maxOctets - 1;
    } else {
      current += ch;
      currentBytes += chBytes;
    }
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks.join("\r\n ");
}

function toUtcStamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

/**
 * Convert Asia/Taipei local date (YYYY-MM-DD) & time (HH:mm) to UTC Date
 * (Taiwan has fixed UTC+8 with no DST).
 */
function taipeiToUtcDate(isoDate: string, hhmm: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, (hh || 9) - 8, mm || 0, 0));
}

function buildVEvent(
  h: CalendarHearingLike,
  nowStamp: string,
  options: { includeAlarm: boolean; siteOrigin?: string },
): string {
  const startUtc = taipeiToUtcDate(h.date, h.time);
  const durationMinutes = h.dukd.includes("宣判") ? 15 : 60;
  const endUtc = new Date(startUtc.getTime() + durationMinutes * 60_000);

  const summary = `[旁聽] ${h.courtName} ${h.courtroom}｜${h.dukd}${h.reason ? `（${h.reason}）` : ""}`;
  const location = `${h.campusName} ${h.address}`.trim();
  const detailUrl = options.siteOrigin
    ? `${options.siteOrigin.replace(/\/$/, "")}/hearings/${h.id}`
    : null;

  const descriptionLines = [
    `日期：${formatCompactDualDate(h.date)} ${h.time}`,
    `法院：${h.courtName}（${h.campusName}）`,
    `法庭：${h.courtroom}${h.division ? `｜${h.division}股` : ""}`,
    `案號：${h.caseNo}`,
    `庭類：${h.dukd}`,
    h.reason ? `案由：${h.reason}` : null,
    "",
    "旁聽提醒：",
    "• 建議提前 15–20 分鐘抵達並通過安檢門與 X 光檢查",
    "• 庭內嚴禁錄音、錄影、拍照，手機請關靜音",
    "• 庭期僅供參考，請以司法院最新公告與現場為準",
    detailUrl ? `旁聽詳情與交通：${detailUrl}` : null,
    `官方查詢頁：${h.sourceUrl}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const lines = [
    "BEGIN:VEVENT",
    `UID:${h.id}@tw-court-watch`,
    `DTSTAMP:${nowStamp}`,
    `DTSTART:${toUtcStamp(startUtc)}`,
    `DTEND:${toUtcStamp(endUtc)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(descriptionLines)}`,
  ];

  if (detailUrl) {
    lines.push(`URL:${detailUrl}`);
  }

  if (options.includeAlarm) {
    lines.push(
      "BEGIN:VALARM",
      "TRIGGER:-PT45M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeIcsText(`旁聽提醒：${h.courtName} ${h.courtroom}（記得提前過安檢、手機靜音）`)}`,
      "END:VALARM",
    );
  }

  lines.push("END:VEVENT");
  return lines.map((line) => foldIcsLine(line)).join("\r\n");
}

export function generateHearingIcs(
  hearing: CalendarHearingLike,
  now: Date = new Date(),
): string {
  return generateBatchIcs([hearing], now, {
    includeAlarm: true,
    siteOrigin: DEFAULT_SITE_ORIGIN,
  });
}

export function generateBatchIcs(
  hearings: Array<CalendarHearingLike | SavedHearing["snapshot"]>,
  now: Date = new Date(),
  options: CalendarFeedOptions = {},
): string {
  const stamp = toUtcStamp(now);
  const includeAlarm = options.includeAlarm ?? true;
  const refreshHours = options.refreshHours ?? 12;

  const headerLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//tw-court-watch//Taiwan Court Hearing Calendar//ZH",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-TIMEZONE:Asia/Taipei",
  ];

  if (options.calName) {
    headerLines.push(
      `NAME:${escapeIcsText(options.calName)}`,
      `X-WR-CALNAME:${escapeIcsText(options.calName)}`,
    );
  }

  if (options.calDesc) {
    headerLines.push(
      `DESCRIPTION:${escapeIcsText(options.calDesc)}`,
      `X-WR-CALDESC:${escapeIcsText(options.calDesc)}`,
    );
  }

  if (options.calName || options.refreshHours !== undefined) {
    headerLines.push(
      `REFRESH-INTERVAL;VALUE=DURATION:PT${refreshHours}H`,
      `X-PUBLISHED-TTL:PT${refreshHours}H`,
    );
  }

  const foldedHeader = headerLines.map((l) => foldIcsLine(l)).join("\r\n");
  const events = hearings
    .map((h) =>
      buildVEvent(h, stamp, {
        includeAlarm,
        siteOrigin: options.siteOrigin,
      }),
    )
    .join("\r\n");

  const parts = [foldedHeader];
  if (events) parts.push(events);
  parts.push("END:VCALENDAR", "");
  return parts.join("\r\n");
}

export function buildCalendarFeedPath(query: CalendarFeedQuery): string {
  const params = new URLSearchParams();

  if (query.mode === "layjudge") {
    params.set("mode", "layjudge");
  } else if (query.mode === "featured") {
    params.set("mode", "featured");
  } else if (query.court) {
    params.set("court", query.court.toUpperCase());
    if (query.category && query.category !== "trial") {
      params.set("category", query.category);
    } else if (query.category === "trial") {
      params.set("category", "trial");
    }
    if (query.sys && query.sys.length > 0) {
      params.set("sys", query.sys.join(","));
    }
    if (query.layjudge) {
      params.set("layjudge", "1");
    }
  } else {
    params.set("mode", "layjudge");
  }

  return `/api/calendar.ics?${params.toString()}`;
}

export function toWebcalUrl(httpsUrl: string): string {
  return httpsUrl.replace(/^https?:\/\//i, "webcal://");
}

export function buildGoogleCalendarSubscribeUrl(httpsFeedUrl: string): string {
  const webcal = toWebcalUrl(httpsFeedUrl);
  return `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`;
}
