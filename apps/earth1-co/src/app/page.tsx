import type { Metadata } from "next";

import Link from "next/link";

import { CiceroPassage } from "@/components/CiceroPassage";
import { equations } from "@/lib/library/equations";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const FEATURED = [
  "planck-relation",
  "schrodinger",
  "uncertainty",
  "bell-state",
  "qubit",
  "shor",
];

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#org`,
        name: site.org,
        alternateName: site.name,
        url: site.url,
        logo: `${site.url}/icon.png`,
        description: site.description,
        knowsAbout: site.pillars.map((p) => p.title),
        founder: {
          "@type": "Person",
          name: site.founder.name,
          jobTitle: site.founder.role,
          email: site.founder.email,
        },
        email: site.founder.email,
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.org,
        url: site.url,
        description: site.description,
        inLanguage: "en",
        publisher: { "@id": `${site.url}/#org` },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <h1 className="sr-only">
        {site.org}: {site.focus}
      </h1>
      <figure>
        <blockquote
          lang="la"
          className="font-display text-[1.2rem] leading-[1.5] tracking-[0.12em] uppercase sm:text-3xl lg:text-4xl"
        >
          {site.quote.latin}
        </blockquote>
        <figcaption className="label mt-6">
          {site.quote.english}
          <span className="mt-3 block text-white/40">{site.quote.author}</span>
        </figcaption>
      </figure>

      <div className="mt-[30svh] w-full text-left font-serif">
        <CiceroPassage />

        <section
          aria-labelledby="equations-heading"
          className="mx-auto mt-32 max-w-[92rem] pb-16"
        >
          <h2 id="equations-heading" className="text-center text-2xl sm:text-3xl">
            Equations
          </h2>
          <ul className="mx-auto mt-10 grid max-w-[70ch] gap-px sm:grid-cols-2">
            {FEATURED.map((id) => {
              const e = equations.find((q) => q.id === id)!;
              return (
                <li key={id}>
                  <Link
                    href={`/equations#${id}`}
                    className="block h-full border border-white/15 px-5 py-6 transition-colors hover:border-white/60"
                  >
                    <span className="block text-2xl italic sm:text-3xl">{e.formula}</span>
                    <span className="label mt-3 block">{e.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-8 text-center">
            <Link
              href="/equations"
              className="label border-b border-white/30 pb-1 hover:text-white"
            >
              All equations, explained
            </Link>
          </p>
        </section>
      </div>
    </>
  );
}
