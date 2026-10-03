"use client";

import { enqueue } from "@/lib/pending/queue";

import { uploadSpan } from "./upload";
import type { CapturedSpan } from "./useRecorder";

/**
 * Saves one span to the signed-in user's stream. Uploads retry on their own; if they still fail,
 * the span is kept on the device and sent later, so `false` means "saved for later", not "lost".
 */
export async function saveSpan(span: CapturedSpan): Promise<boolean> {
  const id = crypto.randomUUID();
  try {
    await uploadSpan(span);
    return true;
  } catch {
    await enqueue(id, span);
    return false;
  }
}
