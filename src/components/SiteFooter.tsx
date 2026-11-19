import Link from "next/link";
import { OFFICIAL_LIVE_STATUS_URL, OFFICIAL_QUERY_BASE } from "@/lib/courts";

export const LEGISPEDIA_THREAD_URL =
  "https://www.threads.com/@legispedia_tw/post/DO3XNWvD8ku";

export const GITHUB_REPO_URL = "https://github.com/Yukaii/tw-court-watch";

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-[var(--rule-strong)] bg-[var(--bg-tint)] text-sm text-[var(--ink-secondary)]">
      <div className="mx-auto max-w-[1120px] space-y-5 px-4 py-9 sm:px-6 lg:px-8">
        <div className="border-l-2 border-[var(--seal-text)] bg-[var(--bg-surface)] px-4 py-3 text-[13px] leading-relaxed text-[var(--ink-body)]">
          <strong className="font-semibold tracking-[0.02em] text-[var(--seal-text)]">
            法律與旁聽聲明：
          </strong>
          本網站所載庭期僅供旁聽參考，以法院實際開庭通知單及現場公告為準；家事、少年及依法不公開審理之案件不得旁聽；
          <strong className="font-semibold text-[var(--ink)]">
            法庭內嚴禁錄音、錄影及拍照
          </strong>
          。
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-[var(--rule)] pt-4 text-xs text-[var(--ink-secondary)] sm:flex-row sm:items-center">
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
                className="font-medium text-[var(--robe-text)] underline decoration-[var(--robe-text)]/40 underline-offset-4 hover:text-[var(--ink)]"
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
              className="underline decoration-[var(--border-medium)] underline-offset-4 hover:text-[var(--ink)]"
            >
              司法院庭期表查詢
            </a>
            <a
              href={OFFICIAL_LIVE_STATUS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[var(--border-medium)] underline-offset-4 hover:text-[var(--ink)]"
            >
              當日開庭進度
            </a>
            <Link
              href="/about"
              className="underline decoration-[var(--border-medium)] underline-offset-4 hover:text-[var(--ink)]"
            >
              資料來源與免責聲明
            </Link>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[var(--border-medium)] underline-offset-4 hover:text-[var(--ink)]"
            >
              GitHub 原始碼（MIT）
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
