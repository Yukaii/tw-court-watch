"use client";

import type { Hearing } from "@/lib/types";
import { CalendarEventCard } from "./CalendarEventCard";

interface HearingCardProps {
  hearing: Hearing;
  showCourt?: boolean;
  nowMs?: number | null;
}

/**
 * Unified calendar-event-ticket presentation across landing & search pages.
 */
export function HearingCard({
  hearing,
  showCourt = true,
  nowMs,
}: HearingCardProps) {
  return (
    <CalendarEventCard hearing={hearing} showCourt={showCourt} nowMs={nowMs} />
  );
}
