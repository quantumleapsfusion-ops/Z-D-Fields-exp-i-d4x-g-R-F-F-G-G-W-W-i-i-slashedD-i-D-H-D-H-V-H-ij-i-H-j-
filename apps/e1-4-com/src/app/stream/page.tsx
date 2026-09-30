import { notFound } from "next/navigation";

import { StreamField } from "@/features/codex/StreamField";
import { requireUser } from "@/lib/auth/user";
import { talkSource } from "@/lib/talk/dimensions";
import { getThread } from "@/lib/talk/conversations";
import { listSegments } from "@/lib/voice/stream";

export const metadata = { title: "Voice Stream" };

export default async function StreamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const talk = (await searchParams).talk;
  const talkId = talkSource(
    new URLSearchParams(typeof talk === "string" ? { talk } : {}),
  );
  const user = await requireUser(talkId ? `/stream?talk=${talkId}` : "/stream");

  if (talkId) {
    const thread = await getThread(user.id, talkId);
    if (!thread) notFound();
    return (
      <StreamField
        entries={thread.notes.map((n) => ({
          id: n.id,
          durationMs: n.durationMs,
          audioUrl: `/api/talk/notes/${n.id}/audio`,
        }))}
      />
    );
  }

  const segments = await listSegments(user.id);

  return (
    <StreamField
      entries={segments.map((s) => ({
        id: s.id,
        durationMs: s.durationMs,
        audioUrl: `/api/stream/segments/${s.id}/audio`,
      }))}
    />
  );
}
