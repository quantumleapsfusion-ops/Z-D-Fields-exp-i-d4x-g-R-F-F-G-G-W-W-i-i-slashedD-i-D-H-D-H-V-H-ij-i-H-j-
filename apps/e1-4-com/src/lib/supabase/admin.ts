import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";

/**
 * Service-role client. Bypasses RLS — use only in trusted server code
 * (account deletion, signed URLs for shared content, admin jobs).
 */
export function createAdminClient() {
  return createSupabaseClient(publicEnv.supabaseUrl, serverEnv().supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
