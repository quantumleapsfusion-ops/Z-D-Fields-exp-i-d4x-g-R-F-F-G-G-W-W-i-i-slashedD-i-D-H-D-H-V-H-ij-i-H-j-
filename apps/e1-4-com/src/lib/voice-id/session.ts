import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase Auth needs an address per user. Voice-only accounts get an internal one on a domain
 * no mail is ever sent to; it is never shown and never stored on the profile row.
 */
export const VOICE_ACCOUNT_DOMAIN = "voice.e1-4.com";

export const isVoiceAccountEmail = (email: string | null | undefined) =>
  Boolean(email?.endsWith(`@${VOICE_ACCOUNT_DOMAIN}`));

export async function createVoiceAccount(): Promise<string> {
  const { data, error } = await createAdminClient().auth.admin.createUser({
    email: `${crypto.randomUUID()}@${VOICE_ACCOUNT_DOMAIN}`,
    email_confirm: true,
    user_metadata: { voice_only: true },
  });
  if (error || !data.user) throw new Error(`createUser: ${error?.message ?? "no user"}`);
  return data.user.id;
}

/**
 * Signs the request in as `userId` after the server has verified their voice: mints a one-time
 * magic-link token with the service role (no mail is sent) and redeems it on the cookie-bound
 * client, so the usual Supabase session cookies and RLS apply.
 */
export async function startSessionFor(userId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: found, error: lookupError } = await admin.auth.admin.getUserById(userId);
  const email = found.user?.email;
  if (lookupError || !email)
    throw new Error(`getUserById: ${lookupError?.message ?? "no email"}`);

  const { data: link, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkError) throw new Error(`generateLink: ${linkError.message}`);

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: "email",
    token_hash: link.properties.hashed_token,
  });
  if (error) throw new Error(`verifyOtp: ${error.message}`);
}
