"use client";

import type { EntrySummary } from "@/lib/sound/commentary";

const LAST_ENTRY_KEY = "e1-4:last-entry";

export function readLastEntry(): EntrySummary | null {
  try {
    const raw = localStorage.getItem(LAST_ENTRY_KEY);
    return raw ? (JSON.parse(raw) as EntrySummary) : null;
  } catch {
    return null;
  }
}

export function rememberEntry(summary: EntrySummary): void {
  try {
    localStorage.setItem(LAST_ENTRY_KEY, JSON.stringify(summary));
  } catch {
    // Private mode: the next entry simply has nothing to compare against.
  }
}
