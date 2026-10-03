"use client";

import { useCallback, useEffect, useState } from "react";

import { flush } from "@/lib/pending/queue";

import { uploadSpan } from "./upload";

/**
 * Sends recordings that failed to save earlier (this session or a previous one) as soon as the
 * person is signed in and online. `waiting` is true while any are still left, so the page can
 * show a quiet glyph; `retry` tries again now.
 */
export function usePendingFlush(onSaved?: () => void) {
  const [waiting, setWaiting] = useState(false);

  const retry = useCallback(async () => {
    const left = await flush(uploadSpan);
    setWaiting(left > 0);
    if (left === 0) onSaved?.();
    return left;
  }, [onSaved]);

  useEffect(() => {
    let live = true;
    const sweep = () =>
      flush(uploadSpan).then((left) => {
        if (live) setWaiting(left > 0);
      });
    void sweep();
    window.addEventListener("online", sweep);
    return () => {
      live = false;
      window.removeEventListener("online", sweep);
    };
  }, []);

  return { waiting, retry };
}
