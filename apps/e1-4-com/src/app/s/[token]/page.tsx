import { notFound } from "next/navigation";

import { StreamField } from "@/features/codex/StreamField";
import { prisma } from "@/lib/db";
import { resolveShare } from "@/lib/voice/share";

export const metadata = { title: "Shared voice", robots: { index: false } };

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

  return (
    <StreamField
      entries={
        share.includeAudio
          ? segments.map((s) => ({
              id: s.id,
              durationMs: s.durationMs,
              audioUrl: `/api/share/${token}/audio/${s.id}`,
            }))
          : []
      }
    />
  );
}
