"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadPersonalNotes, loadSavedHearings } from "@/lib/storage";

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
    <header className="sticky top-0 z-30 border-b border-[#191816] bg-[#f7f5f0]/96 backdrop-blur-sm">
      <div className="border-b border-[#d6d0c4]">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-baseline gap-3 text-[#191816] no-underline"
          >
            <span className="font-editorial text-xl font-semibold tracking-[0.06em] text-[#191816] group-hover:text-[#1b382f]">
              旁聽小幫手
            </span>
            <span className="hidden border-l border-[#191816]/25 pl-3 text-xs tracking-[0.08em] text-[#524e47] sm:inline">
              臺灣公開審判庭期索引
            </span>
          </Link>

          <nav
            aria-label="主要導覽"
            className="flex items-center gap-1 sm:gap-5"
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
                  className={`relative inline-flex items-center gap-1.5 px-1.5 py-1 text-[13px] tracking-[0.04em] transition-colors sm:px-0.5 sm:text-sm ${
                    active
                      ? "font-semibold text-[#191816] after:absolute after:inset-x-0 after:-bottom-[15px] after:h-[2px] after:bg-[#1b382f]"
                      : "font-normal text-[#524e47] hover:text-[#191816]"
                  }`}
                >
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">
                    {href === "/saved" ? "清單" : label.slice(0, 2)}
                  </span>
                  {showBadge && (
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-[2px] border border-[#8f2d1c]/40 bg-[#8f2d1c]/10 px-1 font-tabular text-[10px] leading-none font-medium text-[#8f2d1c]">
                      {savedCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
