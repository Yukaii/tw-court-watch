"use client";

import type { Hearing, PersonalNote, SavedHearing } from "./types";
import { formatDualDate } from "./date";

const SAVED_KEY = "tw_court_watch_saved_v1";
const NOTES_KEY = "tw_court_watch_notes_v1";

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event("tw-court-watch-storage"));
  } catch {
    // Ignore quota errors gracefully
  }
}

// === Saved Hearings ===

export function loadSavedHearings(): SavedHearing[] {
  const list = safeRead<SavedHearing[]>(SAVED_KEY, []);
  return list.sort((a, b) =>
    `${a.snapshot.date}T${a.snapshot.time}`.localeCompare(
      `${b.snapshot.date}T${b.snapshot.time}`,
    ),
  );
}

export function isHearingSaved(hearingId: string): boolean {
  return loadSavedHearings().some((s) => s.hearingId === hearingId);
}

export function toggleSaveHearing(hearing: Hearing): boolean {
  const existing = loadSavedHearings();
  const idx = existing.findIndex((s) => s.hearingId === hearing.id);
  if (idx >= 0) {
    existing.splice(idx, 1);
    safeWrite(SAVED_KEY, existing);
    return false;
  }

  const next: SavedHearing = {
    hearingId: hearing.id,
    savedAt: new Date().toISOString(),
    remind: true,
    snapshot: {
      id: hearing.id,
      crtid: hearing.crtid,
      courtName: hearing.courtName,
      courtShortName: hearing.courtShortName,
      sysLabel: hearing.sysLabel,
      caseNo: hearing.caseNo,
      division: hearing.division,
      courtroom: hearing.courtroom,
      dukd: hearing.dukd,
      category: hearing.category,
      reason: hearing.reason,
      date: hearing.date,
      rocDate: hearing.rocDate,
      time: hearing.time,
      isLayJudge: hearing.isLayJudge,
      campusName: hearing.campusName,
      address: hearing.address,
      transit: hearing.transit,
      sourceUrl: hearing.sourceUrl,
    },
  };

  safeWrite(SAVED_KEY, [...existing, next]);
  return true;
}

export function removeSavedHearing(hearingId: string): void {
  const next = loadSavedHearings().filter((s) => s.hearingId !== hearingId);
  safeWrite(SAVED_KEY, next);
}

// === Personal Observation Notes (localStorage only in Route 1) ===

export function loadPersonalNotes(): PersonalNote[] {
  const list = safeRead<PersonalNote[]>(NOTES_KEY, []);
  return list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getPersonalNoteById(id: string): PersonalNote | null {
  return loadPersonalNotes().find((n) => n.id === id) ?? null;
}

export function getNotesForHearing(hearingId: string): PersonalNote[] {
  return loadPersonalNotes().filter((n) => n.hearingId === hearingId);
}

export function upsertPersonalNote(
  draft: Omit<PersonalNote, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
  },
): PersonalNote {
  const notes = loadPersonalNotes();
  const now = new Date().toISOString();

  if (draft.id) {
    const idx = notes.findIndex((n) => n.id === draft.id);
    if (idx >= 0) {
      const updated: PersonalNote = {
        ...notes[idx],
        ...draft,
        id: draft.id,
        updatedAt: now,
      };
      notes[idx] = updated;
      safeWrite(NOTES_KEY, notes);
      return updated;
    }
  }

  const created: PersonalNote = {
    ...draft,
    id:
      draft.id ??
      `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now,
    updatedAt: now,
  };
  safeWrite(NOTES_KEY, [created, ...notes]);
  return created;
}

export function deletePersonalNote(id: string): void {
  const next = loadPersonalNotes().filter((n) => n.id !== id);
  safeWrite(NOTES_KEY, next);
}

export function formatNoteAsMarkdown(note: PersonalNote): string {
  const lines = [
    `# 觀庭筆記｜${note.courtName} ${note.caseNo}`,
    "",
    `- **開庭日期**：${formatDualDate(note.date)}${note.time ? ` ${note.time}` : ""}`,
    `- **法院／法庭**：${note.courtName} ${note.courtroom}`,
    note.dukd ? `- **庭類**：${note.dukd}` : null,
    note.reason ? `- **案由**：${note.reason}` : null,
    note.tags.length > 0 ? `- **標籤**：${note.tags.join("、")}` : null,
    note.clarity ? `- **程序清楚度**：${note.clarity} / 5` : null,
    note.friendliness ? `- **旁聽指引友善度**：${note.friendliness} / 5` : null,
    note.wouldRecommend !== null
      ? `- **是否推薦新手旁聽**：${note.wouldRecommend ? "推薦" : "暫不推薦"}`
      : null,
    "",
    "## 程序與觀察摘要",
    "",
    note.summary.trim(),
    "",
  ];

  if (note.rulesMemo.trim()) {
    lines.push("## 現場動線與實務提醒", "", note.rulesMemo.trim(), "");
  }

  lines.push(
    "---",
    "> 註：本筆記為旁聽者個人程序觀察紀錄，不含當事人個資與逐字證詞，庭內未錄音、錄影或拍照。",
    "",
  );

  return lines.filter((line): line is string => line !== null).join("\n");
}

export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
