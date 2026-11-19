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
  title: "旁聽新手指南",
  description:
    "第一次去台灣法院旁聽必看：安檢流程、進法庭與起立禮儀、禁錄音拍照紅線、紙筆筆記方法，以及如何看懂審理、言詞辯論、準備程序與宣判。",
};

const SIX_RULES = [
  {
    num: "01",
    icon: ShieldCheck,
    title: "進法院先過安檢（免預約、免門票）",
    body: "一般公開法庭不需要事先預約或買票。抵達法院大門口後，需要通過金屬探測門、隨身包包過 X 光機，建議比預定開庭時間提早 15–20 分鐘到達。",
    alert: false,
  },
  {
    num: "02",
    icon: DoorOpen,
    title: "門開著就能安靜走進旁聽席",
    body: "找到對應的法庭門口後，可以先看門外螢幕的開庭順序表確認案件。只要法庭門開著、沒有標示「不公開審理」或「需領旁聽證」，就可以安靜推門走到後方旁聽席入座。",
    alert: false,
  },
  {
    num: "03",
    icon: Scale,
    title: "法官入庭、退庭與宣判時請起立",
    body: "聽到通譯或法警喊「請起立」時（法官進場、退庭、以及宣判主文時），跟著現場一起起立致意即可，不需要過度緊張。",
    alert: false,
  },
  {
    num: "04",
    icon: Ban,
    title: "庭內嚴禁錄音、錄影、拍照（絕對紅線）",
    body: "依《法院組織法》及法庭旁聽規則，開庭期間絕對禁止錄音、錄影或拍照，就算沒有開閃光燈也不行。建議進場後直接把手機收進包包。",
    alert: true,
  },
  {
    num: "05",
    icon: VolumeX,
    title: "手機靜音、禁飲食、禁喧嘩或鼓掌",
    body: "進入法庭前請將手機切為靜音（最好連震動都關掉）；庭內禁止吃東西、喝飲料、交談、鼓掌或對發言者發出噓聲，保持安靜以免影響審理秩序。",
    alert: false,
  },
  {
    num: "06",
    icon: NotebookPen,
    title: "可以帶紙本筆記本與筆做筆記",
    body: "旁聽席完全可以自備紙本筆記本與筆記錄程序順序、爭點脈絡與聽審心得！建議別用會發出大聲敲擊音的設備，也請勿記下當事人或證人的個資。",
    alert: false,
  },
];

