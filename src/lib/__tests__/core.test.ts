import { describe, expect, it } from "bun:test";
import { COURT_BY_ID, resolveCampusLocation } from "../courts";
import {
  formatCompactDualDate,
  formatDualDate,
  formatHearingTime,
  isoToRoc,
  parseUserDateInput,
  rocToIso,
} from "../date";
import {
  buildHearingId,
  classifyHearingCategory,
  classifyNonPublic,
  detectNotePiiWarnings,
  formatCaseNo,
  isLayJudgeCase,
} from "../filter";
import { compactHearing, hydrateHearing } from "../hydrate";
import {
  buildCalendarFeedPath,
  buildGoogleCalendarSubscribeUrl,
  foldIcsLine,
  generateBatchIcs,
  generateHearingIcs,
  toWebcalUrl,
} from "../ics";

describe("ROC <-> Gregorian date conversion", () => {
  it("converts 7-digit and slash ROC dates to ISO", () => {
    expect(rocToIso("1151119")).toBe("2026-11-19");
    expect(rocToIso("115/11/19")).toBe("2026-11-19");
    expect(rocToIso("1060115")).toBe("2017-01-15");
    expect(rocToIso("1150230")).toBeNull();
  });

  it("converts ISO to 7-digit ROC", () => {
    expect(isoToRoc("2026-11-20")).toBe("1151120");
    expect(isoToRoc("2017-01-15")).toBe("1060115");
    expect(isoToRoc("invalid")).toBeNull();
  });

  it("parses flexible user input (Gregorian & ROC)", () => {
    expect(parseUserDateInput("2026-11-20")).toBe("2026-11-20");
    expect(parseUserDateInput("2026/11/20")).toBe("2026-11-20");
    expect(parseUserDateInput("20261120")).toBe("2026-11-20");
    expect(parseUserDateInput("1151120")).toBe("2026-11-20");
    expect(parseUserDateInput("115/11/20")).toBe("2026-11-20");
    expect(parseUserDateInput("abc")).toBeNull();
  });

  it("formats dual calendar strings and hearing time", () => {
    expect(formatDualDate("2026-11-19")).toBe(
      "2026/11/19（四）｜民國 115 年 11 月 19 日",
    );
    expect(formatCompactDualDate("2026-11-19")).toBe(
      "2026/11/19（四）· 民國 115/11/19",
    );
    expect(formatHearingTime("0929")).toBe("09:29");
    expect(formatHearingTime("930")).toBe("09:30");
  });
});

describe("Non-public hearing filter & dukd classifier", () => {
  it("excludes mediation, non-public procedures, family, juvenile, and sensitive cases", () => {
    expect(
      classifyNonPublic({
        crtid: "TPD",
        sysCode: "H",
        crmid: "訴",
        courtroom: "刑事三樓調解室(五)",
        dukd: "調解",
        reason: "組織犯罪防制條例等",
      }),
    ).toBe("mediation");

    expect(
      classifyNonPublic({
        crtid: "TPD",
        sysCode: "H",
        crmid: "國審訴",
        courtroom: "個別詢問室暨評議室",
        dukd: "協商程序(不公開)",
        reason: "傷害致死",
      }),
    ).toBe("non_public_procedure");

    expect(
      classifyNonPublic({
        crtid: "TPD",
        sysCode: "V",
        crmid: "家非調",
        courtroom: "調解室(三)二樓",
        dukd: "調解",
        reason: "",
      }),
    ).toBe("family");

    expect(
      classifyNonPublic({
        crtid: "TPD",
        sysCode: "I",
        crmid: "少調",
        courtroom: "2F第九調解室",
        dukd: "調解",
        reason: "",
      }),
    ).toBe("juvenile");

    expect(
      classifyNonPublic({
        crtid: "TPD",
        sysCode: "H",
        crmid: "訴",
        courtroom: "第10法庭",
        dukd: "宣判",
        reason: "妨害性隱私及不實性影像",
      }),
    ).toBe("sensitive_case");
  });

  it("keeps public trial, prep, and lay-judge hearings", () => {
    expect(
      classifyNonPublic({
        crtid: "TPD",
        sysCode: "H",
        crmid: "國審重訴",
        courtroom: "1樓國民法官第1法庭",
        dukd: "準備程序",
        reason: "殺人等",
      }),
    ).toBeNull();

    expect(
      classifyNonPublic({
        crtid: "TPD",
        sysCode: "V",
        crmid: "訴",
        courtroom: "第30法庭",
        dukd: "言詞辯論",
        reason: "清償借款",
      }),
    ).toBeNull();
  });

  it("classifies dukd categories and lay-judge prefixes", () => {
    expect(classifyHearingCategory("言詞辯論")).toBe("trial");
    expect(classifyHearingCategory("審理")).toBe("trial");
    expect(classifyHearingCategory("準備程序")).toBe("prep");
    expect(classifyHearingCategory("宣判")).toBe("verdict");
    expect(isLayJudgeCase("國審訴")).toBe(true);
    expect(isLayJudgeCase("訴")).toBe(false);
    expect(formatCaseNo(115, "易", "000727")).toBe("115年度易字第727號");
  });

  it("produces deterministic ASCII hearing IDs starting with crtid", () => {
    const id1 = buildHearingId({
      crtid: "TPD",
      sysCode: "H",
      rocYear: 115,
      crmid: "訴",
      crmnoRaw: "000668",
      rocDate: "1151119",
      timeRaw: "0930",
      courtroom: "第11法庭",
    });
    const id2 = buildHearingId({
      crtid: "TPD",
      sysCode: "H",
      rocYear: 115,
      crmid: "訴",
      crmnoRaw: "000668",
      rocDate: "1151119",
      timeRaw: "0930",
      courtroom: "第11法庭",
    });
    expect(id1).toBe(id2);
    expect(id1).toMatch(/^TPD-1151119-0930-[0-9a-f]{8}$/);
  });
});

