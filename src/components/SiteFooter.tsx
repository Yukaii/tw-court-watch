import Link from "next/link";
import { OFFICIAL_LIVE_STATUS_URL, OFFICIAL_QUERY_BASE } from "@/lib/courts";

export const LEGISPEDIA_THREAD_URL =
  "https://www.threads.com/@legispedia_tw/post/DO3XNWvD8ku";

export const GITHUB_REPO_URL = "https://github.com/Yukaii/tw-court-watch";

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-[#191816] bg-[#efece4] text-sm text-[#524e47]">
      <div className="mx-auto max-w-[1120px] space-y-5 px-4 py-9 sm:px-6 lg:px-8">
        <div className="border-l-2 border-[#8f2d1c] bg-[#fcfbf8] px-4 py-3 text-[13px] leading-relaxed text-[#3a3630]">
          <strong className="font-semibold tracking-[0.02em] text-[#8f2d1c]">
            法律與旁聽聲明：
          </strong>
          本網站所載庭期僅供旁聽參考，以法院實際開庭通知單及現場公告為準；家事、少年及依法不公開審理之案件不得旁聽；
          <strong className="font-semibold text-[#191816]">
            法庭內嚴禁錄音、錄影及拍照
          </strong>
          。
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-[#d6d0c4] pt-4 text-xs text-[#524e47] sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <p>
              非司法院官方網站　｜　每日定時同步全台 38
              所主要法院公開庭期，並自動排除調解與不公開程序
            </p>
            <p>
              旁聽守則整理與專案靈感致謝：
              <a
                href={LEGISPEDIA_THREAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#1b382f] underline decoration-[#1b382f]/40 underline-offset-4 hover:text-[#191816]"
              >
                法律百科 @legispedia_tw（Threads 原文）
              </a>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <a
              href={OFFICIAL_QUERY_BASE}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[#191816]/30 underline-offset-4 hover:text-[#191816]"
            >
              司法院庭期表查詢
            </a>
            <a
              href={OFFICIAL_LIVE_STATUS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[#191816]/30 underline-offset-4 hover:text-[#191816]"
            >
              當日開庭進度
            </a>
            <Link
              href="/about"
              className="underline decoration-[#191816]/30 underline-offset-4 hover:text-[#191816]"
            >
              資料來源與免責聲明
            </Link>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[#191816]/30 underline-offset-4 hover:text-[#191816]"
            >
              GitHub 原始碼（MIT）
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