export default function GuidePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2 border-b border-[#1c1a17]/15 pb-5">
        <p className="font-tabular text-[11px] font-semibold uppercase tracking-widest text-[#b85432]">
          FIRST-TIME OBSERVER GUIDE
        </p>
        <h1 className="font-editorial text-3xl font-bold tracking-tight text-[#1c1a17] sm:text-4xl">
          台灣法院旁聽新手指南
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#5c564c] sm:text-base">
          憲法與《法院組織法》保障「公開審判原則」——法院本來就是開放給公民走進去旁聽的公共空間。只要記住下面 6 個重點，你也能輕鬆完成第一次觀庭。
        </p>
      </header>

      {/* 6 Core Rules */}
      <section className="grid gap-3.5 sm:grid-cols-2">
        {SIX_RULES.map(({ num, icon: Icon, title, body, alert }) => (
          <div
            key={num}
            className={`rounded-xl border p-5 ${
              alert
                ? "border-[#b85432]/35 bg-[#fbf2ee]"
                : "border-[#1c1a17]/15 bg-[#fffdf8]"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  alert
                    ? "bg-[#b85432] text-[#fffdf8]"
                    : "bg-[#1f4b3b]/10 text-[#1f4b3b]"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <p
                  className={`font-tabular text-[11px] font-semibold tracking-wider ${
                    alert ? "text-[#b85432]" : "text-[#1f4b3b]"
                  }`}
                >
                  RULE {num}
                </p>
                <h2 className="font-editorial text-base font-bold text-[#1c1a17]">
                  {title}
                </h2>
                <p className="text-sm leading-relaxed text-[#5c564c]">{body}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Decoding dukd */}
      <section className="space-y-3 rounded-2xl border border-[#1c1a17]/15 bg-[#fffdf8] p-5 sm:p-6">
        <h2 className="font-editorial text-xl font-bold text-[#1c1a17]">
          怎麼挑第一場？看懂「庭類」最關鍵
        </h2>
        <p className="text-sm text-[#5c564c]">
          很多新手第一次去法院，不小心選到「宣判」結果不到 30 秒就散會，或是跑到「調解室」才發現不公開。出發前先看庭類，體驗差很多：
        </p>

        <div className="grid gap-3 pt-1 sm:grid-cols-2">
          {(["trial", "prep", "verdict"] as const).map((key) => {
            const info = HEARING_CATEGORY_META[key];
            return (
              <div
                key={key}
                className={`rounded-xl border p-4 ${
                  info.recommended
                    ? "border-[#1f4b3b]/35 bg-[#f2f7f4]"
                    : "border-[#1c1a17]/12 bg-[#f8f5ee]"
                }`}
              >
                <p className="font-editorial text-sm font-bold text-[#1c1a17]">
                  {info.label}
                </p>
                <p className="mt-0.5 font-tabular text-xs font-semibold text-[#1f4b3b]">
                  預估時長：{info.durationHint}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#5c564c]">
                  {info.beginnerHint}
                </p>
              </div>
            );
          })}

          <div className="rounded-xl border border-[#c78a1f]/35 bg-[#faf0d7]/70 p-4">
            <p className="font-editorial text-sm font-bold text-[#6e4506]">
              調解／家事／少年／性侵害（不可旁聽）
            </p>
            <p className="mt-0.5 text-xs font-semibold text-[#8a5a08]">
              本工具已預設自動濾除
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-[#5c4824]">
              依法保護當事人隱私與兒少權益，這些程序不開放一般民眾旁聽。另外即使是普通案件，審判長仍得依法律於現場決定不公開審理。
            </p>
          </div>
        </div>
      </section>

      {/* Pre-departure checklist */}
      <section className="rounded-2xl border border-[#1c1a17]/15 bg-[#fffdf8] p-5 sm:p-6">
        <h2 className="font-editorial text-xl font-bold text-[#1c1a17]">
          出發前檢查清單
        </h2>
        <ul className="mt-3 space-y-2.5 text-sm text-[#4a453c]">
          {[
            "出門前點一下庭期詳情頁的「到司法院查詢頁確認」或「當日開庭進度」，確認沒有臨時改期或大幅延遲。",
            "確認院區地址！部分地院的簡易庭與本院在不同地址（本工具已依實際法庭前綴對應院區，但仍建議看一眼地圖）。",
            "熱門社會矚目案件或國民法官案件可能需要提早排隊領取旁聽證，請留意該法院官網最新公告。",
            "帶一本小筆記本與筆，勿攜帶剪刀、美工刀等可能被安檢攔下的物品。",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-[#1f4b3b]"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link
            href="/search?category=trial"
            className="rounded-lg bg-[#1f4b3b] px-4 py-2.5 text-sm font-semibold text-[#f6f2e9] hover:bg-[#16362b]"
          >
            馬上挑選一場審理／辯論庭 →
          </Link>
          <Link
            href="/search?mode=layjudge"
            className="rounded-lg border border-[#c78a1f]/50 bg-[#faf0d7] px-4 py-2.5 text-sm font-semibold text-[#6e4506] hover:bg-[#f5e4bc]"
          >
            逛逛全台國民法官案件
          </Link>
        </div>
      </section>

      {/* Attribution / Credit */}
      <section className="rounded-2xl border border-[#1c1a17]/15 bg-[#efe8d8] p-5 sm:p-6">
        <p className="font-tabular text-[11px] font-semibold uppercase tracking-widest text-[#8c381d]">
          CREDIT · 整理參考與致謝
        </p>
        <h2 className="mt-1 font-editorial text-lg font-bold text-[#1c1a17]">
          旁聽入門守則參考來源：法律百科 @legispedia_tw
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[#4a453c]">
          本頁整理之旁聽流程、安檢與法庭禮儀重點，參考並致謝法律百科（Legispedia）於
          Threads 發布之旁聽攻略整理貼文與《法科！輕鬆點》節目分享。
        </p>
        <a
          href={LEGISPEDIA_THREAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-[#1c1a17] px-3.5 py-2 text-xs font-semibold text-[#f6f2e9] hover:bg-[#1f4b3b]"
        >
          <span>前往閱讀法律百科 Threads 原文</span>
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </section>
    </div>
  );
}
