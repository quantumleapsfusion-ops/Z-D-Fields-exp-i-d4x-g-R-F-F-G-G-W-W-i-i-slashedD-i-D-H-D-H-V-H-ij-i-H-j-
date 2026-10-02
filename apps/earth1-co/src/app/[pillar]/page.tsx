import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlackHoleSimulator } from "@/components/BlackHoleSimulator";
import { DNAHelix } from "@/components/DNAHelix";
import { PeriodicTable } from "@/components/PeriodicTable";
import { SolarSystem } from "@/components/SolarSystem";
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
        <div className="mt-16 w-full max-w-4xl space-y-16 text-left">
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

              {/* Interactive visualizations */}
              <div className="mt-8">
                {area.id === "chemistry" && <PeriodicTable />}
                {area.id === "biology" && <DNAHelix />}
                {area.id === "physics" && (
                  <div className="space-y-12">
                    <div>
                      <h3 className="text-sm font-light tracking-[0.08em] uppercase text-white/70 mb-4">
                        Orbital mechanics
                      </h3>
                      <SolarSystem />
                    </div>
                    <div>
                      <h3 className="text-sm font-light tracking-[0.08em] uppercase text-white/70 mb-4">
                        Black hole simulator
                      </h3>
                      <BlackHoleSimulator />
                    </div>
                  </div>
                )}
              </div>

              <a
                href={area.reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block border-b border-white/40 pb-0.5 text-xs tracking-[0.08em] text-white/70 hover:text-white"
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
