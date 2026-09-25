'use server';

import { redirect } from 'next/navigation';

import { isOAuthProvider, OAUTH_PROVIDERS } from '@/lib/auth-providers';
import { publicEnv } from '@/lib/env';
import { safeNextPath } from '@/lib/safe-next';
import { createClient } from '@/lib/supabase/server';

/** Starts the OAuth flow. Supabase redirects back to /auth/callback with a PKCE code. */
export async function signInWithOAuth(formData: FormData) {
  const provider = formData.get('provider');
  if (!isOAuthProvider(provider)) throw new Error(`Unsupported provider: ${String(provider)}`);
  const next = safeNextPath(formData.get('next'));

  const supabase = await createClient();
  const callback = new URL('/auth/callback', publicEnv.siteUrl);
  callback.searchParams.set('next', next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callback.toString(), ...OAUTH_PROVIDERS[provider].options },
  });
  if (error || !data.url) {
    redirect(`/signin?error=${encodeURIComponent(error?.message ?? 'oauth_failed')}`);
  }
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
