import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { constitution } from "@/lib/constitution";
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

      {page.slug === "research" ? (
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

      {page.slug === "global-citizenship" ? (
        <div className="mt-16 w-full max-w-4xl space-y-12 text-left">
          {/* Preamble */}
          <section id="preamble" aria-labelledby="preamble-title">
            <h2
              id="preamble-title"
              className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl"
            >
              Preamble
            </h2>
            <p className="mt-6 text-sm leading-relaxed font-light text-white/70 sm:text-base">
              {constitution.preamble.text}
            </p>

            {/* Fundamental Principles */}
            <div className="mt-8">
              <h3 className="font-display text-sm tracking-[0.12em] uppercase text-white/90 sm:text-base">
                Fundamental Principles
              </h3>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {constitution.preamble.principles.map((principle) => (
                  <div
                    key={principle.id}
                    className="rounded border border-white/10 bg-white/5 p-4"
                  >
                    <h4 className="font-display text-sm tracking-[0.08em] uppercase text-white/90">
                      {principle.title}
                    </h4>
                    <p className="mt-3 text-xs leading-relaxed font-light text-white/60">
                      {principle.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Articles */}
          <section id="articles" aria-labelledby="articles-title">
            <h2
              id="articles-title"
              className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl"
            >
              Articles of the Constitution
            </h2>

            <div className="mt-8 space-y-10">
              {constitution.articles.map((article) => (
                <article
                  key={article.id}
                  id={article.id}
                  className="border-l-2 border-white/20 pl-6"
                >
                  <h3 className="font-display text-base tracking-[0.12em] uppercase text-white/90 sm:text-lg">
                    Article {article.number}: {article.title}
                  </h3>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed font-light text-white/70 sm:text-base">
                    {article.content}
                  </p>

                  {article.citeableQuote && (
                    <div className="mt-6 rounded bg-white/5 p-4">
                      <p className="text-xs italic leading-relaxed text-white/60">
                        "{article.citeableQuote.text}"
                      </p>
                      <p className="mt-3 text-xs font-light text-white/40">
                        — {article.citeableQuote.source}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-white/40">
                        <span className="font-semibold">Earth One Context:</span>{" "}
                        {article.citeableQuote.applicability}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          {/* Governance & Enforcement */}
          <section
            id={constitution.governance.id}
            aria-labelledby="governance-title"
          >
            <h2
              id="governance-title"
              className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl"
            >
              {constitution.governance.title}
            </h2>
            <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed font-light text-white/70 sm:text-base">
              {constitution.governance.content}
            </p>
          </section>

          {/* Vision of Digital Personhood */}
          <section
            id={constitution.vision.id}
            aria-labelledby="vision-title"
          >
            <h2
              id="vision-title"
              className="font-display text-lg tracking-[0.16em] uppercase sm:text-2xl"
            >
              {constitution.vision.title}
            </h2>
            <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed font-light text-white/70 sm:text-base">
              {constitution.vision.content}
            </p>

            {constitution.vision.citeableQuote && (
              <div className="mt-8 rounded border border-white/10 bg-white/5 p-6">
                <p className="text-sm italic leading-relaxed text-white/70">
                  "{constitution.vision.citeableQuote.text}"
                </p>
                <p className="mt-4 text-xs font-light text-white/40">
                  — {constitution.vision.citeableQuote.source}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-white/40">
                  <span className="font-semibold">Earth One Context:</span>{" "}
                  {constitution.vision.citeableQuote.applicability}
                </p>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
