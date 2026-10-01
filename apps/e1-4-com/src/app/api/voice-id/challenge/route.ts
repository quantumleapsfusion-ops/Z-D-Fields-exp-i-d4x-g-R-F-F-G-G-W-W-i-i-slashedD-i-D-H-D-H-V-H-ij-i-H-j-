import { NextResponse } from "next/server";

import { withRuntimeEnv } from "@/lib/api/handler";
import { issueChallenge, livenessMode } from "@/lib/voiceprint/liveness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Digits the device will say out loud for the person to repeat. `null` when not checked here. */
async function handlePOST() {
  if (livenessMode() !== "check") return NextResponse.json({ challenge: null });
  return NextResponse.json({ challenge: await issueChallenge() });
}

export const POST = withRuntimeEnv(handlePOST);
