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
    "第一次去臺灣法院旁聽必看：安檢流程、進法庭與起立禮儀、禁錄音拍照紅線、紙筆筆記方法，以及如何看懂審理、言詞辯論、準備程序與宣判。",
};

const SIX_RULES = [
  {
    clause: "一、",
    icon: ShieldCheck,
    title: "免預約、免門票，先過安檢",
    body: "一般公開法庭不需要事先預約或購票。進法院大門須通過金屬探測門，隨身包包要過 X 光機，建議比預定開庭時間提早 15 至 20 分鐘抵達。",
    alert: false,
  },
  {
    clause: "二、",
    icon: DoorOpen,
    title: "門開著就能安靜走進旁聽席",
    body: "找到對應法庭後，先看門外電子看板確認案號。只要門開著、沒有標示「不公開審理」或「需領旁聽證」，輕推開門坐進後方旁聽席即可。",
    alert: false,
  },
  {
    clause: "三、",
    icon: Scale,
    title: "法官進場、退庭與宣判請起立",
    body: "聽到通譯或法警提醒「起立」時，跟著現場人員一起起身致意即可，不需要過度緊張。",
    alert: false,
  },
  {
    clause: "四、",
    icon: Ban,
    title: "庭內嚴禁錄音、錄影與拍照（紅線）",
    body: "依《法院組織法》及法庭旁聽規則，開庭期間一律禁止錄音、錄影或拍照，就算沒開閃光燈也不行。建議進場前直接把手機收進包包。",
    alert: true,
  },
  {
    clause: "五、",
    icon: VolumeX,
    title: "手機靜音、禁飲食、禁喧嘩或鼓掌",
    body: "進法庭前請將手機切為靜音（建議連震動一併關閉）；庭內不能吃東西、喝飲料、交談或鼓掌，共同維持審理秩序。",
    alert: false,
  },
  {
    clause: "六、",
    icon: NotebookPen,
    title: "可以帶紙本筆記本與筆做筆記",
    body: "旁聽席歡迎用紙本筆記本記錄問答順序與爭點脈絡。請避免使用會發出明顯敲擊聲的設備，也請不要記下當事人或證人的個人資料。",
    alert: false,
  },
];

export default function GuidePage() {
  return (
    <div className="space-y-10">
      <header className="legal-rule-bottom space-y-2 pb-5">
        <h1 className="font-editorial text-3xl font-semibold text-[#191816] sm:text-4xl">
          臺灣法院旁聽守則與行前指南
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#524e47] sm:text-base">
          憲法與《法院組織法》保障「公開審判原則」——法院本來就是開放給民眾走進去旁聽的公共空間。記住下面六個重點，就能安心完成第一次觀庭。
        </p>
      </header>

      {/* 6 Rules */}
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
                <h2 className="font-editorial text-base font-semibold text-[#191816]">
                  <span
                    className={`mr-1 ${alert ? "text-[#8f2d1c]" : "text-[#1b382f]"}`}
                  >
                    {clause}
                  </span>
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
            怎麼挑第一場庭？看懂「庭類」最關鍵
          </h2>
          <p className="mt-1 text-sm text-[#524e47]">
            如果選到「宣判」可能不到 30 秒就散會，走到「調解室」則不開放旁聽。出發前先看庭類，體驗會差很多：
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
              調解／家事／少年／性侵害（不公開）
            </p>
            <p className="mt-0.5 text-xs font-medium text-[#8f2d1c]">
              本網站已預設自動排除
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#524e47]">
              為保護當事人隱私與兒少權益，這些程序不開放一般民眾旁聽；就算是普通公開案件，審判長仍可依法在現場決定不公開審理。
            </p>
          </div>
        </div>
      </section>

      {/* Pre-departure checklist */}
      <section className="rounded-[2px] border border-[#191816]/20 bg-[#fcfbf8] p-6">
        <h2 className="border-b border-[#d6d0c4] pb-3 font-editorial text-xl font-semibold text-[#191816]">
          出發前檢查清單
        </h2>
        <ul className="mt-4 space-y-2.5 text-sm text-[#3a3630]">
          {[
            "出門前點一下庭期詳情頁的「到司法院查詢頁確認」或「當日開庭進度」，確認沒有臨時改期或延遲。",
            "核對院區地址：部分地院的簡易庭與本院在不同地址（本網站已依實際法庭前綴對應，但出發前仍建議看一眼地圖）。",
            "社會矚目案件或國民法官案件可能需要提早排隊領取旁聽證，請留意該法院官網最新公告。",
            "帶一本小筆記本與筆，不要攜帶剪刀、美工刀等可能被安檢攔下的物品。",
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
            <span>挑選審理與言詞辯論庭 →</span>
          </Link>
          <Link href="/search?mode=layjudge" className="btn-formal-secondary">
            <span>瀏覽全台國民法官案件</span>
          </Link>
        </div>
      </section>

      {/* Attribution */}
      <section className="rounded-[2px] border border-[#191816]/25 bg-[#efece4] p-6">
        <h2 className="font-editorial text-lg font-semibold text-[#191816]">
          旁聽入門守則參考來源：法律百科 @legispedia_tw
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[#524e47]">
          本頁整理的旁聽流程、安檢規定與法庭禮儀重點，參考並致謝法律百科於
          Threads 發布的旁聽攻略貼文與《法科！輕鬆點》節目分享。
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
