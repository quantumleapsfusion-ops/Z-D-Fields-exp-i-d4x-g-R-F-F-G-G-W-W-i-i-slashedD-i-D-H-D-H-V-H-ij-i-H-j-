import { PageShell } from '@/components/PageShell';

/** Shared frame for /privacy, /terms and /content-policy. Every legal page is a draft until counsel signs off. */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-5 py-16 font-sans leading-relaxed text-chalk/80 sm:px-8">
        <p className="label">Draft — pending legal review</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-display text-chalk">
          {title}
        </h1>
        <div className="rule mt-4" />
        <p className="mt-2 text-sm text-dust">Last updated {updated}</p>
        <div className="[&_h2]:label mt-8 space-y-3 [&_h2]:mt-10 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-chalk">
          {children}
        </div>
      </article>
    </PageShell>
  );
}
