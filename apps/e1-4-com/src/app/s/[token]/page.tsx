import { notFound } from "next/navigation";

import { StreamField } from "@/features/codex/StreamField";
import { prisma } from "@/lib/db";
import { resolveShare } from "@/lib/voice/share";

export const metadata = { robots: { index: false } };

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const share = await resolveShare(token);
  if (!share) notFound();

  const segments = await prisma.voiceSegment.findMany({
    where: share.segmentId
      ? { id: share.segmentId, stream: { userId: share.userId } }
      : { stream: { userId: share.userId } },
    orderBy: { index: "asc" },
  });

  if (!share.includeAudio) {
    const lines = share.includeTranscript
      ? segments.filter((s) => s.transcription?.trim())
      : [];
    return (
      <main className="text-chalk min-h-dvh bg-black px-6 py-16">
        <article className="mx-auto flex max-w-xl flex-col gap-5 text-lg leading-relaxed">
          {lines.length === 0 ? (
            <p className="text-dust">Nothing to read here yet.</p>
          ) : (
            lines.map((s) => <p key={s.id}>{s.transcription}</p>)
          )}
        </article>
      </main>
    );
  }

  return (
    <StreamField
      entries={segments.map((s) => ({
        id: s.id,
        durationMs: s.durationMs,
        audioUrl: `/api/share/${token}/audio/${s.id}`,
      }))}
    />
  );
}
