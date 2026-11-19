"use client";

import { Bookmark, BookOpen, Compass, Info, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadPersonalNotes, loadSavedHearings } from "@/lib/storage";

const NAV_ITEMS = [
  { href: "/", label: "今日日曆", icon: Compass },
  { href: "/search", label: "找庭", icon: Search },
  { href: "/guide", label: "新手指南", icon: BookOpen },
  { href: "/saved", label: "清單與筆記", icon: Bookmark },
  { href: "/about", label: "關於", icon: Info },
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
    <header className="sticky top-0 z-30 border-b border-[#1c1a17]/15 bg-[#f6f2e9]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-baseline gap-2.5 text-[#1c1a17] no-underline"
        >
          <span className="font-editorial text-xl font-bold tracking-tight text-[#1c1a17] group-hover:text-[#1f4b3b]">
            旁聽小幫手
          </span>
          <span className="hidden border-l border-[#1c1a17]/20 pl-2.5 font-tabular text-[11px] uppercase tracking-wider text-[#5c564c] sm:inline">
            TW COURT CALENDAR
          </span>
        </Link>

        <nav aria-label="主要導覽" className="flex items-center gap-0.5 sm:gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            const showBadge = href === "/saved" && savedCount > 0;
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#1f4b3b] text-[#f6f2e9]"
                    : "text-[#5c564c] hover:bg-[#1c1a17]/6 hover:text-[#1c1a17]"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 sm:hidden" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
                <span className="text-xs sm:hidden">
                  {href === "/saved" ? "清單" : label.slice(0, 2)}
                </span>
                {showBadge && (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.5 font-tabular text-[10px] leading-none font-semibold ${
                      active
                        ? "bg-[#f6f2e9] text-[#1f4b3b]"
                        : "bg-[#b85432] text-white"
                    }`}
                  >
                    {savedCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
