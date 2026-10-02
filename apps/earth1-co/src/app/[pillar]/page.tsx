import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { legends } from "@/lib/legends";
import { research } from "@/lib/research";
import { site } from "@/lib/site";

type Props = { params: Promise<{ pillar: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return site.pillars.map((p) => ({ pillar: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pillar } = await params;
  const page = site.pillars.find((p) => p.slug === pillar);
  if (!page) return {};
  return {
    title: page.title,
    description: page.line,
    alternates: { canonical: `/${page.slug}` },
  };
}

export default async function PillarPage({ params }: Props) {
  const { pillar } = await params;
  const page = site.pillars.find((p) => p.slug === pillar);
  if (!page) notFound();
  return (
    <>
      <h1 className="font-display text-xl tracking-[0.2em] uppercase sm:text-4xl">
        {page.title}
      </h1>
      <p className="mt-6 max-w-md text-sm font-light tracking-[0.08em] text-white/70 sm:text-base">
        {page.line}
      </p>
      {page.slug === "legends" ? (
        <div className="mt-16 grid w-full max-w-4xl gap-8 text-left sm:grid-cols-2">
          {legends.map((legend) => (
            <section
              key={legend.id}
              id={legend.id}
              aria-labelledby={`${legend.id}-title`}
              className="border-l border-white/25 pl-4"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-xs tracking-[0.16em] text-white/50 font-light">
                  {legend.rank}
                </span>
                <h2
                  id={`${legend.id}-title`}
                  className="font-display text-base tracking-[0.12em] uppercase sm:text-lg"
                >
                  {legend.name}
                </h2>
              </div>
              <p className="mt-3 text-xs tracking-[0.06em] text-white/60 uppercase">
                {legend.era}
              </p>
              <p className="mt-4 text-sm leading-relaxed font-light text-white/70">
                {legend.description}
              </p>
              <p className="mt-2 text-xs leading-relaxed font-light text-white/60">
                {legend.significance}
              </p>
              {legend.quote ? (
                <blockquote className="mt-4 italic text-sm text-white/60 border-l-2 border-white/20 pl-3">
                  "{legend.quote.text}"
                  <footer className="mt-2 not-italic text-xs text-white/50">
                    — {legend.quote.source}
                  </footer>
                </blockquote>
              ) : null}
            </section>
          ))}
        </div>
      ) : page.slug === "research" ? (
        <div className="mt-16 grid w-full max-w-4xl gap-12 text-left sm:grid-cols-2">
          {research.map((area) => (
            <section key={area.id} id={area.id} aria-labelledby={`${area.id}-title`}>
              <h2
                id={`${area.id}-title`}
                className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl"
              >
                {area.title}
              </h2>
              <p className="mt-4 text-sm leading-relaxed font-light text-white/70 sm:text-base">
                {area.question}
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {area.focus.map((topic) => (
                  <li
                    key={topic}
                    className="rounded-full border border-white/25 px-3 py-1 text-xs tracking-[0.08em]"
                  >
                    {topic}
                  </li>
                ))}
              </ul>
              <a
                href={area.reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block border-b border-white/40 pb-0.5 text-xs tracking-[0.08em] text-white/70 hover:text-white"
              >
                {area.reference.title} ↗
              </a>
            </section>
          ))}
        </div>
      ) : null}
    </>
  );
}
