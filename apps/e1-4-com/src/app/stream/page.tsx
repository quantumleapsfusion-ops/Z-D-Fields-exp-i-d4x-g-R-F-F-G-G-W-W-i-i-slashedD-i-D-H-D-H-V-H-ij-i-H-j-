import { StreamField } from "@/features/codex/StreamField";
import { requireUser } from "@/lib/auth/user";
import { listSegments } from "@/lib/voice/stream";

export const metadata = { title: "Voice Stream" };

export default async function StreamPage() {
  const user = await requireUser("/stream");
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
