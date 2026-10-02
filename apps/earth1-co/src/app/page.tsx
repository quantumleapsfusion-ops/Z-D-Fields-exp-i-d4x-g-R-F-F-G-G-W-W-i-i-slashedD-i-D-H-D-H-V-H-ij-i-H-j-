import type { Metadata } from "next";

import Link from "next/link";

import { CiceroPassage } from "@/components/CiceroPassage";
import { Tex } from "@/components/Tex";
import { equations } from "@/lib/library/equations";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Equations that orbit the passage: three on each side on wide screens, a ring above and below on narrow ones. */
const HALO = {
  left: ["planck-relation", "schrodinger", "uncertainty"],
  right: ["de-broglie", "bell-state", "dirac"],
};

const FEATURED = [
  "planck-relation",
  "schrodinger",
  "uncertainty",
  "bell-state",
  "qubit",
  "shor",
];

function byId(id: string) {
  const e = equations.find((q) => q.id === id);
  if (!e) throw new Error(`Unknown equation ${id}`);
  return e;
}

function Halo({ ids, side }: { ids: string[]; side: "left" | "right" }) {
  return (
    <ul
      aria-label={`Equations, ${side}`}
      className={`halo flex flex-wrap justify-center gap-x-8 gap-y-5 lg:flex-col lg:justify-between lg:gap-0 ${
        side === "left" ? "lg:items-end lg:text-right" : "lg:items-start lg:text-left"
      }`}
    >
      {ids.map((id, i) => {
        const e = byId(id);
        return (
          <li key={id} className="fade-in" style={{ animationDelay: `${i * 120}ms` }}>
            <Link
              href={`/equations#${id}`}
              className="group block rounded-sm px-2 py-1 transition-colors hover:text-white focus-visible:text-white"
            >
              {e.tex ? (
                <Tex
                  tex={e.tex}
                  label={`${e.name}: ${e.formula}`}
                  className="text-xl sm:text-2xl"
                />
              ) : (
                <span className="text-xl italic sm:text-2xl">{e.formula}</span>
              )}
              <span className="label mt-1 block text-[0.6rem] text-white/40 transition-colors group-hover:text-white/70">
                {e.name}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

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
        logo: {
          "@type": "ImageObject",
          url: `${site.url}/icon.png`,
          width: 512,
          height: 512,
        },
        image: `${site.url}/opengraph-image.png`,
        description: site.description,
        slogan: site.motto,
        sameAs: [site.e14.url],
        brand: {
          "@type": "Brand",
          name: site.e14.name,
          alternateName: site.e14.tagline,
          description: site.e14.line,
          url: site.e14.url,
        },
        knowsAbout: [
          ...site.pillars.map((p) => p.title),
          "Quantum mechanics",
          "Quantum computing",
        ],
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
      <p className="label fade-in text-white/80">{site.motto}</p>

      <section
        aria-label="Cicero, De Finibus, with the equations of quantum mechanics"
        className="mt-[18svh] w-full text-left font-serif"
      >
        <div className="mx-auto grid max-w-[110rem] gap-12 lg:grid-cols-[minmax(12rem,1fr)_minmax(0,64rem)_minmax(12rem,1fr)] lg:gap-10">
          <Halo ids={HALO.left} side="left" />
          <CiceroPassage />
          <Halo ids={HALO.right} side="right" />
        </div>
      </section>

      <figure className="mx-auto mt-28 max-w-[40ch]">
        <blockquote
          lang="la"
          className="font-display text-base leading-[1.6] tracking-[0.12em] uppercase sm:text-xl"
        >
          {site.quote.latin}
        </blockquote>
        <figcaption className="label mt-5">
          {site.quote.english}
          <span className="mt-3 block text-white/40">
            {site.quote.author}, {site.quote.source}
          </span>
        </figcaption>
      </figure>

      <section
        aria-labelledby="equations-heading"
        className="mx-auto mt-32 w-full max-w-[92rem] pb-16 font-serif"
      >
        <h2 id="equations-heading" className="text-center text-2xl sm:text-3xl">
          Equations
        </h2>
        <ul className="mx-auto mt-10 grid max-w-[70ch] gap-px sm:grid-cols-2">
          {FEATURED.map((id) => {
            const e = byId(id);
            return (
              <li key={id}>
                <Link
                  href={`/equations#${id}`}
                  className="block h-full border border-white/15 px-5 py-6 transition-colors hover:border-white/60"
                >
                  {e.tex ? (
                    <Tex
                      tex={e.tex}
                      label={`${e.name}: ${e.formula}`}
                      className="block text-2xl sm:text-3xl"
                    />
                  ) : (
                    <span className="block text-2xl italic sm:text-3xl">{e.formula}</span>
                  )}
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
    </>
  );
}
