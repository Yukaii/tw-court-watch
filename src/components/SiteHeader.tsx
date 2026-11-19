"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadPersonalNotes, loadSavedHearings } from "@/lib/storage";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { href: "/", label: "庭期日曆" },
  { href: "/search", label: "條件檢索" },
  { href: "/guide", label: "旁聽守則" },
  { href: "/saved", label: "清單與筆記" },
  { href: "/about", label: "資料與聲明" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setSavedCount(loadSavedHearings().length + loadPersonalNotes().length);
    };
    refresh();
    window.addEventListener("tw-court-watch-storage", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("tw-court-watch-storage", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--rule-strong)] bg-[#f7f5f0]/95 backdrop-blur-sm dark:bg-[#121210]/95">
      <div className="border-b border-[var(--rule)]">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-3.5 lg:px-8">
          <Link
            href="/"
            className="group flex shrink-0 items-baseline gap-3 text-[var(--ink)] no-underline"
          >
            <span className="font-editorial text-lg font-semibold tracking-[0.06em] text-[var(--ink)] group-hover:text-[var(--robe-text)] sm:text-xl">
              旁聽小幫手
            </span>
            <span className="hidden border-l border-[var(--border-subtle)] pl-3 text-xs tracking-[0.08em] text-[var(--ink-secondary)] md:inline">
              臺灣公開審判庭期索引
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-5">
            <nav
              aria-label="主要導覽"
              className="flex items-center gap-0.5 sm:gap-5"
            >
              {NAV_ITEMS.map(({ href, label }) => {
                const active =
                  href === "/"
                    ? pathname === "/"
                    : pathname === href || pathname.startsWith(`${href}/`);
                const showBadge = href === "/saved" && savedCount > 0;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative inline-flex items-center gap-1 px-1 py-1 text-[13px] tracking-[0.03em] transition-colors sm:gap-1.5 sm:px-0.5 sm:text-sm sm:tracking-[0.04em] ${
                      active
                        ? "font-semibold text-[var(--ink)] after:absolute after:inset-x-0 after:-bottom-[13px] after:h-[2px] after:bg-[var(--robe-text)] sm:after:-bottom-[15px]"
                        : "font-normal text-[var(--ink-secondary)] hover:text-[var(--ink)]"
                    }`}
                  >
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">
                      {href === "/saved" ? "清單" : label.slice(0, 2)}
                    </span>
                    {showBadge && (
                      <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-[2px] border border-[var(--seal-text)]/40 bg-[var(--seal)]/12 px-1 font-tabular text-[10px] leading-none font-medium text-[var(--seal-text)]">
                        {savedCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="border-l border-[var(--rule)] pl-2 sm:pl-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
