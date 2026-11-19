import type { CampusLocation, CourtInfo, CourtLevel } from "./types";

export const OFFICIAL_QUERY_BASE =
  "https://csdi3.judicial.gov.tw/judbp/wkw/WHD1A03.htm";

export const OFFICIAL_LAY_JUDGE_URL =
  "https://csdi3.judicial.gov.tw/judbp/wkw/WHD1A03B.htm";

export const OFFICIAL_LIVE_STATUS_URL =
  "https://csdi3.judicial.gov.tw/judbp/ctstate/index.jsp";

export function getOfficialQueryUrl(crtid?: string): string {
  if (!crtid) return OFFICIAL_QUERY_BASE;
  return `${OFFICIAL_QUERY_BASE}?crtid=${encodeURIComponent(crtid)}`;
}

export const COURT_LEVEL_LABELS: Record<CourtLevel, string> = {
  supreme: "終審／專門法院",
  high: "高等法院及分院",
  admin_ip: "高等行政／智財及商業法院",
  district: "地方法院",
};

/**
 * 38 major courts in Taiwan (excludes KSY 高雄少年及家事法院 as non-public).
 * Note: District court schedules in WHD1A03 sometimes include rooms belonging
 * to attached simple divisions (e.g. TPD includes 台北簡易庭); `campuses`
 * resolves those courtrooms to their actual street address.
 */
