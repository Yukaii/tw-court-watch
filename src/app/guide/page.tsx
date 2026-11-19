import {
  Ban,
  CheckCircle2,
  DoorOpen,
  ExternalLink,
  NotebookPen,
  Scale,
  ShieldCheck,
  VolumeX,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LEGISPEDIA_THREAD_URL } from "@/components/SiteFooter";
import { HEARING_CATEGORY_META } from "@/lib/filter";

export const metadata: Metadata = {
  title: "法庭旁聽守則",
  description:
    "第一次去台灣法院旁聽必看：安檢流程、進法庭與起立禮儀、禁錄音拍照紅線、紙筆筆記方法，以及如何看懂審理、言詞辯論、準備程序與宣判。",
};

const SIX_RULES = [
  {
    clause: "第一條",
    icon: ShieldCheck,
    title: "免預約、免門票，入內須通過安全檢查",
    body: "一般公開法庭無須事先預約或購票。抵達法院大門後，須通過金屬探測門並將隨身物品置於 X 光機檢查，建議比預定開庭時間提前 15 至 20 分鐘抵達。",
    alert: false,
  },
  {
    clause: "第二條",
    icon: DoorOpen,
    title: "庭門敞開即可靜步入座後方旁聽席",
    body: "找到對應法庭後，請先確認門外電子看板的開庭順序與案號。凡庭門敞開且未標示「不公開審理」或「須領旁聽證」者，皆可輕推開門入座後方旁聽席。",
    alert: false,
  },
  {
    clause: "第三條",
    icon: Scale,
    title: "法官入庭、退庭及宣判時請起立致意",
    body: "聽聞通譯或法警喊「起立」時（法官進場、退庭及宣判主文時），隨現場人員一同起身致意即可，無須過度拘謹。",
    alert: false,
  },
  {
    clause: "第四條",
    icon: Ban,
    title: "庭內嚴禁錄音、錄影及拍照（法定紅線）",
    body: "依《法院組織法》及法庭旁聽規則，開庭期間一律禁止錄音、錄影或拍照，未開啟閃光燈亦同。建議入庭前直接將手機收妥於隨身包內。",
    alert: true,
  },
  {
    clause: "第五條",
    icon: VolumeX,
    title: "手機靜音、禁飲食、禁喧嘩或鼓掌",
    body: "進入法庭前請將手機切為完全靜音（建議一併關閉震動）；庭內禁止飲食、交談、鼓掌或對發言者發出聲響，共同維護法庭秩序。",
    alert: false,
  },
  {
    clause: "第六條",
    icon: NotebookPen,
    title: "得攜帶紙本筆記本與筆記錄程序脈絡",
    body: "旁聽席完全允許以紙本筆記本記錄問答順序與爭點脈絡。請避免使用會產生明顯敲擊聲之設備，並切勿記下當事人或證人之個人隱私資料。",
    alert: false,
  },
];

