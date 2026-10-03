import { test } from "@playwright/test";

import { startFakeStorage, type FakeStorage } from "./fake-storage";

const PORT = Number(process.env.E2E_FAKE_STORAGE_PORT ?? 54321);

/** True when the app under test was built to talk to the local storage fake rather than Supabase. */
export const USING_FAKE_STORAGE = /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
);

/**
 * Runs the storage fake for the whole spec file when the app points at it. Spec files run one at
 * a time (`workers: 1`), so each file owns the port while its tests run. Against a real Supabase
 * project this is a no-op and the same tests go through real storage.
 */
export function runFakeStorage(): { current: FakeStorage | null } {
  const holder: { current: FakeStorage | null } = { current: null };
  test.beforeAll(async () => {
    if (USING_FAKE_STORAGE) holder.current = await startFakeStorage(PORT);
  });
  test.afterAll(async () => {
    await holder.current?.close();
    holder.current = null;
  });
  return holder;
}
