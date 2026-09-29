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
        employee: site.people.map((p) => ({
          "@type": "Person",
          name: p.name,
          jobTitle: p.role,
          email: p.email,
        })),
        contactPoint: site.people.map((p) => ({
          "@type": "ContactPoint",
          contactType: p.role,
          email: p.email,
          availableLanguage: "en",
        })),
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
    <div className="relative h-svh min-h-[560px] overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Cosmos className="absolute inset-0 h-full w-full touch-manipulation" />

      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-3 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 sm:pt-7">
        <Logo size={30} brand="earth1" title={site.org} />
        <span className="wordmark text-[0.72rem] sm:text-xs">{site.org}</span>
      </header>

      <main className="pointer-events-none absolute inset-x-0 bottom-[22%] flex flex-col items-center px-6 text-center sm:bottom-[18%]">
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
          <div aria-hidden="true" className="rainbow-rule mx-auto mt-6 w-40 opacity-70" />
          <figcaption className="text-chalk/70 mt-5 font-sans text-sm tracking-wide sm:text-base">
            {site.quote.english}
            <span className="label mt-3 block">
              {site.quote.author} · {site.quote.source}
            </span>
          </figcaption>
        </figure>
      </main>

      <footer className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] font-sans text-xs sm:flex-row sm:justify-center sm:gap-8 sm:pb-7 sm:text-sm">
        {site.people.map((p) => (
          <a
            key={p.email}
            href={`mailto:${p.email}`}
            className="text-dust hover:text-chalk transition-colors"
          >
            <span className="text-chalk/90">{p.name}</span>
            <span className="mx-2 opacity-50">·</span>
            {p.role}
            <span className="mx-2 opacity-50">·</span>
            {p.email}
          </a>
        ))}
      </footer>
    </div>
  );
}