export const MAJOR_COURTS: CourtInfo[] = [
  // === 終審 / 專門法院 ===
  {
    crtid: "TPS",
    name: "最高法院",
    shortName: "最高法院",
    level: "supreme",
    region: "north",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "最高法院",
        address: "臺北市中正區長沙街一段6號",
        transit: "捷運西門站 2 號出口步行約 6 分鐘／小南門站步行約 7 分鐘",
      },
    ],
  },
  {
    crtid: "TPA",
    name: "最高行政法院",
    shortName: "最高行政",
    level: "supreme",
    region: "north",
    sysCodes: ["A"],
    campuses: [
      {
        name: "最高行政法院",
        address: "臺北市中正區重慶南路一段126巷1號",
        transit: "捷運臺大醫院站 1 號出口步行約 7 分鐘／小南門站步行約 8 分鐘",
      },
    ],
  },
  {
    crtid: "TPP",
    name: "懲戒法院",
    shortName: "懲戒法院",
    level: "supreme",
    region: "north",
    sysCodes: ["P", "D"],
    campuses: [
      {
        name: "懲戒法院",
        address: "臺北市中正區重慶南路一段124號3樓",
        transit: "捷運臺大醫院站 1 號出口步行約 7 分鐘",
      },
    ],
  },

  // === 高等法院及分院 ===
  {
    crtid: "TPH",
    name: "臺灣高等法院",
    shortName: "臺灣高院",
    level: "high",
    region: "north",
    sysCodes: ["H", "V"],
    popular: true,
    campuses: [
      {
        name: "臺灣高等法院民事庭大廈",
        address: "臺北市中正區貴陽街一段233號",
        transit: "捷運西門站 2 號出口步行約 5 分鐘／小南門站 1 號出口步行約 6 分鐘",
        roomMatchers: ["民事", "民庭"],
      },
      {
        name: "臺灣高等法院刑事庭大廈（本院）",
        address: "臺北市中正區博愛路127號",
        transit: "捷運小南門站 1 號出口步行約 4 分鐘／西門站 2 號出口步行約 6 分鐘",
      },
    ],
  },
  {
    crtid: "TCH",
    name: "臺灣高等法院臺中分院",
    shortName: "臺中高分院",
    level: "high",
    region: "central",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣高等法院臺中分院",
        address: "臺中市南區五權南路99號",
        transit: "臺鐵五權站步行約 10 分鐘",
      },
    ],
  },
  {
    crtid: "TNH",
    name: "臺灣高等法院臺南分院",
    shortName: "臺南高分院",
    level: "high",
    region: "south",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣高等法院臺南分院",
        address: "臺南市中西區中山路170號",
        transit: "臺鐵臺南站步行約 12 分鐘",
      },
    ],
  },
  {
    crtid: "KSH",
    name: "臺灣高等法院高雄分院",
    shortName: "高雄高分院",
    level: "high",
    region: "south",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣高等法院高雄分院",
        address: "高雄市鼓山區明誠三路586號",
        transit: "捷運凹子底站 3 號出口步行約 10 分鐘／輕軌龍華國小站",
      },
    ],
  },
  {
    crtid: "HLH",
    name: "臺灣高等法院花蓮分院",
    shortName: "花蓮高分院",
    level: "high",
    region: "east",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣高等法院花蓮分院",
        address: "花蓮縣花蓮市民權路127號",
        transit: "花蓮縣政府附近，公車美崙站下車",
      },
    ],
  },
  {
    crtid: "KMH",
    name: "福建高等法院金門分院",
    shortName: "金門高分院",
    level: "high",
    region: "islands",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "福建高等法院金門分院",
        address: "金門縣金城鎮民權路178號",
      },
    ],
  },

  // === 高等行政 / 智財及商業法院 ===
  {
    crtid: "TPB",
    name: "臺北高等行政法院高等庭",
    shortName: "北高行高等庭",
    level: "admin_ip",
    region: "north",
    sysCodes: ["A"],
    popular: true,
    campuses: [
      {
        name: "臺北高等行政法院（士林院區）",
        address: "臺北市士林區福國路101號",
        transit: "捷運芝山站 1 號出口步行約 4 分鐘",
      },
    ],
  },
  {
    crtid: "TPT",
    name: "臺北高等行政法院地方庭",
    shortName: "北高行地方庭",
    level: "admin_ip",
    region: "north",
    sysCodes: ["A"],
    campuses: [
      {
        name: "臺北高等行政法院地方行政訴訟庭",
        address: "臺北市士林區福國路101號",
        transit: "捷運芝山站 1 號出口步行約 4 分鐘",
      },
    ],
  },
  {
    crtid: "TCB",
    name: "臺中高等行政法院高等庭",
    shortName: "中高行高等庭",
    level: "admin_ip",
    region: "central",
    sysCodes: ["A"],
    campuses: [
      {
        name: "臺中高等行政法院",
        address: "臺中市南區五權南路99號",
        transit: "臺鐵五權站步行約 10 分鐘",
      },
    ],
  },
  {
    crtid: "TCT",
    name: "臺中高等行政法院地方庭",
    shortName: "中高行地方庭",
    level: "admin_ip",
    region: "central",
    sysCodes: ["A"],
    campuses: [
      {
        name: "臺中高等行政法院地方行政訴訟庭",
        address: "臺中市南區五權南路99號",
        transit: "臺鐵五權站步行約 10 分鐘",
      },
    ],
  },
  {
    crtid: "KSB",
    name: "高雄高等行政法院高等庭",
    shortName: "高高行高等庭",
    level: "admin_ip",
    region: "south",
    sysCodes: ["A"],
    campuses: [
      {
        name: "高雄高等行政法院",
        address: "高雄市楠梓區興楠路180號",
        transit: "捷運楠梓科技園區站轉公車或步行約 15 分鐘",
      },
    ],
  },
  {
    crtid: "KST",
    name: "高雄高等行政法院地方庭",
    shortName: "高高行地方庭",
    level: "admin_ip",
    region: "south",
    sysCodes: ["A"],
    campuses: [
      {
        name: "高雄高等行政法院地方行政訴訟庭",
        address: "高雄市楠梓區興楠路180號",
      },
    ],
  },
  {
    crtid: "IPC",
    name: "智慧財產及商業法院",
    shortName: "智財及商業法院",
    level: "admin_ip",
    region: "north",
    sysCodes: ["B", "V", "H", "A"],
    campuses: [
      {
        name: "智慧財產及商業法院（板橋院區）",
        address: "新北市板橋區縣民大道二段7號3–5樓",
        transit: "高鐵／臺鐵／捷運板橋站共構大樓（南三門方向）",
      },
    ],
  },

  // === 22 所地方法院 ===
  {
    crtid: "TPD",
    name: "臺灣臺北地方法院",
    shortName: "臺北地院",
    level: "district",
    region: "north",
    sysCodes: ["H", "V"],
    popular: true,
    campuses: [
      {
        name: "臺北地院臺北簡易庭（重慶南路院區）",
        address: "臺北市中正區重慶南路一段126巷1號",
        transit: "捷運臺大醫院站 1 號出口步行約 7 分鐘／小南門站步行約 8 分鐘",
        roomMatchers: ["台北簡易庭", "臺北簡易庭"],
      },
      {
        name: "臺北地院新店簡易庭",
        address: "新北市新店區中興路一段248號",
        transit: "捷運新店區公所站 1 號出口步行約 5 分鐘",
        roomMatchers: ["新店簡易庭", "新店"],
      },
      {
        name: "臺北地院寶慶院區",
        address: "臺北市中正區長沙街一段27號",
        transit: "捷運西門站 2 號出口步行約 5 分鐘",
        roomMatchers: ["寶慶"],
      },
      {
        name: "臺灣臺北地方法院（博愛路本院）",
        address: "臺北市中正區博愛路131號",
        transit: "捷運小南門站 1 號出口步行約 3 分鐘／西門站 2 號出口步行約 7 分鐘",
      },
    ],
  },
  {
    crtid: "PCD",
    name: "臺灣新北地方法院",
    shortName: "新北地院",
    level: "district",
    region: "north",
    sysCodes: ["H", "V"],
    popular: true,
    campuses: [
      {
        name: "新北地院板橋院區（板橋簡易庭）",
        address: "新北市板橋區民生路一段30巷1號",
        transit: "捷運新埔站／板新站轉公車或步行約 12 分鐘",
        roomMatchers: ["板橋簡易庭", "板橋"],
      },
      {
        name: "新北地院三重簡易庭",
        address: "新北市三重區重新路三段145號",
        transit: "捷運先嗇宮站步行約 10 分鐘／菜寮站轉公車",
        roomMatchers: ["三重簡易庭", "三重"],
      },
      {
        name: "臺灣新北地方法院（土城本院）",
        address: "新北市土城區金城路二段249號",
        transit: "捷運海山站 3 號出口轉公車或步行約 15 分鐘",
      },
    ],
  },
  {
    crtid: "SLD",
    name: "臺灣士林地方法院",
    shortName: "士林地院",
    level: "district",
    region: "north",
    sysCodes: ["H", "V"],
    popular: true,
    campuses: [
      {
        name: "士林地院內湖民事辦公大樓（內湖簡易庭）",
        address: "臺北市內湖區民權東路六段91號",
        transit: "公車民權敦化／時報廣場站步行約 5 分鐘",
        roomMatchers: ["內湖"],
      },
      {
        name: "士林地院士林簡易庭",
        address: "臺北市士林區重慶北路四段2號",
        transit: "捷運劍潭站轉公車至百齡橋／重慶北路四段",
        roomMatchers: ["士林簡易庭"],
      },
      {
        name: "臺灣士林地方法院（士東路本院）",
        address: "臺北市士林區士東路190號",
        transit: "捷運芝山站 2 號出口步行約 15 分鐘或轉公車至士林地方法院站",
      },
    ],
  },
  {
    crtid: "TYD",
    name: "臺灣桃園地方法院",
    shortName: "桃園地院",
    level: "district",
    region: "north",
    sysCodes: ["H", "V"],
    popular: true,
    campuses: [
      {
        name: "桃園地院中壢簡易庭",
        address: "桃園市中壢區中華路二段388號",
        roomMatchers: ["中壢"],
      },
      {
        name: "桃園地院桃園簡易庭",
        address: "桃園市桃園區仁愛路120號",
        roomMatchers: ["桃園簡易庭"],
      },
      {
        name: "臺灣桃園地方法院（本院）",
        address: "桃園市桃園區正光路888號",
        transit: "公車桃園地方法院站（中路特區）",
      },
    ],
  },
  {
    crtid: "SCD",
    name: "臺灣新竹地方法院",
    shortName: "新竹地院",
    level: "district",
    region: "north",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣新竹地方法院（竹北本院）",
        address: "新竹縣竹北市興隆路二段265號",
        transit: "高鐵新竹站車程約 8 分鐘",
      },
    ],
  },
  {
    crtid: "MLD",
    name: "臺灣苗栗地方法院",
    shortName: "苗栗地院",
    level: "district",
    region: "central",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣苗栗地方法院",
        address: "苗栗縣苗栗市中正路1149號",
      },
    ],
  },
  {
    crtid: "TCD",
    name: "臺灣臺中地方法院",
    shortName: "臺中地院",
    level: "district",
    region: "central",
    sysCodes: ["H", "V"],
    popular: true,
    campuses: [
      {
        name: "臺中地院豐原簡易庭",
        address: "臺中市潭子區豐興路一段139號",
        roomMatchers: ["豐原"],
      },
      {
        name: "臺中地院沙鹿簡易庭",
        address: "臺中市沙鹿區中山路689號",
        roomMatchers: ["沙鹿"],
      },
      {
        name: "臺灣臺中地方法院（本院）",
        address: "臺中市西區自由路一段91號",
        transit: "臺鐵臺中站轉公車至臺中地方法院站，車程約 10 分鐘",
      },
    ],
  },
  {
    crtid: "NTD",
    name: "臺灣南投地方法院",
    shortName: "南投地院",
    level: "district",
    region: "central",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣南投地方法院",
        address: "南投縣南投市中興路759號",
      },
    ],
  },
  {
    crtid: "CHD",
    name: "臺灣彰化地方法院",
    shortName: "彰化地院",
    level: "district",
    region: "central",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣彰化地方法院（員林本院）",
        address: "彰化縣員林市員林大道二段1號",
      },
    ],
  },
  {
    crtid: "ULD",
    name: "臺灣雲林地方法院",
    shortName: "雲林地院",
    level: "district",
    region: "central",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣雲林地方法院",
        address: "雲林縣虎尾鎮明正路38號",
      },
    ],
  },
  {
    crtid: "CYD",
    name: "臺灣嘉義地方法院",
    shortName: "嘉義地院",
    level: "district",
    region: "south",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣嘉義地方法院",
        address: "嘉義市東區林森東路282號",
      },
    ],
  },
  {
    crtid: "TND",
    name: "臺灣臺南地方法院",
    shortName: "臺南地院",
    level: "district",
    region: "south",
    sysCodes: ["H", "V"],
    popular: true,
    campuses: [
      {
        name: "臺灣臺南地方法院（本院）",
        address: "臺南市安平區健康路三段308號",
        transit: "臺南市公車地方法院站",
      },
    ],
  },
  {
    crtid: "KSD",
    name: "臺灣高雄地方法院",
    shortName: "高雄地院",
    level: "district",
    region: "south",
    sysCodes: ["H", "V"],
    popular: true,
    campuses: [
      {
        name: "高雄地院鳳山簡易庭",
        address: "高雄市鳳山區國泰路二段96號",
        roomMatchers: ["鳳山"],
      },
      {
        name: "臺灣高雄地方法院（本院）",
        address: "高雄市前金區河東路188號",
        transit: "捷運市議會站 1 號出口步行約 8 分鐘／輕軌真愛碼頭站",
      },
    ],
  },
  {
    crtid: "CTD",
    name: "臺灣橋頭地方法院",
    shortName: "橋頭地院",
    level: "district",
    region: "south",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣橋頭地方法院",
        address: "高雄市橋頭區經武路911號",
        transit: "捷運青埔站步行約 10 分鐘",
      },
    ],
  },
  {
    crtid: "PTD",
    name: "臺灣屏東地方法院",
    shortName: "屏東地院",
    level: "district",
    region: "south",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣屏東地方法院",
        address: "屏東縣屏東市棒球路9號",
      },
    ],
  },
  {
    crtid: "TTD",
    name: "臺灣臺東地方法院",
    shortName: "臺東地院",
    level: "district",
    region: "east",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣臺東地方法院",
        address: "臺東縣臺東市博愛路128號",
      },
    ],
  },
  {
    crtid: "HLD",
    name: "臺灣花蓮地方法院",
    shortName: "花蓮地院",
    level: "district",
    region: "east",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣花蓮地方法院",
        address: "花蓮縣花蓮市府前路15號",
      },
    ],
  },
  {
    crtid: "ILD",
    name: "臺灣宜蘭地方法院",
    shortName: "宜蘭地院",
    level: "district",
    region: "east",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣宜蘭地方法院",
        address: "宜蘭縣宜蘭市縣政西路1號",
      },
    ],
  },
  {
    crtid: "KLD",
    name: "臺灣基隆地方法院",
    shortName: "基隆地院",
    level: "district",
    region: "north",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣基隆地方法院",
        address: "基隆市信義區東信路176號",
      },
    ],
  },
  {
    crtid: "PHD",
    name: "臺灣澎湖地方法院",
    shortName: "澎湖地院",
    level: "district",
    region: "islands",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "臺灣澎湖地方法院",
        address: "澎湖縣馬公市西文里西文澳310號",
      },
    ],
  },
  {
    crtid: "KMD",
    name: "福建金門地方法院",
    shortName: "金門地院",
    level: "district",
    region: "islands",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "福建金門地方法院",
        address: "金門縣金城鎮民權路178號",
      },
    ],
  },
  {
    crtid: "LCD",
    name: "福建連江地方法院",
    shortName: "連江地院",
    level: "district",
    region: "islands",
    sysCodes: ["H", "V"],
    campuses: [
      {
        name: "福建連江地方法院",
        address: "連江縣南竿鄉復興村209號",
      },
    ],
  },
];

export const COURT_BY_ID: Record<string, CourtInfo> = Object.fromEntries(
  MAJOR_COURTS.map((c) => [c.crtid, c]),
);

export const POPULAR_COURTS = MAJOR_COURTS.filter((c) => c.popular);

/**
 * Resolve exact campus/building address based on court + courtroom name.
 * Falls back to the last (default/main) campus for that court.
 */
export function resolveCampusLocation(
  court: CourtInfo,
  courtroom: string,
): CampusLocation {
  const room = courtroom.trim();
  for (const campus of court.campuses) {
    if (
      campus.roomMatchers &&
      campus.roomMatchers.some((matcher) => room.includes(matcher))
    ) {
      return campus;
    }
  }
  return court.campuses[court.campuses.length - 1];
}

export function getGoogleMapsUrl(campusName: string, address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${campusName} ${address}`)}`;
}
