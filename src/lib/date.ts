const WEEKDAYS_ZH = ["日", "一", "二", "三", "四", "五", "六"] as const;

/**
 * Convert ROC date string ("1151119" or "115/11/19") to ISO "YYYY-MM-DD".
 * Returns null for invalid dates.
 */
export function rocToIso(rocInput: string): string | null {
  const cleaned = rocInput.trim().replaceAll("/", "").replaceAll("-", "");
  if (!/^\d{6,7}$/.test(cleaned)) return null;

  const rocYear = Number.parseInt(cleaned.slice(0, cleaned.length - 4), 10);
  const month = Number.parseInt(cleaned.slice(-4, -2), 10);
  const day = Number.parseInt(cleaned.slice(-2), 10);

  if (Number.isNaN(rocYear) || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const year = rocYear + 1911;
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    return null;
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Convert ISO "YYYY-MM-DD" to 7-digit ROC string e.g. "1151119".
 */
export function isoToRoc(iso: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const rocYear = year - 1911;
  if (rocYear <= 0) return null;

  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    return null;
  }

  return `${String(rocYear).padStart(3, "0")}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`;
}

/**
 * Parse flexible user input accepting either Gregorian (2026-11-20, 2026/11/20, 20261120)
 * or ROC (1151120, 115/11/20, 115-11-20) into ISO YYYY-MM-DD.
 */
export function parseUserDateInput(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;

  // Gregorian YYYY-MM-DD or YYYY/MM/DD
  const gMatch = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/.exec(s);
  if (gMatch) {
    const iso = `${gMatch[1]}-${gMatch[2].padStart(2, "0")}-${gMatch[3].padStart(2, "0")}`;
    return isoToRoc(iso) ? iso : null;
  }

  // Gregorian YYYYMMDD
  if (/^(19|20)\d{6}$/.test(s)) {
    const iso = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
    return isoToRoc(iso) ? iso : null;
  }

  // ROC YYY/MM/DD or YYY-MM-DD
  const rMatch = /^(\d{2,3})[-/](\d{1,2})[-/](\d{1,2})$/.exec(s);
  if (rMatch) {
    return rocToIso(
      `${rMatch[1].padStart(3, "0")}${rMatch[2].padStart(2, "0")}${rMatch[3].padStart(2, "0")}`,
    );
  }

  // ROC 6 or 7 digits
  return rocToIso(s);
}

/** Get weekday character in Traditional Chinese for an ISO date */
export function getWeekdayZh(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return "";
  const dt = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
  return WEEKDAYS_ZH[dt.getUTCDay()] ?? "";
}

/**
 * Full dual calendar display:
 * "2026/11/19（四）｜民國 115 年 11 月 19 日"
 */
export function formatDualDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const rocYear = year - 1911;
  const wd = getWeekdayZh(iso);
  return `${year}/${match[2]}/${match[3]}（${wd}）｜民國 ${rocYear} 年 ${month} 月 ${day} 日`;
}

/**
 * Compact dual calendar display for cards:
 * "2026/11/19（四）· 民國 115/11/19"
 */
export function formatCompactDualDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const year = Number(match[1]);
  const rocYear = year - 1911;
  const wd = getWeekdayZh(iso);
  return `${year}/${match[2]}/${match[3]}（${wd}）· 民國 ${rocYear}/${match[2]}/${match[3]}`;
}

/**
 * Format 4-digit time "0929" -> "09:29".
 */
export function formatHearingTime(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 4) {
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  }
  if (digits.length === 3) {
    return `0${digits[0]}:${digits.slice(1, 3)}`;
  }
  return raw.trim() || "00:00";
}

/** Get current YYYY-MM-DD in Asia/Taipei timezone */
export function getTaipeiTodayIso(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const y = parts.find((p) => p.type === "year")?.value ?? "2026";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

/** Add days to an ISO date string safely in UTC */
export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

export function formatSyncedAt(isoTimestamp: string): string {
  try {
    const dt = new Date(isoTimestamp);
    const formatted = new Intl.DateTimeFormat("zh-TW", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(dt);
    const taipeiDate = getTaipeiTodayIso(dt);
    const rocYear = Number(taipeiDate.slice(0, 4)) - 1911;
    return `${formatted}（民國 ${rocYear} 年）`;
  } catch {
    return isoTimestamp;
  }
}

export function rocYearToGregorian(rocYear: number): number {
  return rocYear + 1911;
}

export function gregorianYearToRoc(year: number): number {
  return year - 1911;
}
