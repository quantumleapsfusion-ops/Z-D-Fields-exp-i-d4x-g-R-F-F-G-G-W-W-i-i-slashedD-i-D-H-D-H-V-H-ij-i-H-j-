import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Starts a Supabase session (sets the auth cookies) for a user we have already verified
 * ourselves, e.g. with a passkey. Uses a server-side one-time token: no email is sent.
 */
export async function startSessionFor(userId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: found, error: findError } = await admin.auth.admin.getUserById(userId);
  const email = found?.user?.email;
  if (findError || !email) throw new Error("Account not found");
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (error || !data.properties?.hashed_token) throw new Error("Could not start session");
  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: data.properties.hashed_token,
  });
  if (verifyError) throw new Error("Could not start session");
}
