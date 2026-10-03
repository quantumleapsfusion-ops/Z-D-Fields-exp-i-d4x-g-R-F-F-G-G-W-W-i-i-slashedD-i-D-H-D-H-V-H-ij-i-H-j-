import "server-only";

import { env } from "@/lib/env";

import { LocalStorageProvider } from "./local";
import type { StorageProvider } from "./types";
import { SupabaseStorageProvider } from "./supabase";

export type { StorageBucket, StorageProvider, UploadInput } from "./types";
export { AVATARS_BUCKET, VOICE_BUCKET } from "./types";

/**
 * The active storage provider. Supabase Storage in production; plain files on disk when
 * `STORAGE_PROVIDER=local`, so the app runs on a laptop with nothing but Postgres.
 */
export const storage: StorageProvider =
  env.storage.provider === "local"
    ? new LocalStorageProvider(env.storage.localDir)
    : new SupabaseStorageProvider();
