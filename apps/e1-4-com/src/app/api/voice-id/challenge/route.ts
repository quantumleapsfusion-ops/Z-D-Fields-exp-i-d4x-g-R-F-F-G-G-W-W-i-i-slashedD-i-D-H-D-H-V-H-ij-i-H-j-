import { NextResponse } from "next/server";

import { unavailable } from "@/lib/voice-id/http";
import { createChallenge } from "@/lib/voice-id/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Issues a fresh single-use phrase to speak for one sign-in attempt. */
export async function POST() {
  const off = unavailable();
  if (off) return off;
  return NextResponse.json(await createChallenge());
}
