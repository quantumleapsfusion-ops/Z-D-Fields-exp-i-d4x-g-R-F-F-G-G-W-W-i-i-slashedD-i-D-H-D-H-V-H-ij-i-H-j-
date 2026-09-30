import type { Metadata } from "next";
import { notFound } from "next/navigation";

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
    </>
  );
}
