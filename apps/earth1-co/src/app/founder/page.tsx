import type { Metadata } from "next";

import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Founder",
  description: `${site.founder.name}, ${site.founder.role} of ${site.org}.`,
  alternates: { canonical: "/founder" },
  openGraph: {
    title: `Founder — ${site.name}`,
    description: `${site.founder.name}, ${site.founder.role} of ${site.org}.`,
    url: "/founder",
  },
};

export default function FounderPage() {
  return (
    <>
      <h1 className="font-display text-lg tracking-[0.2em] uppercase sm:text-2xl">
        {site.founder.name}
      </h1>
      <p className="label mt-3">{site.founder.role}</p>
      <figure className="mt-10">
        <blockquote className="text-base font-light tracking-[0.08em] sm:text-xl">
          {site.founder.inspiration.text}
        </blockquote>
        <figcaption className="label mt-3 text-white/40">
          {site.founder.inspiration.author}
        </figcaption>
      </figure>
      <a
        href={`mailto:${site.founder.email}`}
        className="label mt-10 border-b border-white/30 pb-1 text-white transition-colors hover:border-white"
      >
        {site.founder.email}
      </a>
    </>
  );
}
