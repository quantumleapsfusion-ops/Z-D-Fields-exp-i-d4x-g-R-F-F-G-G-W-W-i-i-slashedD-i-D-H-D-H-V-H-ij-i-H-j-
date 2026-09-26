import "server-only";

import type { StorageProvider } from "./types";
import { SupabaseStorageProvider } from "./supabase";

export type { StorageBucket, StorageProvider, UploadInput } from "./types";
export { AVATARS_BUCKET, VOICE_BUCKET } from "./types";

/** The active storage provider. Swap the implementation here to change backends. */
export const storage: StorageProvider = new SupabaseStorageProvider();
