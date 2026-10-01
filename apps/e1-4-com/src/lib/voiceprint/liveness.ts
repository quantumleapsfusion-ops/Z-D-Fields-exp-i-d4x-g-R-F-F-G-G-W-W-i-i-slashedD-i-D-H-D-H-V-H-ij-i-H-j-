import "server-only";

import { randomInt } from "node:crypto";

import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { getTranscriber } from "@/lib/stt";

const DIGIT_COUNT = 4;
const TTL_MS = 2 * 60_000;

const WORDS: Record<string, string> = {
  zero: "0",
  oh: "0",
  o: "0",
  one: "1",
  won: "1",
  two: "2",
  to: "2",
  too: "2",
  three: "3",
  four: "4",
  for: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  ate: "8",
  nine: "9",
};

/** The digits in a transcript, whether the speech recogniser wrote "4 7" or "four seven". */
export function digitsIn(transcript: string): string {
  return transcript
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((token) => (/^\d+$/.test(token) ? token : (WORDS[token] ?? "")))
    .join("");
}

/** Whether what was said contains the challenge digits, in order. */
export function matchesChallenge(transcript: string, digits: string): boolean {
  return digitsIn(transcript).includes(digits);
}

export function newDigits(): string {
  return Array.from({ length: DIGIT_COUNT }, () => randomInt(0, 10)).join("");
}

/** Creates a single-use challenge. The device speaks the digits aloud; nothing is ever shown. */
export async function issueChallenge(): Promise<{ id: string; digits: string }> {
  const now = new Date();
  await prisma.authChallenge.deleteMany({ where: { expiresAt: { lt: now } } });
  const digits = newDigits();
  const row = await prisma.authChallenge.create({
    data: {
      purpose: "liveness",
      challenge: digits,
      expiresAt: new Date(now.getTime() + TTL_MS),
    },
    select: { id: true },
  });
  return { id: row.id, digits };
}

export type LivenessMode = "check" | "skip" | "fail";

/** Whether this deployment can and should check liveness. */
export function livenessMode(): LivenessMode {
  if (env.voiceLiveness === "off") return "skip";
  if (getTranscriber()) return "check";
  return env.voiceLiveness === "required" ? "fail" : "skip";
}

export type LivenessResult = "ok" | "failed" | "unavailable";

/**
 * Consumes the challenge and checks that the recording says its digits. The recording must have
 * started after the device finished speaking them, so a replayed clip of the owner's voice
 * cannot contain them.
 */
export async function verifyLiveness(
  challengeId: string | null,
  audio: Blob | null,
): Promise<LivenessResult> {
  const mode = livenessMode();
  if (mode === "skip") {
    if (!env.voiceLiveness)
      console.warn("[voice-id] no speech-to-text: liveness not checked");
    return "ok";
  }
  if (mode === "fail") return "unavailable";
  if (!challengeId || !audio || audio.size === 0) return "failed";

  const row = await prisma.authChallenge
    .delete({ where: { id: challengeId } })
    .catch(() => null);
  if (!row || row.purpose !== "liveness" || row.expiresAt.getTime() <= Date.now()) {
    return "failed";
  }
  const transcriber = getTranscriber();
  if (!transcriber) return "unavailable";
  try {
    const { text } = await transcriber.transcribe(
      new Uint8Array(await audio.arrayBuffer()),
      (audio.type || "audio/webm").split(";")[0],
    );
    return matchesChallenge(text, row.challenge) ? "ok" : "failed";
  } catch (error) {
    console.error("[voice-id] liveness transcription failed", error);
    return "unavailable";
  }
}
