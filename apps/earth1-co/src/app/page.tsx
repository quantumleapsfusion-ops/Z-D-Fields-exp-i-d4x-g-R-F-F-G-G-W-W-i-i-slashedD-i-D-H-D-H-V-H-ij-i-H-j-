import type { Metadata } from "next";
import { Logo } from "@earth-one/ui";

import { Cosmos } from "@/components/Cosmos";
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
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Cosmos className="fixed inset-0 h-full w-full touch-manipulation" />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 sm:pt-7">
        <Logo size={30} brand="earth1" title={site.org} />
        <span className="wordmark text-[0.72rem] sm:text-xs">{site.org}</span>
      </header>

      <main className="pointer-events-none relative">
        <section className="flex h-svh min-h-[560px] flex-col items-center justify-end px-6 pb-[20svh] text-center sm:pb-[16svh]">
          <h1 className="sr-only">
            {site.org}: {site.focus}
          </h1>
          <figure>
            <blockquote
              lang="la"
              className="font-display silver-text text-[2.1rem] leading-[1.05] tracking-tight italic drop-shadow-[0_0_30px_rgba(160,180,255,0.25)] sm:text-6xl lg:text-7xl"
            >
              {site.quote.latin}
            </blockquote>
            <div
              aria-hidden="true"
              className="rainbow-rule mx-auto mt-6 w-40 opacity-70"
            />
            <figcaption className="text-chalk/70 mt-5 font-sans text-sm tracking-wide sm:text-base">
              {site.quote.english}
              <span className="label mt-3 block">
                {site.quote.author} · {site.quote.source}
              </span>
            </figcaption>
          </figure>
        </section>

        <section
          aria-labelledby="founder"
          className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-transparent via-black/70 to-black/80 px-6 py-24 text-center"
        >
          <p className="label">{site.founder.role}</p>
          <h2
            id="founder"
            className="font-display silver-text mt-4 text-4xl tracking-tight sm:text-6xl"
          >
            {site.founder.name}
          </h2>
          <div aria-hidden="true" className="rainbow-rule mx-auto mt-6 w-24 opacity-70" />
          <figure className="mt-10 max-w-2xl">
            <blockquote className="font-display text-chalk text-2xl leading-snug italic sm:text-4xl">
              “{site.founder.inspiration.text}”
            </blockquote>
            <figcaption className="label mt-4">
              {site.founder.inspiration.author}
            </figcaption>
          </figure>
          <div className="text-chalk/80 mt-10 max-w-xl space-y-4 font-sans text-base leading-relaxed sm:text-lg">
            {site.founder.story.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <a
            href={`mailto:${site.founder.email}`}
            className="border-line text-chalk hover:bg-chalk/10 pointer-events-auto mt-12 rounded-full border px-6 py-3 font-sans text-sm tracking-wide backdrop-blur transition-colors"
          >
            {site.founder.email}
          </a>
        </section>
      </main>
    </div>
  );
}
