import type { Metadata } from "next";

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
        knowsAbout: ["Global citizenship", "Data sovereignty", "Free speech", "Privacy"],
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

      <header className="absolute inset-x-0 top-0 z-10 px-6 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-10 sm:pt-8">
        <span className="label">{site.org}</span>
      </header>

      <main>
        <section className="flex min-h-svh flex-col items-center justify-center px-6 py-24 text-center">
          <h1 className="sr-only">
            {site.org}: {site.focus}
          </h1>
          <figure>
            <blockquote
              lang="la"
              className="font-display text-[1.35rem] leading-[1.5] tracking-[0.12em] uppercase sm:text-4xl lg:text-5xl"
            >
              {site.quote.latin}
            </blockquote>
            <figcaption className="label mt-8">
              {site.quote.english}
              <span className="mt-3 block text-white/40">{site.quote.author}</span>
            </figcaption>
          </figure>
        </section>

        <section
          aria-labelledby="founder"
          className="flex min-h-svh flex-col items-center justify-center px-6 py-24 text-center"
        >
          <h2
            id="founder"
            className="font-display text-lg tracking-[0.2em] uppercase sm:text-2xl"
          >
            {site.founder.name}
          </h2>
          <p className="label mt-3">{site.founder.role}</p>
          <figure className="mt-16">
            <blockquote className="text-base font-light tracking-[0.08em] sm:text-xl">
              {site.founder.inspiration.text}
            </blockquote>
            <figcaption className="label mt-3 text-white/40">
              {site.founder.inspiration.author}
            </figcaption>
          </figure>
          <a
            href={`mailto:${site.founder.email}`}
            className="label mt-16 border-b border-white/30 pb-1 text-white transition-colors hover:border-white"
          >
            {site.founder.email}
          </a>
        </section>
      </main>
    </>
  );
}
