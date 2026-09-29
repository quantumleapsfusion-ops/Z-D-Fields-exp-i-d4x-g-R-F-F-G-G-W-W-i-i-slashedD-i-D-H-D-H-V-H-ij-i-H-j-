import "server-only";

import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_S,
  createSessionToken,
  readSessionToken,
  sessionSecret,
} from "./token";

function requireSecret(): string {
  const secret = sessionSecret();
  if (!secret) throw new Error("Sessions are not configured");
  return secret;
}

/**
 * Signs in a user we have already verified ourselves (by voice or passkey) by setting a signed,
 * httpOnly session cookie. Call from a Route Handler or Server Action.
 */
export async function startSessionFor(userId: string): Promise<void> {
  const token = await createSessionToken(userId, requireSecret());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The user behind this request's session cookie, or null. */
export async function sessionUser(): Promise<User | null> {
  const secret = sessionSecret();
  if (!secret) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const userId = await readSessionToken(token, secret);
  if (!userId) return null;
  const { data, error } = await createAdminClient().auth.admin.getUserById(userId);
  return error ? null : data.user;
}
