import Link from "next/link";
import { OFFICIAL_LIVE_STATUS_URL, OFFICIAL_QUERY_BASE } from "@/lib/courts";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-100/70 text-sm text-stone-600">
      <div className="mx-auto max-w-[960px] space-y-3 px-4 py-6 sm:px-6">
        <p className="rounded-lg border border-amber-200/90 bg-amber-50/70 px-3.5 py-2.5 text-[13px] leading-relaxed text-amber-950">
          <strong>法律與旁聽提醒：</strong>
          庭期資料僅供參考，以法院實際開庭通知單與現場公告為準；家事、少年及依法不公開審理之案件不得旁聽；
          <strong>法庭內嚴禁錄音、錄影、拍照</strong>。
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
          <span>
            非司法院官方網站｜每日定時同步公開庭期並自動濾除調解與不公開程序
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={OFFICIAL_QUERY_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-stone-400 underline-offset-2 hover:text-stone-800"
            >
              司法院庭期表查詢
            </a>
            <a
              href={OFFICIAL_LIVE_STATUS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-stone-400 underline-offset-2 hover:text-stone-800"
            >
              當日開庭進度
            </a>
            <Link
              href="/about"
              className="underline decoration-stone-400 underline-offset-2 hover:text-stone-800"
            >
              資料來源與免責聲明
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
