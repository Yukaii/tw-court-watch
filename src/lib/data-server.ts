import { readFile } from "node:fs/promises";
import path from "node:path";
import { hydrateHearing } from "./hydrate";
import type {
  CourtHearingsFile,
  Hearing,
  HearingsMeta,
  HighlightsData,
} from "./types";

const DATA_ROOT = path.join(process.cwd(), "public", "data", "hearings");

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function getHearingsMeta(): Promise<HearingsMeta | null> {
  return readJsonFile<HearingsMeta>(path.join(DATA_ROOT, "meta.json"));
}

export async function getHighlightsData(): Promise<HighlightsData | null> {
  return readJsonFile<HighlightsData>(path.join(DATA_ROOT, "highlights.json"));
}

export async function getCourtHearings(
  crtid: string,
): Promise<{ crtid: string; syncedAt: string; hearings: Hearing[] } | null> {
  const safeCode = crtid.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  if (!safeCode) return null;
  const file = await readJsonFile<CourtHearingsFile>(
    path.join(DATA_ROOT, "by-court", `${safeCode}.json`),
  );
  if (!file) return null;
  return {
    crtid: file.crtid,
    syncedAt: file.syncedAt,
    hearings: file.rows.map((row) => hydrateHearing(file.crtid, row)),
  };
}

/**
 * Look up a single hearing in O(1) file read using the crtid prefix in its ID.
 */
export async function getHearingById(id: string): Promise<Hearing | null> {
  const crtid = id.split("-")[0]?.toUpperCase();
  if (!crtid) return null;
  const file = await readJsonFile<CourtHearingsFile>(
    path.join(DATA_ROOT, "by-court", `${crtid}.json`),
  );
  if (!file) return null;
  const match = file.rows.find((row) => row[0] === id);
  return match ? hydrateHearing(file.crtid, match) : null;
}
