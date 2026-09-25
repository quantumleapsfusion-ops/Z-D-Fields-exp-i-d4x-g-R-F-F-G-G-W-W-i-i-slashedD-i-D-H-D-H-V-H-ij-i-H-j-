import { PageHeading, PageShell } from '@/components/PageShell';
import { VoiceStreamApp } from '@/features/voice-stream/VoiceStreamApp';
import { features, statusLabel } from '@/lib/site';
import { requireUser } from '@/lib/require-user';
import { listSegments } from '@/lib/voice/stream';

export const metadata = { title: 'Voice Stream' };

/** Voice Stream — production-ready. */
export default async function StreamPage() {
  const user = await requireUser('/stream');
  const segments = await listSegments(user.id);
  const feature = features.find((f) => f.href === '/stream')!;

  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
        <PageHeading
          title={feature.title}
          tagline={feature.body}
          status={statusLabel[feature.status]}
        />
        <VoiceStreamApp initialSegments={segments} />
      </section>
    </PageShell>
  );
}
