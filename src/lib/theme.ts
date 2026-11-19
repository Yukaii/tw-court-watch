export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "tw-court-watch:theme";
export const THEME_CHANGE_EVENT = "tw-court-watch-theme";

export function parseThemePreference(
  raw: string | null | undefined,
): ThemePreference {
  if (raw === "light" || raw === "dark" || raw === "system") {
    return raw;
  }
  return "system";
}

export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ResolvedTheme {
  if (preference === "dark") return "dark";
  if (preference === "light") return "light";
  return systemPrefersDark ? "dark" : "light";
}

export function applyResolvedThemeToDocument(
  resolved: ResolvedTheme,
  preference?: ThemePreference,
): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  if (preference) {
    root.dataset.themePreference = preference;
  }
}

/**
 * Synchronous inline script executed in <head> before first paint
 * to prevent a flash of incorrect theme (FOUC).
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var raw=window.localStorage.getItem(k);var pref=(raw==="light"||raw==="dark"||raw==="system")?raw:"system";var sysDark=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var isDark=pref==="dark"||(pref==="system"&&sysDark);var root=document.documentElement;root.classList.toggle("dark",isDark);root.style.colorScheme=isDark?"dark":"light";root.dataset.themePreference=pref;}catch(e){}})();`;
