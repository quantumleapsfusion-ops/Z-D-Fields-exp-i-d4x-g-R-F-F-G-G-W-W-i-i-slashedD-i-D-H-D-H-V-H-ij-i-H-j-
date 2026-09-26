import { openDB, type DBSchema, type IDBPDatabase } from "idb";

import { parseBoardDocument, type BoardDocument } from "./types";

/** Key used for a board that has not been saved to the server yet. */
export const DRAFT_KEY = "draft";

export type LocalBoard = {
  key: string;
  title: string;
  doc: BoardDocument;
  /** Unix ms of the last local write. */
  updatedAt: number;
  /** Unix ms of the last confirmed server save, or null if never synced. */
  syncedAt: number | null;
};

interface ChalkboardDB extends DBSchema {
  boards: { key: string; value: LocalBoard; indexes: { byUpdated: number } };
}

let dbPromise: Promise<IDBPDatabase<ChalkboardDB>> | null = null;

function db() {
  if (typeof indexedDB === "undefined") return null;
  dbPromise ??= openDB<ChalkboardDB>("e1-4-chalkboard", 1, {
    upgrade(database) {
      const store = database.createObjectStore("boards", { keyPath: "key" });
      store.createIndex("byUpdated", "updatedAt");
    },
  });
  return dbPromise;
}

/**
 * Local-first mirror of chalkboard documents. Every edit lands here before the debounced server
 * save, so a crash, offline stretch or failed request never loses work. `syncedAt` is the
 * hook for a later cloud reconciliation pass.
 */
export const localBoards = {
  async get(key: string): Promise<LocalBoard | null> {
    const d = await db();
    if (!d) return null;
    const row = await d.get("boards", key);
    if (!row) return null;
    try {
      return { ...row, doc: parseBoardDocument(row.doc) };
    } catch {
      return null;
    }
  },

  async put(entry: Omit<LocalBoard, "updatedAt">): Promise<void> {
    const d = await db();
    if (!d) return;
    await d.put("boards", { ...entry, updatedAt: Date.now() });
  },

  async markSynced(key: string, at = Date.now()): Promise<void> {
    const d = await db();
    if (!d) return;
    const row = await d.get("boards", key);
    if (row) await d.put("boards", { ...row, syncedAt: at });
  },

  async rename(from: string, to: string): Promise<void> {
    const d = await db();
    if (!d || from === to) return;
    const row = await d.get("boards", from);
    if (!row) return;
    const tx = d.transaction("boards", "readwrite");
    await Promise.all([
      tx.store.put({ ...row, key: to }),
      tx.store.delete(from),
      tx.done,
    ]);
  },

  async remove(key: string): Promise<void> {
    const d = await db();
    if (!d) return;
    await d.delete("boards", key);
  },
};
