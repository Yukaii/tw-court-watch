"use client";

import { Bookmark, BookOpen, Compass, Info, Scale, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadPersonalNotes, loadSavedHearings } from "@/lib/storage";

const NAV_ITEMS = [
  { href: "/", label: "今日旁聽", icon: Compass },
  { href: "/search", label: "找庭", icon: Search },
  { href: "/guide", label: "新手指南", icon: BookOpen },
  { href: "/saved", label: "清單與筆記", icon: Bookmark },
  { href: "/about", label: "說明", icon: Info },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setSavedCount(
        loadSavedHearings().length + loadPersonalNotes().length,
      );
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
    <header className="sticky top-0 z-30 border-b border-stone-200/90 bg-[#faf9f6]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[960px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-stone-900 no-underline"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-800 text-white shadow-xs">
            <Scale className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight">
              旁聽小幫手
            </span>
            <span className="hidden text-[11px] font-medium text-stone-500 sm:inline">
              台灣公開庭期 · 非官方工具
            </span>
          </span>
        </Link>

        <nav aria-label="主要導覽" className="flex items-center gap-1">
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
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-900/10 text-emerald-900"
                    : "text-stone-600 hover:bg-stone-200/60 hover:text-stone-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
                <span className="text-xs sm:hidden">
                  {href === "/saved" ? "清單" : label.slice(0, 2)}
                </span>
                {showBadge && (
                  <span className="ml-0.5 rounded-full bg-emerald-800 px-1.5 py-0.5 text-[11px] leading-none font-semibold text-white">
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
