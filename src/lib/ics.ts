import type { Hearing, SavedHearing } from "./types";
import { formatCompactDualDate } from "./date";

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

function escapeIcsText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\r\n", "\\n")
    .replaceAll("\n", "\\n");
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

function buildVEvent(h: CalendarHearingLike, nowStamp: string): string {
  const startUtc = taipeiToUtcDate(h.date, h.time);
  const durationMinutes = h.dukd.includes("宣判") ? 15 : 60;
  const endUtc = new Date(startUtc.getTime() + durationMinutes * 60_000);

  const summary = `[旁聽] ${h.courtName} ${h.courtroom}｜${h.dukd}${h.reason ? `（${h.reason}）` : ""}`;
  const location = `${h.campusName} ${h.address}`.trim();
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
    `官方查詢頁：${h.sourceUrl}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  return [
    "BEGIN:VEVENT",
    `UID:${h.id}@tw-court-watch`,
    `DTSTAMP:${nowStamp}`,
    `DTSTART:${toUtcStamp(startUtc)}`,
    `DTEND:${toUtcStamp(endUtc)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(descriptionLines)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT45M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcsText(`旁聽提醒：${h.courtName} ${h.courtroom}（記得提前過安檢、手機靜音）`)}`,
    "END:VALARM",
    "END:VEVENT",
  ].join("\r\n");
}

export function generateHearingIcs(
  hearing: CalendarHearingLike,
  now: Date = new Date(),
): string {
  return generateBatchIcs([hearing], now);
}

export function generateBatchIcs(
  hearings: Array<CalendarHearingLike | SavedHearing["snapshot"]>,
  now: Date = new Date(),
): string {
  const stamp = toUtcStamp(now);
  const events = hearings.map((h) => buildVEvent(h, stamp)).join("\r\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//tw-court-watch//Taiwan Court Hearing Calendar//ZH",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
