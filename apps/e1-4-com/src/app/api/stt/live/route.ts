import { NextResponse } from "next/server";

import { withRuntimeEnv } from "@/lib/api/handler";

import { getUserId } from "@/lib/auth/user";
import { getLiveTranscriptionConfig } from "@/lib/stt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Tells the browser how to run live transcription. Paid Deepgram tokens are only minted for
 * signed-in users; everyone else gets the free browser Web Speech API.
 */
async function handleGET() {
  const userId = await getUserId().catch(() => null);
  if (!userId) return NextResponse.json({ provider: "browser" });
  return NextResponse.json(await getLiveTranscriptionConfig());
}

export const GET = withRuntimeEnv(handleGET);