export default function GuidePage() {
  return (
    <div className="space-y-10">
      <header className="legal-rule-bottom space-y-2 pb-5">
        <p className="text-xs font-medium tracking-[0.08em] text-[#8f2d1c]">
          法庭旁聽入門指引
        </p>
        <h1 className="font-editorial text-3xl font-semibold text-[#191816] sm:text-4xl">
          臺灣法院旁聽守則與行前指南
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#524e47] sm:text-base">
          憲法與《法院組織法》確立「公開審判原則」——法院本即開放公民進入旁聽之公共空間。掌握下列六則基本規範，即可安心完成初次觀庭。
        </p>
      </header>

      {/* 6 Clauses */}
      <section className="grid gap-px border border-[#191816]/25 bg-[#d6d0c4] sm:grid-cols-2">
        {SIX_RULES.map(({ clause, icon: Icon, title, body, alert }) => (
          <div
            key={clause}
            className={`p-5 ${alert ? "bg-[#f9f3f1]" : "bg-[#fcfbf8]"}`}
          >
            <div className="flex items-start gap-3.5">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center border ${
                  alert
                    ? "border-[#8f2d1c] bg-[#8f2d1c] text-[#fcfbf8]"
                    : "border-[#1b382f]/30 bg-[#f4f7f5] text-[#1b382f]"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <p
                  className={`font-editorial text-xs font-semibold tracking-[0.08em] ${
                    alert ? "text-[#8f2d1c]" : "text-[#1b382f]"
                  }`}
                >
                  {clause}
                </p>
                <h2 className="font-editorial text-base font-semibold text-[#191816]">
                  {title}
                </h2>
                <p className="text-sm leading-relaxed text-[#524e47]">{body}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Decoding dukd */}
      <section className="space-y-4 rounded-[2px] border border-[#191816]/20 bg-[#fcfbf8] p-6">
        <div className="border-b border-[#d6d0c4] pb-3">
          <h2 className="font-editorial text-xl font-semibold text-[#191816]">
            如何挑選第一場庭？辨識「庭類」最為關鍵
          </h2>
          <p className="mt-1 text-sm text-[#524e47]">
            若誤選「宣判」往往數十秒即告結束，誤赴「調解室」則無法進入旁聽。出發前先辨明庭類，觀庭收穫截然不同：
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {(["trial", "prep", "verdict"] as const).map((key) => {
            const info = HEARING_CATEGORY_META[key];
            return (
              <div
                key={key}
                className={`border p-4 ${
                  info.recommended
                    ? "border-[#1b382f]/40 bg-[#f4f7f5]"
                    : "border-[#d6d0c4] bg-[#f7f5f0]"
                }`}
              >
                <p className="font-editorial text-sm font-semibold text-[#191816]">
                  {info.label}
                </p>
                <p className="mt-0.5 font-tabular text-xs font-medium text-[#1b382f]">
                  預估時長：{info.durationHint}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#524e47]">
                  {info.beginnerHint}
                </p>
              </div>
            );
          })}

          <div className="border border-[#8f2d1c]/35 bg-[#f9f3f1] p-4">
            <p className="font-editorial text-sm font-semibold text-[#8f2d1c]">
              調解／家事／少年／性侵害（依法不公開）
            </p>
            <p className="mt-0.5 text-xs font-medium text-[#8f2d1c]">
              本工具已預設自動排除
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#524e47]">
              為保護當事人隱私與兒少權益，上開程序不開放一般民眾旁聽；即便屬普通公開案件，審判長仍得依法於當庭裁定不公開審理。
            </p>
          </div>
        </div>
      </section>

      {/* Pre-departure checklist */}
      <section className="rounded-[2px] border border-[#191816]/20 bg-[#fcfbf8] p-6">
        <h2 className="border-b border-[#d6d0c4] pb-3 font-editorial text-xl font-semibold text-[#191816]">
          出發前確認事項
        </h2>
        <ul className="mt-4 space-y-2.5 text-sm text-[#3a3630]">
          {[
            "出門前點擊庭期詳情頁的「到司法院查詢頁確認」或「當日開庭進度」，確認無臨時改期或延遲。",
            "留意院區地址：部分地院之簡易庭與本院分設於不同地址（本網站已依實際法庭前綴對應院區，出發前仍建議再行核對地圖）。",
            "社會矚目案件或國民法官案件或須提早現場排隊領取旁聽證，請預先查閱該法院官網公告。",
            "隨身攜帶小型紙本筆記本與筆，切勿攜帶剪刀、美工刀等可能遭安檢攔阻之物品。",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-[#1b382f]"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link href="/search?category=trial" className="btn-formal-primary">
            <span>檢索審理與言詞辯論庭 →</span>
          </Link>
          <Link href="/search?mode=layjudge" className="btn-formal-secondary">
            <span>瀏覽全台國民法官案件</span>
          </Link>
        </div>
      </section>

      {/* Attribution */}
      <section className="rounded-[2px] border border-[#191816]/25 bg-[#efece4] p-6">
        <p className="text-xs font-medium tracking-[0.08em] text-[#8f2d1c]">
          整理參考與致謝
        </p>
        <h2 className="mt-1 font-editorial text-lg font-semibold text-[#191816]">
          旁聽入門守則參考來源：法律百科 @legispedia_tw
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[#524e47]">
          本頁所載旁聽流程、安檢規定與法庭禮儀重點，參考並致謝法律百科（Legispedia）於
          Threads 發表之旁聽實務整理貼文與《法科！輕鬆點》節目分享。
        </p>
        <a
          href={LEGISPEDIA_THREAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-formal-ink mt-4"
        >
          <span>閱讀法律百科 Threads 原文</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </section>
    </div>
  );
}
