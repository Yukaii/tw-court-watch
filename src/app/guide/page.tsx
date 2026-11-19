import {
  Ban,
  CheckCircle2,
  DoorOpen,
  NotebookPen,
  Scale,
  ShieldCheck,
  VolumeX,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { HEARING_CATEGORY_META } from "@/lib/filter";

export const metadata: Metadata = {
  title: "旁聽新手指南",
  description:
    "第一次去台灣法院旁聽必看：安檢流程、進法庭與起立禮儀、禁錄音拍照紅線、紙筆筆記方法，以及如何看懂審理、言詞辯論、準備程序與宣判。",
};

const SIX_RULES = [
  {
    icon: ShieldCheck,
    title: "1. 進法院先過安檢（免預約、免門票）",
    body: "一般公開法庭不需要事先預約或買票。抵達法院大門口後，需要通過金屬探測門、隨身包包過 X 光機，建議比預定開庭時間提早 15–20 分鐘到達。",
  },
  {
    icon: DoorOpen,
    title: "2. 門開著就能安靜走進旁聽席",
    body: "找到對應的法庭門口後，可以先看門外螢幕的開庭順序表確認案件。只要法庭門開著、沒有標示「不公開審理」或「需領旁聽證」，就可以安靜推門走到後方旁聽席入座。",
  },
  {
    icon: Scale,
    title: "3. 法官入庭、退庭與宣判時請起立",
    body: "聽到通譯或法警喊「請起立」時（法官進場、退庭、以及宣判主文時），跟著現場一起起立致意即可，不需要過度緊張。",
  },
  {
    icon: Ban,
    title: "4. 庭內嚴禁錄音、錄影、拍照（絕對紅線）",
    body: "依《法院組織法》及法庭旁聽規則，開庭期間絕對禁止錄音、錄影或拍照，就算沒有開閃光燈也不行。建議進場後直接把手機收進包包。",
  },
  {
    icon: VolumeX,
    title: "5. 手機靜音、禁飲食、禁喧嘩或鼓掌",
    body: "進入法庭前請將手機切為靜音（最好連震動都關掉）；庭內禁止吃東西、喝飲料、交談、鼓掌或對發言者發出噓聲，保持安靜以免影響審理秩序。",
  },
  {
    icon: NotebookPen,
    title: "6. 可以帶紙本筆記本與筆做筆記",
    body: "旁聽席完全可以自備紙本筆記本與筆記錄程序順序、爭點脈絡與聽審心得！建議別用會發出大聲敲擊音的設備，也請勿記下當事人或證人的個資。",
  },
];

export default function GuidePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-bold tracking-wide text-emerald-800">
          FIRST-TIME OBSERVER GUIDE
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          台灣法院旁聽新手指南
        </h1>
        <p className="text-sm leading-relaxed text-stone-600 sm:text-base">
          憲法與《法院組織法》保障「公開審判原則」——法院本來就是開放給公民走進去旁聽的公共空間。只要記住下面 6 個重點，你也能輕鬆完成第一次觀庭。
        </p>
      </header>

      {/* 6 Core Rules */}
      <section className="grid gap-3.5 sm:grid-cols-2">
        {SIX_RULES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-stone-200 bg-white p-5 shadow-2xs"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-900/10 text-emerald-900">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <h2 className="text-base font-bold text-stone-900">{title}</h2>
                <p className="text-sm leading-relaxed text-stone-600">{body}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Decoding dukd */}
      <section className="space-y-3 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-stone-900">
          怎麼挑第一場？看懂「庭類」最關鍵
        </h2>
        <p className="text-sm text-stone-600">
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
                    ? "border-emerald-300 bg-emerald-50/50"
                    : "border-stone-200 bg-stone-50/50"
                }`}
              >
                <p className="text-sm font-bold text-stone-900">{info.label}</p>
                <p className="mt-0.5 text-xs font-medium text-emerald-900">
                  預估時長：{info.durationHint}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
                  {info.beginnerHint}
                </p>
              </div>
            );
          })}

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <p className="text-sm font-bold text-amber-950">
              調解／家事／少年／性侵害（不可旁聽）
            </p>
            <p className="mt-0.5 text-xs font-medium text-amber-900">
              本工具已預設自動濾除
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-amber-950/80">
              依法保護當事人隱私與兒少權益，這些程序不開放一般民眾旁聽。另外即使是普通案件，審判長仍得依法律於現場決定不公開審理。
            </p>
          </div>
        </div>
      </section>

      {/* Pre-departure checklist */}
      <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-bold text-stone-900">出發前檢查清單</h2>
        <ul className="mt-3 space-y-2 text-sm text-stone-700">
          {[
            "出門前點一下庭期詳情頁的「到司法院查詢頁確認」或「當日開庭進度」，確認沒有臨時改期或大幅延遲。",
            "確認院區地址！部分地院的簡易庭與本院在不同地址（本工具已依實際法庭前綴對應院區，但仍建議看一眼地圖）。",
            "熱門社會矚目案件或國民法官案件可能需要提早排隊領取旁聽證，請留意該法院官網最新公告。",
            "帶一本小筆記本與筆，勿攜帶剪刀、美工刀等可能被安檢攔下的物品。",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Link
            href="/search?category=trial"
            className="rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            馬上挑選一場審理／辯論庭 →
          </Link>
          <Link
            href="/search?mode=layjudge"
            className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-950 hover:bg-amber-100"
          >
            逛逛全台國民法官案件
          </Link>
        </div>
      </section>
    </div>
  );
}
