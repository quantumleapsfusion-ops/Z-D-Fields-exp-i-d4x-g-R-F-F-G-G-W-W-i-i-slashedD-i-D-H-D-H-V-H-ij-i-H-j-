import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sectionBySlug } from "@earth-one/content";

import { FieldPage } from "@/components/FieldPage";
import { ProteinFolder } from "@/components/ProteinFolder";

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
  const section = sectionBySlug.get(page.slug);
  const description = section
    ? `${page.line} ${section.figures.map((f) => f.name).join(", ")}: who they were, what they found, and what they said, with sources.`
    : page.line;
  return {
    title: page.title,
    description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      type: section ? "article" : "website",
      title: `${page.title} — ${site.name}`,
      description,
      url: `/${page.slug}`,
    },
  };
}

export default async function PillarPage({ params }: Props) {
  const { pillar } = await params;
  const page = site.pillars.find((p) => p.slug === pillar);
  if (!page) notFound();
  const section = sectionBySlug.get(page.slug);
  if (section) return <FieldPage section={section} />;
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
      {page.slug === "biochemistry" ? (
        <div className="mt-16 w-full max-w-4xl">
          <ProteinFolder />
        </div>
      ) : null}
    </>
  );
}
