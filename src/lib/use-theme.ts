"use client";

import { useCallback, useEffect, useState } from "react";
import {
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
  applyResolvedThemeToDocument,
  parseThemePreference,
  resolveTheme,
} from "./theme";

function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    return parseThemePreference(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  const syncFromEnvironment = useCallback(() => {
    const pref = readStoredPreference();
    const resolved = resolveTheme(pref, getSystemPrefersDark());
    setPreferenceState(pref);
    setResolvedTheme(resolved);
    applyResolvedThemeToDocument(resolved, pref);
  }, []);

  useEffect(() => {
    syncFromEnvironment();
    setMounted(true);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => syncFromEnvironment();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === THEME_STORAGE_KEY) {
        syncFromEnvironment();
      }
    };
    const handleCustomEvent = () => syncFromEnvironment();

    mediaQuery.addEventListener("change", handleMediaChange);
    window.addEventListener("storage", handleStorage);
    window.addEventListener(THEME_CHANGE_EVENT, handleCustomEvent);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(THEME_CHANGE_EVENT, handleCustomEvent);
    };
  }, [syncFromEnvironment]);

  const setPreference = useCallback((next: ThemePreference) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore storage failures in restricted contexts
    }
    const resolved = resolveTheme(next, getSystemPrefersDark());
    setPreferenceState(next);
    setResolvedTheme(resolved);
    applyResolvedThemeToDocument(resolved, next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  return {
    preference,
    resolvedTheme,
    mounted,
    setPreference,
  };
}
