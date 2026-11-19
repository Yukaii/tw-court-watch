"use client";

import { useEffect, useState } from "react";

/**
 * Hydration-safe client system clock (UTC ms).
 * Returns null during SSR & initial hydration pass, then updates immediately
 * and ticks at `intervalMs` so live event statuses refresh automatically.
 */
export function useNowMs(intervalMs = 60_000, enabled = true): number | null {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    setNowMs(Date.now());
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, enabled]);

  return enabled ? nowMs : null;
}
