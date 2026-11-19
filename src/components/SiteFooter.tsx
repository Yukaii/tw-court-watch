import Link from "next/link";
import { OFFICIAL_LIVE_STATUS_URL, OFFICIAL_QUERY_BASE } from "@/lib/courts";

export const LEGISPEDIA_THREAD_URL =
  "https://www.threads.com/@legispedia_tw/post/DO3XNWvD8ku";

export function SiteFooter() {
  return (
    <footer className="border-t border-[#1c1a17]/15 bg-[#ede7da] text-sm text-[#5c564c]">
      <div className="mx-auto max-w-[1120px] space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <p className="rounded-lg border border-[#b85432]/25 bg-[#fffdf8] px-4 py-3 text-[13px] leading-relaxed text-[#432318]">
          <strong className="font-semibold text-[#8c381d]">
            法律與旁聽紅線：
          </strong>
          庭期資料僅供參考，以法院實際開庭通知單與現場公告為準；家事、少年及依法不公開審理之案件不得旁聽；
          <strong>法庭內嚴禁錄音、錄影、拍照</strong>。
        </p>

        <div className="flex flex-col justify-between gap-3 text-xs text-[#5c564c] sm:flex-row sm:items-center">
          <div className="space-y-1">
            <p>
              非司法院官方網站｜每日定時同步全台 38 所主要法院公開庭期並自動濾除調解與不公開程序
            </p>
            <p>
              旁聽守則整理與專案靈感致謝：
              <a
                href={LEGISPEDIA_THREAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#1f4b3b] underline decoration-[#1f4b3b]/40 underline-offset-2 hover:text-[#16362b]"
              >
                法律百科 @legispedia_tw（Threads 原文）
              </a>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={OFFICIAL_QUERY_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[#1c1a17]/30 underline-offset-2 hover:text-[#1c1a17]"
            >
              司法院庭期表查詢
            </a>
            <a
              href={OFFICIAL_LIVE_STATUS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[#1c1a17]/30 underline-offset-2 hover:text-[#1c1a17]"
            >
              當日開庭進度
            </a>
            <Link
              href="/about"
              className="underline decoration-[#1c1a17]/30 underline-offset-2 hover:text-[#1c1a17]"
            >
              資料來源與免責聲明
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
