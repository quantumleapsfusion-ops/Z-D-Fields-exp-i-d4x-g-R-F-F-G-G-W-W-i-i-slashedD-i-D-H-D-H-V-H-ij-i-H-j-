import "server-only";

import type { User } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

import {
  MATCH_DISTANCE,
  type Voiceprint,
  blend,
  distance,
  isVoiceprint,
} from "./voiceprint";

/** Voice-only identities need an address for Supabase Auth; it is never shown or mailed. */
const VOICE_EMAIL_DOMAIN = "voice.e1-4.com";
const PAGE = 1000;

type Admin = ReturnType<typeof createAdminClient>;

function storedPrint(user: User): { print: Voiceprint; count: number } | null {
  const meta = user.app_metadata as { voiceprint?: unknown; voiceprintCount?: unknown };
  if (!isVoiceprint(meta.voiceprint)) return null;
  const count = typeof meta.voiceprintCount === "number" ? meta.voiceprintCount : 1;
  return { print: meta.voiceprint, count };
}

async function closestSpeaker(admin: Admin, sample: Voiceprint): Promise<User | null> {
  let best: { user: User; d: number } | null = null;
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PAGE });
    if (error) throw error;
    for (const user of data.users) {
      const stored = storedPrint(user);
      if (!stored) continue;
      const d = distance(stored.print, sample);
      if (d <= MATCH_DISTANCE && (!best || d < best.d)) best = { user, d };
    }
    if (data.users.length < PAGE) return best?.user ?? null;
  }
}

async function remember(admin: Admin, user: User, sample: Voiceprint) {
  const stored = storedPrint(user);
  const print = stored ? blend(stored.print, sample, stored.count) : sample;
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { voiceprint: print, voiceprintCount: (stored?.count ?? 0) + 1 },
  });
  if (error) throw error;
}

async function enroll(admin: Admin, sample: Voiceprint): Promise<User> {
  const { data, error } = await admin.auth.admin.createUser({
    email: `${crypto.randomUUID()}@${VOICE_EMAIL_DOMAIN}`,
    email_confirm: true,
    app_metadata: { voiceprint: sample, voiceprintCount: 1 },
  });
  if (error) throw error;
  return data.user;
}

/** Opens a session for `user` in this request's cookies. */
async function signIn(admin: Admin, user: User) {
  if (!user.email) throw new Error("Voice identity has no auth address");
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: user.email,
  });
  if (error) throw error;
  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: data.properties.hashed_token,
  });
  if (verifyError) throw verifyError;
}

/**
 * The voice is the key: signed in, it refines the speaker's print; signed out, the closest
 * matching speaker is signed in, and an unheard voice is given a stream of its own.
 */
export async function identifyVoice(sample: Voiceprint, current: User | null) {
  const admin = createAdminClient();
  if (current) {
    await remember(admin, current, sample);
    return { userId: current.id, enrolled: false };
  }
  const match = await closestSpeaker(admin, sample);
  if (match) {
    await remember(admin, match, sample);
    await signIn(admin, match);
    return { userId: match.id, enrolled: false };
  }
  const user = await enroll(admin, sample);
  await signIn(admin, user);
  return { userId: user.id, enrolled: true };
}