describe("Multi-campus courtroom address resolution", () => {
  it("routes TPD simple courtrooms to Chongqing S Rd instead of Bo'ai Rd", () => {
    const tpd = COURT_BY_ID.TPD;
    const simpleCampus = resolveCampusLocation(tpd, "台北簡易庭第7法庭");
    expect(simpleCampus.address).toContain("重慶南路");

    const mainCampus = resolveCampusLocation(tpd, "第11法庭");
    expect(mainCampus.address).toContain("博愛路");
  });
});

describe("ICS generation & PII guard", () => {
  it("generates valid VCALENDAR with UTC start time (Taipei UTC+8 -> UTC)", () => {
    const ics = generateHearingIcs({
      id: "TPD-1151119-0930-abcd1234",
      courtName: "臺灣臺北地方法院",
      courtroom: "第11法庭",
      caseNo: "115年度訴字第668號",
      dukd: "審理",
      reason: "詐欺等",
      date: "2026-11-19",
      time: "09:30",
      campusName: "臺灣臺北地方法院（博愛路本院）",
      address: "臺北市中正區博愛路131號",
      sourceUrl: "https://csdi3.judicial.gov.tw/judbp/wkw/WHD1A03.htm?crtid=TPD",
      division: "和",
    });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART:20261119T013000Z");
    expect(ics).toContain("DTEND:20261119T023000Z");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("warns on Taiwan ID and mobile phone patterns in notes", () => {
    expect(detectNotePiiWarnings("旁聽紀錄正常內容")).toHaveLength(0);
    expect(detectNotePiiWarnings("聯絡電話 0912-345-678")).toHaveLength(1);
    expect(detectNotePiiWarnings("身分證 A123456789")).toHaveLength(1);
  });

  it("round-trips Hearing through compact tuple and hydration", () => {
    const hydrated = hydrateHearing("TPD", [
      "TPD-1151119-0930-abcd1234",
      "H",
      115,
      "國審訴",
      "000002",
      "和",
      "1樓國民法官第1法庭",
      "審理",
      "傷害致死",
      "2026-11-19",
      "09:30",
    ]);
    expect(hydrated.courtName).toBe("臺灣臺北地方法院");
    expect(hydrated.isLayJudge).toBe(true);
    expect(hydrated.category).toBe("trial");
    expect(hydrated.caseNo).toBe("115年度國審訴字第2號");
    expect(hydrated.rocDate).toBe("1151119");
    expect(compactHearing(hydrated)[0]).toBe("TPD-1151119-0930-abcd1234");
  });

  it("folds long UTF-8 ICS lines cleanly within 75 octets and builds subscription feed metadata", () => {
    const longLine = `SUMMARY:${"臺灣臺北地方法院國民法官審理程序".repeat(5)}`;
    const folded = foldIcsLine(longLine);
    const encoder = new TextEncoder();
    const physicalLines = folded.split("\r\n");
    expect(physicalLines.length).toBeGreaterThan(1);
    for (const part of physicalLines) {
      expect(encoder.encode(part).length).toBeLessThanOrEqual(75);
    }
    // Unfolding (removing CRLF + single space) restores original exact string
    expect(folded.replaceAll("\r\n ", "")).toBe(longLine);

    const feed = generateBatchIcs(
      [
        {
          id: "TPD-1151119-0930-abcd1234",
          courtName: "臺灣臺北地方法院",
          courtroom: "第11法庭",
          caseNo: "115年度國審訴字第2號",
          dukd: "審理",
          reason: "傷害致死",
          date: "2026-11-19",
          time: "09:30",
          campusName: "臺灣臺北地方法院（博愛路本院）",
          address: "臺北市中正區博愛路131號",
          sourceUrl: "https://csdi3.judicial.gov.tw/judbp/wkw/WHD1A03.htm?crtid=TPD",
          division: "和",
        },
      ],
      new Date("2026-11-19T00:00:00Z"),
      {
        calName: "旁聽小幫手｜全台國民法官開庭日曆",
        calDesc: "每日自動同步",
        refreshHours: 12,
        siteOrigin: "https://court.yukai.dev",
        includeAlarm: false,
      },
    );

    expect(feed).toContain("X-WR-TIMEZONE:Asia/Taipei");
    expect(feed).toContain("REFRESH-INTERVAL;VALUE=DURATION:PT12H");
    expect(feed).toContain("X-PUBLISHED-TTL:PT12H");
    expect(feed).toContain("URL:https://court.yukai.dev/hearings/TPD-1151119-0930-abcd1234");
    expect(feed).not.toContain("BEGIN:VALARM");

    const path = buildCalendarFeedPath({ mode: "layjudge" });
    expect(path).toBe("/api/calendar.ics?mode=layjudge");
    expect(toWebcalUrl(`https://court.yukai.dev${path}`)).toBe(
      "webcal://court.yukai.dev/api/calendar.ics?mode=layjudge",
    );
    expect(
      buildGoogleCalendarSubscribeUrl(`https://court.yukai.dev${path}`),
    ).toBe(
      "https://calendar.google.com/calendar/render?cid=webcal%3A%2F%2Fcourt.yukai.dev%2Fapi%2Fcalendar.ics%3Fmode%3Dlayjudge",
    );
  });
});
