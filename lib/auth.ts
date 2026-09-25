import 'server-only';

import type { User as SupabaseUser } from '@supabase/supabase-js';

import { prisma } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

import { OAUTH_PROVIDERS, type OAuthProvider } from './auth-providers';

export type SessionUser = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  /** Linked identity providers, e.g. `['google']`. */
  providers: string[];
};

export type ProviderSummary = { id: OAuthProvider; name: string };

/** Providers are switched on in the Supabase dashboard, so all three are always offered. */
export function enabledProviders(): ProviderSummary[] {
  return (Object.keys(OAUTH_PROVIDERS) as OAuthProvider[]).map((id) => ({
    id,
    name: OAUTH_PROVIDERS[id].label,
  }));
}

function meta(user: SupabaseUser, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = user.user_metadata?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function providerLabels(user: SupabaseUser): string[] {
  const ids = new Set<string>();
  for (const identity of user.identities ?? []) {
    if (identity.provider) ids.add(identity.provider);
  }
  const primary = user.app_metadata?.provider;
  if (typeof primary === 'string' && primary) ids.add(primary);
  return [...ids].map((id) =>
    id in OAUTH_PROVIDERS ? OAUTH_PROVIDERS[id as OAuthProvider].label : id,
  );
}

export function toSessionUser(user: SupabaseUser): SessionUser {
  return {
    id: user.id,
    email: user.email ?? null,
    name: meta(user, 'full_name', 'name', 'preferred_username'),
    image: meta(user, 'avatar_url', 'picture'),
    providers: providerLabels(user),
  };
}

/** The signed-in Supabase Auth user (validated against the auth server), or `null`. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? toSessionUser(user) : null;
}

/** Returns the signed-in user's id or `null`. */
export async function getUserId(): Promise<string | null> {
  const user = await getSessionUser();
  return user?.id ?? null;
}

/**
 * Guarantees a `User` row for a Supabase Auth user. The `on_auth_user_created` trigger
 * (supabase/migrations) normally does this; this is the fallback for projects where the
 * trigger has not been installed yet.
 */
export async function ensureProfile(user: SessionUser) {
  return prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, email: user.email, name: user.name, image: user.image },
  });
}
