import { site } from '@/lib/site';

export function CTA() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-24 sm:px-8 sm:py-32">
      <p className="max-w-3xl font-display text-2xl leading-snug tracking-tight sm:text-4xl">
        Built by Earth One Global Coalescent — global citizenship for all, one voice at a time.
      </p>
      <a
        href={site.philosophyUrl}
        rel="noreferrer"
        className="mt-8 inline-flex items-center gap-2 border-b border-ochre/60 pb-1 font-sans text-base text-ochre transition-colors hover:border-ochre hover:text-chalk sm:text-lg"
      >
        Read the philosophy at earth1.co
        <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}
