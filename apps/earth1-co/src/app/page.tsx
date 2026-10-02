import type { Metadata } from "next";
import Link from "next/link";

import { CiceroPassage } from "@/components/CiceroPassage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

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

      {/* Mission */}
      <section className="mb-[30svh]">
        <h2 className="font-display text-[1.2rem] leading-[1.5] tracking-[0.12em] uppercase sm:text-3xl lg:text-4xl">
          {site.focus}
        </h2>
        <p className="mt-6 max-w-lg text-sm font-light tracking-[0.08em] text-white/70 sm:text-base">
          Global citizenship for all.
        </p>
      </section>

      <div className="mt-[30svh] w-full text-left font-serif">
        <CiceroPassage />

        {/* Research Question Section */}
        <section
          aria-labelledby="current-research-heading"
          className="mx-auto mt-32 max-w-[92rem] pb-16"
        >
          <h2 id="current-research-heading" className="text-center text-2xl sm:text-3xl">
            Current Research
          </h2>
          <div className="mx-auto mt-10 max-w-[70ch] rounded-sm border border-white/10 bg-white/5 p-6 text-base leading-relaxed">
            <p>
              Can physics-informed neural networks and quantum algorithms solve
              differential equations more efficiently than classical methods?
            </p>
            <div className="mt-6 flex gap-4 justify-center">
              <Link
                href="/research"
                className="inline-block rounded-sm border border-white/20 px-4 py-2 text-sm font-light tracking-[0.08em] uppercase hover:bg-white/5 transition-colors"
              >
                View Research
              </Link>
              <Link
                href="/lab-notes"
                className="inline-block rounded-sm border border-white/20 px-4 py-2 text-sm font-light tracking-[0.08em] uppercase hover:bg-white/5 transition-colors"
              >
                Lab Notes
              </Link>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section
          aria-labelledby="navigate-heading"
          className="mx-auto mt-32 max-w-[92rem] pb-16"
        >
          <h2 id="navigate-heading" className="sr-only">
            Navigation
          </h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            <Link
              href="/research"
              className="block rounded-sm border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
            >
              <span className="text-xs font-light tracking-[0.08em] text-white/50 uppercase">
                Research
              </span>
              <span className="block mt-2 text-sm">Projects</span>
            </Link>
            <Link
              href="/papers"
              className="block rounded-sm border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
            >
              <span className="text-xs font-light tracking-[0.08em] text-white/50 uppercase">
                Research
              </span>
              <span className="block mt-2 text-sm">Papers</span>
            </Link>
            <Link
              href="/notebooks"
              className="block rounded-sm border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
            >
              <span className="text-xs font-light tracking-[0.08em] text-white/50 uppercase">
                Code
              </span>
              <span className="block mt-2 text-sm">Notebooks</span>
            </Link>
            <Link
              href="/learn"
              className="block rounded-sm border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-colors"
            >
              <span className="text-xs font-light tracking-[0.08em] text-white/50 uppercase">
                Education
              </span>
              <span className="block mt-2 text-sm">Learn</span>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
