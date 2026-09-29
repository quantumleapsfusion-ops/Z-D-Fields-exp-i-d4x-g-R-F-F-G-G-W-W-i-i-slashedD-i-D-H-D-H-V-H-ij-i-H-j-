"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { enrollVoice, verifyVoice, type VoiceAuthResult } from "./voice";

/** Sign in by voice: the spoken voice name plus the voice print heard while saying it. */
export async function verifyVoiceAction(input: {
  phrase: string;
  embedding: number[];
}): Promise<VoiceAuthResult> {
  return verifyVoice(input);
}

/** First visit: learn a new voice name from several utterances and open a session. */
export async function enrollVoiceAction(input: {
  phrase: string;
  samples: number[][];
  displayName?: string;
}): Promise<VoiceAuthResult> {
  return enrollVoice(input);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
