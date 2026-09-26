import { site } from "@/lib/site";

export function CTA() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-24 sm:px-8 sm:py-32">
      <p className="font-display max-w-3xl text-2xl leading-snug tracking-tight sm:text-4xl">
        Built by Earth One Global Coalescent — global citizenship for all, one voice at a
        time.
      </p>
      <a
        href={site.philosophyUrl}
        rel="noreferrer"
        className="border-ochre/60 text-ochre hover:border-ochre hover:text-chalk mt-8 inline-flex items-center gap-2 border-b pb-1 font-sans text-base transition-colors sm:text-lg"
      >
        Read the philosophy at earth1.co
        <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}
