import { NextResponse } from "next/server";

import { withRuntimeEnv } from "@/lib/api/handler";
import { endSession } from "@/lib/auth/session";
import { getUserId } from "@/lib/auth/user";
import { hardDeleteUser } from "@/lib/privacy/hard-delete";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Destroys everything e1-4 holds about the signed-in person: stored audio and avatars first, then
 * the database rows (stream, segments, shares, boards, notes, voiceprint, sessions, login events
 * all cascade from the user row), then the session cookie. Same-origin only; the proxy refuses
 * cross-site non-GET calls before they reach here.
 */
async function handleDELETE() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await hardDeleteUser(userId);
  await endSession();
  return NextResponse.json({
    ok: result.dbRowsRemoved,
    objectsDeleted: result.objectsDeleted,
  });
}

export const DELETE = withRuntimeEnv(handleDELETE);
