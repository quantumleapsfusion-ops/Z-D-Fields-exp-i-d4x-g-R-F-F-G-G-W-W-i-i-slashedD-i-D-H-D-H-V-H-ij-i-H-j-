import { PageHeading, PageShell } from '@/components/PageShell';
import { GravityBoard } from '@/features/gravity/GravityBoard';
import { flags } from '@/lib/flags';
import { getLanguageModel } from '@/lib/llm';
import { requireUser } from '@/lib/require-user';
import { features, statusLabel } from '@/lib/site';

export const metadata = { title: 'Gravity Board' };

/**
 * Gravity Board — EXPERIMENTAL prototype behind NEXT_PUBLIC_FEATURE_GRAVITY_BOARD (off by default).
 * The 2D→3D collapse is a mock-up; the 4D walk-in is future work.
 */
export default async function GravityPage() {
  const feature = features.find((f) => f.href === '/gravity')!;
  const heading = (
    <PageHeading
      title={feature.title}
      codenames={feature.codenames}
      tagline={feature.body}
      status={statusLabel[feature.status]}
    />
  );
  const keywords = (
    <ul className="mb-8 flex flex-wrap gap-2">
      {feature.keywords?.map((k) => (
        <li
          key={k}
          className="rounded-full border border-chalk/15 px-3 py-1 font-mono text-[0.68rem] text-dust"
        >
          {k}
        </li>
      ))}
    </ul>
  );

  if (!flags.gravityBoard) {
    return (
      <PageShell>
        <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
          {heading}
          {keywords}
          <p className="font-sans text-sm text-chalk/70">
            The Gravity Board is an experimental prototype and is switched off on this deployment.
            Set <code>NEXT_PUBLIC_FEATURE_GRAVITY_BOARD=true</code> to try it.
          </p>
        </section>
      </PageShell>
    );
  }

  await requireUser('/gravity');
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        {heading}
        {keywords}
        <GravityBoard llmReady={getLanguageModel() !== null} />
        <p className="mt-10 max-w-3xl font-sans text-xs leading-relaxed text-dust">
          Prototype, honestly labelled: density is a text heuristic, the “stochastic intelligence”
          is a high-temperature LLM sample (or a random stub), and the spacetime is a 3D particle
          mock-up. A four-dimensional spacetime you can walk into is future work.
        </p>
      </section>
    </PageShell>
  );
}
