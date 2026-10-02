import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { learn, type LearnSlug } from "@/lib/learn";

type Props = { params: Promise<{ section: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return learn.map((s) => ({ section: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  const page = learn.find((s) => s.slug === section);
  if (!page) return {};
  return {
    title: `${page.title} | Learn`,
    description: page.line,
    alternates: { canonical: `/learn/${page.slug}` },
  };
}

export default async function LearnPage({ params }: Props) {
  const { section } = await params;
  const page = learn.find((s) => s.slug === section);
  if (!page) notFound();

  return (
    <>
      <div className="mb-12">
        <Link
          href="/learn"
          className="text-sm font-light tracking-[0.08em] text-white/50 hover:text-white/70 transition-colors"
        >
          ← Back to Learn
        </Link>
      </div>

      <h1 className="font-display text-xl tracking-[0.2em] uppercase sm:text-4xl">
        {page.title}
      </h1>
      <p className="mt-6 max-w-md text-sm font-light tracking-[0.08em] text-white/70 sm:text-base">
        {page.line}
      </p>

      <div className="mt-12 max-w-3xl text-left">
        <p className="text-white/50 text-sm font-light">
          Content for {page.title} coming soon.
        </p>
      </div>
    </>
  );
}
