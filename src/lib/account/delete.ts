import "server-only";

import { db } from "@/lib/db";
import { AVATARS_BUCKET, VOICE_BUCKET, storage } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";

export interface HardDeleteResult {
  userId: string;
  storageObjectsRemoved: number;
  dbRowsRemoved: boolean;
  authUserRemoved: boolean;
}

/**
 * Irreversibly removes everything belonging to a user:
 *   1. Storage objects under `<uid>/` in the `voice` and `avatars` buckets
 *   2. Postgres rows (User; VoiceStream/VoiceSegment/Share cascade via FKs)
 *   3. The Supabase Auth user itself
 *
 * Storage goes first so a failure there leaves the DB rows (and thus the
 * paths needed to retry) intact.
 */
export async function hardDeleteUser(userId: string): Promise<HardDeleteResult> {
  const [voiceRemoved, avatarsRemoved] = await Promise.all([
    storage.removePrefix(VOICE_BUCKET, userId),
    storage.removePrefix(AVATARS_BUCKET, userId),
  ]);

  const deleted = await db.user.deleteMany({ where: { id: userId } });

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error && error.status !== 404) {
    throw new Error(`auth.admin.deleteUser(${userId}): ${error.message}`);
  }

  return {
    userId,
    storageObjectsRemoved: voiceRemoved + avatarsRemoved,
    dbRowsRemoved: deleted.count > 0,
    authUserRemoved: !error,
  };
}
