"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import type { ThemePreference } from "@/lib/theme";
import { useTheme } from "@/lib/use-theme";

const OPTIONS: ReadonlyArray<{
  id: ThemePreference;
  label: string;
  title: string;
  icon: typeof Monitor;
}> = [
  { id: "system", label: "跟隨系統外觀", title: "系統", icon: Monitor },
  { id: "light", label: "切換為淺色模式", title: "淺色", icon: Sun },
  { id: "dark", label: "切換為深色模式", title: "深色", icon: Moon },
];

export function ThemeToggle() {
  const { preference, mounted, setPreference } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="外觀主題切換"
      className="inline-flex shrink-0 items-center divide-x divide-[var(--rule)] overflow-hidden rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
    >
      {OPTIONS.map(({ id, label, title, icon: Icon }) => {
        const active = mounted && preference === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={title}
            onClick={() => setPreference(id)}
            className={`inline-flex h-7 w-7 items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--robe-text)] ${
              active
                ? "bg-[var(--ink)] text-[var(--bg-surface)]"
                : "text-[var(--ink-secondary)] hover:bg-[var(--bg-tint)] hover:text-[var(--ink)]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
