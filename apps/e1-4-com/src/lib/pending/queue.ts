"use client";

import type { CapturedSpan } from "@/features/voice-stream/useRecorder";

/**
 * Recordings that could not be uploaded yet, kept on the device (IndexedDB) so a failed save, a
 * dropped connection or a closed tab never loses an entry. Everything here is best-effort: if
 * IndexedDB is unavailable the in-memory retry still works.
 */

const DB = "e14-pending";
const STORE = "spans";

type Stored = {
  id: string;
  blob: Blob;
  mimeType: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  pcm?: ArrayBuffer;
};

function open(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore(STORE, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

function run<T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  return open().then(
    (db) =>
      new Promise<T | null>((resolve) => {
        if (!db) return resolve(null);
        try {
          const request = work(db.transaction(STORE, mode).objectStore(STORE));
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      }),
  );
}

export async function enqueue(id: string, span: CapturedSpan): Promise<void> {
  const row: Stored = {
    id,
    blob: span.blob,
    mimeType: span.mimeType,
    startedAt: span.startedAt.toISOString(),
    endedAt: span.endedAt.toISOString(),
    durationMs: span.durationMs,
    pcm: span.pcm,
  };
  await run("readwrite", (store) => store.put(row));
}

export async function dequeue(id: string): Promise<void> {
  await run("readwrite", (store) => store.delete(id));
}

export async function pending(): Promise<{ id: string; span: CapturedSpan }[]> {
  const rows = (await run<Stored[]>("readonly", (store) => store.getAll())) ?? [];
  return rows.map((row) => ({
    id: row.id,
    span: {
      blob: row.blob,
      mimeType: row.mimeType,
      startedAt: new Date(row.startedAt),
      endedAt: new Date(row.endedAt),
      durationMs: row.durationMs,
      pcm: row.pcm,
    },
  }));
}

/** Uploads everything left over from earlier. Returns how many are still waiting. */
export async function flush(
  upload: (span: CapturedSpan) => Promise<unknown>,
): Promise<number> {
  const rows = await pending();
  let left = 0;
  for (const row of rows) {
    try {
      await upload(row.span);
      await dequeue(row.id);
    } catch {
      left += 1;
    }
  }
  return left;
}
