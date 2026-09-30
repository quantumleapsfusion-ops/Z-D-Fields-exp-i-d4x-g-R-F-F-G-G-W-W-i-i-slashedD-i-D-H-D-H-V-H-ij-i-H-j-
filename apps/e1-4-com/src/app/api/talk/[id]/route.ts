import { NextResponse } from "next/server";

import { getUserId } from "@/lib/auth/user";
import { getThread } from "@/lib/talk/conversations";

export const runtime = "nodejs";

/**
 * Poll: members (with live presence), notes created at or after `?since=`, and every current note
 * id so clients can drop notes that were unsent.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const sinceParam = new URL(request.url).searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : undefined;
  if (since && Number.isNaN(since.getTime())) {
    return NextResponse.json({ error: "Invalid since" }, { status: 400 });
  }
  const thread = await getThread(userId, id, since);
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(
    {
      members: thread.members,
      notes: thread.notes,
      noteIds: thread.noteIds,
      asOf: thread.asOf,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
