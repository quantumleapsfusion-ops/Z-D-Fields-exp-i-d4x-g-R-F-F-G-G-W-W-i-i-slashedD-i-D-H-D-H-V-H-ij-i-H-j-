import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth/user";
import { setLive } from "@/lib/talk/conversations";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** `{ liveId }` announces that the caller is streaming live; `{ liveId: null }` ends it. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { liveId?: unknown };
  const liveId = typeof body.liveId === "string" ? body.liveId : null;
  if (liveId && !UUID.test(liveId)) {
    return NextResponse.json({ error: "Invalid liveId" }, { status: 400 });
  }
  const ok = await setLive(userId, id, liveId);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
